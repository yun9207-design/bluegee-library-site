'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { gzipSync } = require('node:zlib');
const { createHash } = require('node:crypto');
const { createGuideHandler } = require('../server/guide-handler.cjs');
const { products } = require('../content/products.json');
async function listen(server) {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return 'http://127.0.0.1:' + server.address().port;
}
test('Public reading serves all 80 without Auth; DB flag, private fallback and integrity remain enforced', async () => {
  const visible = new Set(products.map(p => p.id));
  let authRequests = 0; let corrupt = false;
  const upstream = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://fixture.invalid');
    response.setHeader('Content-Type', 'application/json');
    if (url.pathname.startsWith('/auth/')) { authRequests++; response.writeHead(401); response.end('{}'); return; }
    assert.equal(url.pathname, '/rest/v1/library_guide_contents');
    assert.equal(url.searchParams.get('public_readable'), 'eq.true');
    const id = (url.searchParams.get('product_id') ?? '').slice(3);
    const bytes = Buffer.from('<!doctype html><html><body>PUBLIC_FIXTURE_' + id + '</body></html>');
    response.end(JSON.stringify(!visible.has(id) ? [] : url.searchParams.get('select') === 'public_readable' ? [{ public_readable: true }] : [{ html_gzip_base64: gzipSync(bytes).toString('base64'), sha256: corrupt ? '0'.repeat(64) : createHash('sha256').update(bytes).digest('hex'), byte_length: bytes.length }]));
  });
  const project = await listen(upstream);
  const server = http.createServer(createGuideHandler({ environment: { SUPABASE_URL: project, SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_fixture_only' } }));
  const base = await listen(server);
  try {
    for (const p of products) {
      const response = await fetch(base + '/api/guide?id=' + p.id + '&public=1');
      assert.equal(response.status, 200);
      const body = await response.json();
      assert.equal(body.productId, p.id); assert.ok(body.html.includes('PUBLIC_FIXTURE_' + p.id));
      assert.match(response.headers.get('cache-control'), /no-store/);
    }
    assert.equal(authRequests, 0);
    assert.equal((await fetch(base + '/api/guide?id=audio-050&public=1', { method: 'HEAD' })).status, 200);
    visible.delete('audio-050');
    assert.equal((await fetch(base + '/api/guide?id=audio-050&public=1')).status, 401);
    assert.equal((await fetch(base + '/api/guide?id=audio-050&public=1', { method: 'HEAD' })).status, 401);
    assert.equal((await fetch(base + '/api/guide?id=audio-001')).status, 401);
    assert.equal((await fetch(base + '/api/guide?id=audio-081&public=1')).status, 404);
    corrupt = true;
    const bad = await fetch(base + '/api/guide?id=audio-001&public=1');
    assert.equal(bad.status, 503); assert.ok(!(await bad.text()).includes('PUBLIC_FIXTURE'));
  } finally { await Promise.all([new Promise(resolve => server.close(resolve)), new Promise(resolve => upstream.close(resolve))]); }
});
