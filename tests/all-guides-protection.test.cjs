'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { gzipSync } = require('node:zlib');
const { createHash } = require('node:crypto');
const { createGuideHandler } = require('../server/guide-handler.cjs');
const { loadMaster, validateAndEnrich, ROOT } = require('../scripts/catalog-data.cjs');
const { renderProtectedShell } = require('../scripts/protected-build.cjs');
const data = loadMaster();
const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmaXh0dXJlIn0.test-only-signature';
/** @param {http.Server} server */
async function listen(server) {
  await new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(undefined)));
  const address = server.address();
  if (!address || typeof address === 'string') { throw new Error('No address'); }
  return 'http://127.0.0.1:' + address.port;
}

test('80 protected public shells preserve original URLs, descriptions, 2,087 TOCs and U47 classification', () => {
  assert.equal(data.products.length, 80);
  assert.equal(data.products.reduce((n,p)=>n+p.chapters.length,0),2087);
  for (const p of data.products) {
    assert.equal(p.access,'entitlement'); assert.ok(p.htmlPath); assert.equal(p.pdfPath,null);
    const shell=renderProtectedShell(p);
    for (const prefix of ['','dist/']) { assert.equal(fs.readFileSync(path.join(ROOT,prefix+p.htmlPath),'utf8').replace(/\r\n/gu,'\n'),shell); }
    assert.ok(!shell.includes('class="audio-guide-chapter') && !shell.includes('html_gzip_base64'));
    assert.ok(shell.includes(p.id));
  }
  const u47=data.products.find(p=>p.id==='audio-050');
  assert.equal(u47?.category,'microphone');
  const raw=JSON.parse(fs.readFileSync(path.join(ROOT,'content/products.json'),'utf8'));
  raw.products[0].access='public';
  assert.throws(()=>validateAndEnrich(raw),/cannot become a public original/u);
});

test('Common API denies anonymous/no-rights requests and isolates entitlements across all 80 product IDs', async () => {
  let queries=0;
  /** @type {Set<string>} */
  const grants=new Set();
  /** @type {string[]} */
  const passwords=[];
  const upstream=http.createServer((request,response)=>{
    const url=new URL(request.url??'/','http://fixture.invalid');
    queries++; response.setHeader('Content-Type','application/json');
    assert.equal(request.headers.authorization,'Bearer '+token);
    if(url.pathname==='/auth/v1/token'){ passwords.push(url.pathname); }
    if(url.pathname==='/auth/v1/user'){ response.end(JSON.stringify({id:'verified-user'})); return; }
    const id=(url.searchParams.get('product_id')??'').slice(3);
    assert.ok(data.products.some(p=>p.id===id));
    if(url.pathname==='/rest/v1/library_entitlements'){
      assert.equal(url.searchParams.get('user_id'),'eq.verified-user');
      response.end(JSON.stringify(grants.has(id)?[{access_type:'html',granted_at:'2026-01-01',expires_at:null}]:[])); return;
    }
    if(url.pathname==='/rest/v1/library_guide_contents'){
      assert.ok(grants.has(id));
      const bytes=Buffer.from('<!doctype html><html><body>PRIVATE_FIXTURE_'+id+'</body></html>');
      response.end(JSON.stringify([{html_gzip_base64:gzipSync(bytes).toString('base64'),sha256:createHash('sha256').update(bytes).digest('hex'),byte_length:bytes.length}])); return;
    }
    response.writeHead(404); response.end('{}');
  });
  const project=await listen(upstream);
  const server=http.createServer(createGuideHandler({environment:{SUPABASE_URL:project,SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fixture_only'}}));
  const base=await listen(server);
  try {
    for(const p of data.products){ assert.equal((await fetch(base+'/api/guide?id='+p.id)).status,401); }
    assert.equal(queries,0);
    for(const p of data.products){ const r=await fetch(base+'/api/guide?id='+p.id,{headers:{Authorization:'Bearer '+token}}); assert.equal(r.status,403); assert.ok(!(await r.text()).includes('PRIVATE_FIXTURE')); }
    for(const p of data.products){
      grants.clear(); grants.add(p.id);
      const r=await fetch(base+'/api/guide?id='+p.id+'&user_id=attacker',{headers:{Authorization:'Bearer '+token}});
      assert.equal(r.status,200); const body=await r.json();
      assert.equal(body.productId,p.id); assert.ok(body.html.includes('PRIVATE_FIXTURE_'+p.id));
      assert.match(r.headers.get('cache-control')??'',/no-store/u);
    }
    grants.clear(); grants.add('audio-001');
    assert.equal((await fetch(base+'/api/guide?id=audio-080',{headers:{Authorization:'Bearer '+token}})).status,403);
    assert.equal((await fetch(base+'/api/guide?id=audio-999',{headers:{Authorization:'Bearer '+token}})).status,404);
    assert.equal((await fetch(base+'/api/guide?id=audio-001&access_token='+token)).status,400);
    assert.deepEqual(passwords,[]);
  } finally { await Promise.all([new Promise(resolve=>server.close(()=>resolve(undefined))),new Promise(resolve=>upstream.close(()=>resolve(undefined)))]); }
});
