'use strict';
const { createClient } = require('@supabase/supabase-js');
const { gunzipSync } = require('node:zlib');
const { createHash } = require('node:crypto');
// The product master is the single allowlist; content bodies never enter this bundle.
const { products } = require('../content/products.json');
const protectedIds = new Set(products.filter(p => p.status === 'published' && p.access === 'entitlement' && p.htmlPath).map(p => p.id));
/** @typedef {import('node:http').IncomingMessage} Request */
/** @typedef {import('node:http').ServerResponse} Response */
/** @param {Response} response @param {number} status @param {unknown} body @param {boolean} head */
function send(response, status, body, head) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(head ? undefined : JSON.stringify(body));
}
/** Injectable factory is used only by isolated tests, never selected by request data.
 * @param {{environment?:Record<string,string|undefined>, create?:typeof createClient, now?:()=>number}} [options] */
function createGuideHandler({ environment = process.env, create = createClient, now = Date.now } = {}) {
  /** @param {Request} request @param {Response} response */
  return async function handler(request, response) {
    const head = request.method === 'HEAD';
    response.setHeader('Cache-Control', 'private, no-store, max-age=0');
    response.setHeader('CDN-Cache-Control', 'no-store');
    response.setHeader('Vercel-CDN-Cache-Control', 'no-store');
    response.setHeader('Vary', 'Authorization');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'no-referrer');
    if (request.method !== 'GET' && !head) { response.setHeader('Allow', 'GET, HEAD'); send(response, 405, { code: 'method_not_allowed' }, head); return; }
    const url = new URL(request.url ?? '/', 'https://library.invalid');
    const productId = url.searchParams.get('id');
    if (!productId || !protectedIds.has(productId)) { send(response, 404, { code: 'guide_not_found' }, head); return; }
    if (url.searchParams.has('token') || url.searchParams.has('access_token')) { send(response, 400, { code: 'use_authorization_header' }, head); return; }
    // A public request is permitted only by the administrator-controlled DB flag + RLS.
    const publicRead = url.searchParams.get('public') === '1';
    const auth = request.headers.authorization;
    if (!publicRead && (typeof auth !== 'string' || !/^Bearer [A-Za-z0-9._-]{20,8192}$/u.test(auth))) { send(response, 401, { code: 'login_required' }, head); return; }
    const project = environment.SUPABASE_URL;
    const key = environment.SUPABASE_PUBLISHABLE_KEY;
    if (!project || !key || !/^sb_publishable_[a-zA-Z0-9_-]+$/u.test(key)) { send(response, 503, { code: 'configuration_unavailable' }, head); return; }
    try {
      const client = create(project, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, global: { headers: publicRead ? {} : { Authorization: auth ?? '' }, fetch: (input, init) => fetch(input, { ...init, cache: 'no-store', signal: AbortSignal.timeout(10000) }) } });
      if (!publicRead) {
        // Verify remotely; decoded browser claims/getSession are never authorization proof.
        const verified = await client.auth.getUser((auth ?? '').slice(7));
        if (verified.error || !verified.data.user || verified.data.user.is_anonymous) { send(response, 401, { code: 'login_required' }, head); return; }
        const rights = await client.from('library_entitlements').select('access_type,granted_at,expires_at').eq('user_id', verified.data.user.id).eq('product_id', productId).in('access_type', ['html', 'all']);
        if (rights.error) { send(response, 503, { code: 'authorization_unavailable' }, head); return; }
        const active = rights.data?.some(e => Number.isFinite(Date.parse(e.granted_at)) && Date.parse(e.granted_at) <= now() && (e.expires_at === null || (Number.isFinite(Date.parse(e.expires_at)) && Date.parse(e.expires_at) > now())));
        if (!active) { send(response, 403, { code: 'entitlement_required' }, head); return; }
        if (head) { send(response, 200, null, true); return; }
      }
      if (publicRead && head) {
        const visibility = await client.from('library_guide_contents').select('public_readable').eq('product_id', productId).eq('public_readable', true).maybeSingle();
        if (visibility.error) { send(response, 503, { code: 'content_unavailable' }, true); return; }
        send(response, visibility.data ? 200 : 401, visibility.data ? null : { code: 'login_required' }, true); return;
      }
      // RLS checks either the explicit public flag or the user's live entitlement.
      let query = client.from('library_guide_contents').select('html_gzip_base64,sha256,byte_length').eq('product_id', productId);
      if (publicRead) { query = query.eq('public_readable', true); }
      const result = await query.maybeSingle();
      if (result.error) { send(response, 503, { code: 'content_unavailable' }, head); return; }
      if (!result.data) { send(response, publicRead ? 401 : 403, { code: publicRead ? 'login_required' : 'entitlement_required' }, head); return; }
      const bytes = gunzipSync(Buffer.from(result.data.html_gzip_base64, 'base64'), { maxOutputLength: 2000000 });
      if (bytes.length !== result.data.byte_length || createHash('sha256').update(bytes).digest('hex') !== result.data.sha256) { send(response, 503, { code: 'content_integrity_error' }, head); return; }
      send(response, 200, { productId, html: bytes.toString('utf8'), sha256: result.data.sha256 }, head);
    } catch { send(response, 503, { code: 'content_unavailable' }, head); }
  };
}
module.exports = { createGuideHandler };
