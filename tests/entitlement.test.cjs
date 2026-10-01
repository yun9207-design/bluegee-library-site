'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { gzipSync } = require('node:zlib');
const { createHash } = require('node:crypto');
const { createGuideHandler } = require('../server/guide-handler.cjs');
const { loadMaster, ROOT } = require('../scripts/catalog-data.cjs');
const { renderProtectedShell } = require('../scripts/protected-build.cjs');
const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmaXh0dXJlIn0.test-only-signature';
const original = '<!doctype html><html><head><title>Private fixture</title></head><body>PRIVATE_FIXTURE_BODY</body></html>';
const bytes = Buffer.from(original);
const content = { html_gzip_base64: gzipSync(bytes).toString('base64'), sha256: createHash('sha256').update(bytes).digest('hex'), byte_length: bytes.length };
/** @param {http.Server} server */
async function start(server) {
  await new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(undefined)));
  const address = server.address();
  if (!address || typeof address === 'string') { throw new Error('No test address'); }
  return 'http://127.0.0.1:' + address.port;
}
/** Real pinned SDK with a loopback-only protocol fixture; zero password login requests.
 * @param {{authError?:boolean,entitlements?:unknown[],rightsError?:boolean,contentError?:boolean,noContent?:boolean,corrupt?:boolean,anonymous?:boolean}} [options] */
async function fixture(options = {}) {
  /** @type {string[]} */
  const paths = [];
  const upstream = http.createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://test.invalid'); paths.push(url.pathname);
    response.setHeader('Content-Type', 'application/json');
    if (url.pathname === '/auth/v1/user') {
      response.statusCode = options.authError ? 401 : 200;
      response.end(JSON.stringify(options.authError ? { msg: 'Invalid JWT' } : { id: 'trusted-user-id', is_anonymous: options.anonymous ?? false }));
    } else if (url.pathname === '/rest/v1/library_entitlements') {
      assert.equal(url.searchParams.get('user_id'), 'eq.trusted-user-id');
      assert.equal(url.searchParams.get('product_id'), 'eq.audio-050');
      response.statusCode = options.rightsError ? 500 : 200;
      response.end(JSON.stringify(options.rightsError ? { message: 'Unavailable' } : options.entitlements ?? [{ access_type: 'html', granted_at: '2026-01-01T00:00:00Z', expires_at: null }]));
    } else if (url.pathname === '/rest/v1/library_guide_contents') {
      response.statusCode = options.contentError ? 500 : 200;
      response.end(JSON.stringify(options.contentError ? { message: 'Unavailable' } : options.noContent ? [] : [{ ...content, sha256: options.corrupt ? '0'.repeat(64) : content.sha256 }]));
    } else { response.statusCode = 404; response.end('{}'); }
  });
  const project = await start(upstream);
  const server = http.createServer(createGuideHandler({ environment: { SUPABASE_URL: project, SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_fixture_only' }, now: () => Date.parse('2026-10-01T12:00:00Z') }));
  const base = await start(server);
  return { base, paths, close: async () => { await Promise.all([new Promise(resolve => server.close(() => resolve(undefined))), new Promise(resolve => upstream.close(() => resolve(undefined)))]); } };
}

test('Logged-out and malformed credentials fail closed without querying Supabase', async () => {
  const f = await fixture();
  try {
    for (const auth of ['', 'Bearer invalid', 'Basic ABC']) {
      const response = await fetch(f.base + '/api/guide?id=audio-050', { headers: auth ? { Authorization: auth } : {} });
      assert.equal(response.status, 401); assert.equal((await response.json()).code, 'login_required');
      assert.match(response.headers.get('cache-control') ?? '', /no-store/u);
    }
    assert.deepEqual(f.paths, []);
  } finally { await f.close(); }
});

test('A forged/invalid JWT is verified remotely and cannot reach entitlements or content', async () => {
  const f = await fixture({ authError: true });
  try {
    const response = await fetch(f.base + '/api/guide?id=audio-050&user_id=someone-else', { headers: { Authorization: 'Bearer ' + jwt } });
    assert.equal(response.status, 401); assert.deepEqual(f.paths, ['/auth/v1/user']);
  } finally { await f.close(); }
});

test('Anonymous Auth identities cannot use a paid guide', async () => {
  const f = await fixture({ anonymous: true });
  try { assert.equal((await fetch(f.base + '/api/guide?id=audio-050', { headers: { Authorization: 'Bearer ' + jwt } })).status, 401); }
  finally { await f.close(); }
});

test('A verified user without entitlement receives 403 before any body query', async () => {
  const f = await fixture({ entitlements: [] });
  try {
    const response = await fetch(f.base + '/api/guide?id=audio-050', { headers: { Authorization: 'Bearer ' + jwt } });
    assert.equal(response.status, 403); assert.ok(!(await response.text()).includes('PRIVATE_FIXTURE_BODY'));
    assert.equal(f.paths.includes('/rest/v1/library_guide_contents'), false);
  } finally { await f.close(); }
});

test('Expired, future and invalid-date grants do not authorize content', async () => {
  for (const grant of [
    { access_type: 'html', granted_at: '2026-01-01', expires_at: '2026-09-30' },
    { access_type: 'html', granted_at: '2026-11-01', expires_at: null },
    { access_type: 'html', granted_at: 'bad-date', expires_at: null },
    { access_type: 'html', granted_at: '2026-01-01', expires_at: 'bad-date' },
  ]) {
    const f = await fixture({ entitlements: [grant] });
    try { assert.equal((await fetch(f.base + '/api/guide?id=audio-050', { headers: { Authorization: 'Bearer ' + jwt } })).status, 403); }
    finally { await f.close(); }
  }
});

test('Only active entitlement delivers the complete, integrity-checked body with no cache', async () => {
  const f = await fixture();
  try {
    const response = await fetch(f.base + '/api/guide?id=audio-050&user_id=attacker', { headers: { Authorization: 'Bearer ' + jwt } });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { productId: 'audio-050', html: original, sha256: content.sha256 });
    for (const name of ['cache-control', 'cdn-cache-control', 'vercel-cdn-cache-control']) { assert.match(response.headers.get(name) ?? '', /no-store/u); }
    assert.equal(response.headers.get('vary'), 'Authorization');
    assert.ok(!f.paths.includes('/auth/v1/token'));
  } finally { await f.close(); }
});

test('HEAD verifies access without transferring the guide', async () => {
  const f = await fixture();
  try {
    const response = await fetch(f.base + '/api/guide?id=audio-050', { method: 'HEAD', headers: { Authorization: 'Bearer ' + jwt } });
    assert.equal(response.status, 200); assert.equal(await response.text(), '');
    assert.equal(f.paths.includes('/rest/v1/library_guide_contents'), false);
  } finally { await f.close(); }
});

test('Authorization/data failures, revocation races and corruption fail closed', async () => {
  for (const scenario of [{ rightsError: true }, { contentError: true }, { corrupt: true }, { noContent: true }]) {
    const f = await fixture(scenario);
    try {
      const response = await fetch(f.base + '/api/guide?id=audio-050', { headers: { Authorization: 'Bearer ' + jwt } });
      assert.equal(response.status, scenario.noContent ? 403 : 503);
      assert.ok(!(await response.text()).includes('PRIVATE_FIXTURE_BODY'));
    } finally { await f.close(); }
  }
});

test('Unknown products, URL tokens, or write methods cannot bypass the common route', async () => {
  const f = await fixture();
  try {
    for (const [url, method, expected] of [['?id=audio-999','GET',404], ['?id=../audio-050','GET',404], ['?id=audio-050&access_token=x','GET',400], ['?id=audio-050','POST',405]]) {
      assert.equal((await fetch(f.base + '/api/guide' + url, { method: String(method), headers: { Authorization: 'Bearer ' + jwt } })).status, Number(expected));
    }
    assert.deepEqual(f.paths, []);
  } finally { await f.close(); }
});

test('All public guide URLs contain only lock shells; all 80 entries and 2,087 TOCs remain', () => {
  const data = loadMaster();
  assert.equal(data.products.length, 80);
  assert.equal(data.products.filter(p => p.access === 'entitlement').length, 80);
  assert.equal(data.products.reduce((n,p) => n + p.chapters.length, 0), 2087);
  const u47 = data.products.find(p => p.id === 'audio-050'); assert.ok(u47?.htmlPath);
  const shell = renderProtectedShell(u47);
  for (const prefix of ['', 'dist/']) {
    assert.equal(fs.readFileSync(path.join(ROOT, prefix + u47.htmlPath), 'utf8'), shell);
  }
  assert.ok(!shell.includes('class="audio-guide-chapter') && shell.length < 20000);
  assert.equal(u47.chapters.length, 27);
  assert.equal(u47.category, 'microphone'); assert.equal(u47.series, 'classic-studio-gear');
  for (const product of data.products) {
    assert.ok(product.htmlPath);
    for (const prefix of ['', 'dist/']) { assert.equal(fs.readFileSync(path.join(ROOT, prefix + product.htmlPath), 'utf8'), renderProtectedShell(product)); }
  }
});
