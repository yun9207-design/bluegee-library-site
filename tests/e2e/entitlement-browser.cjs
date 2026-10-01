'use strict';
// Isolated protocol fixture. Never opens a password form or real Auth endpoint.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { gzipSync } = require('node:zlib');
const { createHash } = require('node:crypto');
const { chromium } = require('playwright');
const { createGuideHandler } = require('../../server/guide-handler.cjs');
const { ROOT, loadMaster } = require('../../scripts/catalog-data.cjs');
const data = loadMaster();
const u47 = data.products.find(p => p.id === 'audio-050');
assert.ok(u47?.htmlPath);
const originalPath = process.env.PRIVATE_GUIDE_TEST_PATH ?? path.join(ROOT, '../_maintenance/2026-10-01-entitlement-pilot/audio-050-original.html');
const bytes = fs.readFileSync(originalPath);
const stored = { html_gzip_base64: gzipSync(bytes).toString('base64'), sha256: createHash('sha256').update(bytes).digest('hex'), byte_length: bytes.length };
const user = { id: '00000000-0000-4000-8000-000000000050', email: 'fixture@example.test', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' };
const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmaXh0dXJlIn0.fixture-signature';
let entitled = false;
let passwordRequests = 0;
async function start(server) {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return 'http://127.0.0.1:' + server.address().port;
}
(async () => {
  const upstream = http.createServer((request,response) => {
    const url = new URL(request.url, 'http://test.invalid');
    response.setHeader('Content-Type', 'application/json');
    if (url.pathname === '/auth/v1/token') { passwordRequests++; response.writeHead(400); response.end('{}'); return; }
    if (url.pathname === '/auth/v1/logout') { response.writeHead(204); response.end(); return; }
    if (url.pathname === '/auth/v1/user') { response.end(JSON.stringify(user)); return; }
    if (url.pathname === '/rest/v1/library_entitlements') { response.end(JSON.stringify(entitled ? [{access_type:'html',granted_at:'2026-01-01',expires_at:null}] : [])); return; }
    if (url.pathname === '/rest/v1/library_guide_contents') { response.end(JSON.stringify(entitled ? [stored] : [])); return; }
    response.writeHead(404); response.end('{}');
  });
  const project = await start(upstream);
  const handler = createGuideHandler({environment:{SUPABASE_URL:project,SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fixture_only'}});
  const server = http.createServer((request,response) => {
    const url = new URL(request.url,'http://test.invalid');
    if (url.pathname === '/api/guide') { handler(request,response); return; }
    if (url.pathname === '/auth-config.js') { response.setHeader('Content-Type','text/javascript'); response.end('window.BLUEGEE_AUTH_CONFIG='+JSON.stringify({configured:true,url:project,publishableKey:'sb_publishable_fixture_only'})+';'); return; }
    const file = path.resolve(ROOT,'dist','.'+decodeURIComponent(url.pathname)+(url.pathname.endsWith('/')?'index.html':''));
    const relative = path.relative(path.join(ROOT,'dist'),file);
    if (relative.startsWith('..') || !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end(); return; }
    const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css'};
    response.setHeader('Content-Type',types[path.extname(file)] ?? 'application/octet-stream'); fs.createReadStream(file).pipe(response);
  });
  const base = await start(server);
  const report={scope:'Loopback-only real SDK/server + original U47 HTML; no live login',noSession:false,noEntitlement:false,entitledFullGuide:false,deepLink:false,chapters:0,mobile:false,revocation:false,logoutRemoval:false,passwordRequests:0,errors:[]};
  let browser;
  try {
    browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
    const anonymous=await browser.newContext();
    const anonPage=await anonymous.newPage();
    await anonPage.goto(base+'/'+u47.htmlPath);
    await anonPage.locator('#gate-login').waitFor({state:'visible'});
    assert.equal(await anonPage.locator('#protected-reader').isVisible(),false);
    assert.equal((await anonymous.request.get(base+'/api/guide?id=audio-050')).status(),401);
    report.noSession=true;
    const context=await browser.newContext({viewport:{width:1440,height:1000}});
    const storageKey='bluegee-audio-auth-'+new URL(project).hostname;
    await context.addInitScript(({key,value})=>{window.localStorage.setItem(key,JSON.stringify(value));},{key:storageKey,value:{access_token:token,refresh_token:'fixture-refresh-not-used',expires_at:4102444800,expires_in:3600,token_type:'bearer',user}});
    const page=await context.newPage();
    page.on('pageerror',error=>report.errors.push(error.message));
    await page.goto(base+'/'+u47.htmlPath);
    await page.getByText('이 계정에는 이 가이드의 열람 권한이 없습니다.').waitFor();
    assert.equal(await page.locator('#protected-reader').isVisible(),false);report.noEntitlement=true;
    entitled=true;
    await page.goto(base+'/'+u47.htmlPath+'#'+encodeURIComponent(u47.chapters[4].id));
    await page.locator('#gate-retry').click();
    await page.locator('#protected-reader').waitFor({state:'visible'});
    const guide=page.frameLocator('#guide-frame');
    await guide.locator('#audio-guide-toc').waitFor();
    assert.equal(await guide.locator('#audio-guide-toc').count(),1);
    assert.equal(await guide.locator('.audio-guide-link').count(),27);
    assert.equal(await guide.locator('.audio-guide-current').getAttribute('id'),u47.chapters[4].id);report.deepLink=true;
    for(let index=0;index<u47.chapters.length;index++) {
      await guide.locator('.audio-guide-link').nth(index).click();
      assert.equal(await guide.locator('.audio-guide-current').getAttribute('id'),u47.chapters[index].id);
      await page.waitForURL(url=>url.hash==='#'+encodeURIComponent(u47.chapters[index].id));report.chapters++;
    }
    report.entitledFullGuide=true;
    for(const width of [320,390,768,1440]) {
      await page.setViewportSize({width,height:900});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
    }
    report.mobile=true;
    const output=path.join(ROOT,'audit/entitlement-pilot');fs.mkdirSync(output,{recursive:true});
    const privateOutput=path.resolve(path.dirname(originalPath));
    await page.screenshot({path:path.join(privateOutput,'u47-entitled.png')});
    await guide.locator('#audio-guide-home').click();
    await page.waitForURL(base+'/index.html');
    await page.locator('.guide-entry').first().waitFor();
    assert.equal(await page.locator('.guide-entry').count(),80);
    await page.goto(base+'/'+u47.htmlPath);
    await page.locator('#protected-reader').waitFor({state:'visible'});
    entitled=false;
    await page.reload();
    await page.getByText('이 계정에는 이 가이드의 열람 권한이 없습니다.').waitFor();
    assert.equal(await page.locator('#protected-reader').isVisible(),false);report.revocation=true;
    entitled=true;await page.locator('#gate-retry').click();await page.locator('#protected-reader').waitFor({state:'visible'});
    // Use the unchanged Library logout UI to broadcast SIGNED_OUT. No password login.
    const other=await context.newPage();await other.goto(base+'/index.html');
    await other.locator('#account-logout').waitFor({state:'visible'});
    await other.locator('#account-logout').click();
    await page.locator('#gate-login').waitFor({state:'visible'});
    assert.equal(await page.locator('#protected-reader').isVisible(),false);report.logoutRemoval=true;
    assert.deepEqual(report.errors,[]);assert.equal(passwordRequests,0);report.passwordRequests=passwordRequests;
    fs.writeFileSync(path.join(output,'browser-verification.json'),JSON.stringify({...report,passed:true},null,2)+'\n');console.log(JSON.stringify({...report,passed:true},null,2));
  } finally {if(browser){await browser.close();}await new Promise(resolve=>server.close(resolve));await new Promise(resolve=>upstream.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
