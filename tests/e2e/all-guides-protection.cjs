'use strict';
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {gzipSync}=require('node:zlib');
const {createHash}=require('node:crypto');
const {chromium}=require('playwright');
const {ROOT,loadMaster}=require('../../scripts/catalog-data.cjs');
const {createGuideHandler}=require('../../server/guide-handler.cjs');
const data=loadMaster();
const selected=data.products.filter(p=>['audio-001','audio-051','audio-080'].includes(p.id));
const privateDirectory=process.env.PRIVATE_GUIDE_TEST_DIRECTORY??path.resolve(ROOT,'../_maintenance/2026-10-01-all-guides/originals');
const originals=new Map(selected.map(p=>{
  const bytes=fs.readFileSync(path.join(privateDirectory,p.id+'.html'));
  return [p.id,{html_gzip_base64:gzipSync(bytes).toString('base64'),sha256:createHash('sha256').update(bytes).digest('hex'),byte_length:bytes.length}];
}));
const token='eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmaXh0dXJlIn0.test-only-signature';
const user={id:'00000000-0000-4000-8000-000000000081',email:'fixture@example.test',aud:'authenticated',role:'authenticated',app_metadata:{},user_metadata:{},created_at:'2026-01-01T00:00:00Z'};
const grants=new Set();
async function listen(server){await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));return 'http://127.0.0.1:'+server.address().port;}
(async()=>{
  let passwordRequests=0;
  const upstream=http.createServer((request,response)=>{
    const url=new URL(request.url,'http://fixture.invalid');
    response.setHeader('Content-Type','application/json');
    if(url.pathname==='/auth/v1/token'){passwordRequests++;response.writeHead(400);response.end('{}');return;}
    if(url.pathname==='/auth/v1/user'){response.end(JSON.stringify(user));return;}
    const id=(url.searchParams.get('product_id')??'').slice(3);
    if(url.pathname==='/rest/v1/library_entitlements'){response.end(JSON.stringify(grants.has(id)?[{access_type:'html',granted_at:'2026-01-01',expires_at:null}]:[]));return;}
    if(url.pathname==='/rest/v1/library_guide_contents'){response.end(JSON.stringify(grants.has(id)&&originals.has(id)?[originals.get(id)]:[]));return;}
    response.writeHead(404);response.end('{}');
  });
  const project=await listen(upstream);
  const handler=createGuideHandler({environment:{SUPABASE_URL:project,SUPABASE_PUBLISHABLE_KEY:'sb_publishable_fixture_only'}});
  const server=http.createServer((request,response)=>{
    const url=new URL(request.url,'http://fixture.invalid');
    if(url.pathname==='/api/guide'){handler(request,response);return;}
    if(url.pathname==='/auth-config.js'){response.setHeader('Content-Type','text/javascript');response.end('window.BLUEGEE_AUTH_CONFIG='+JSON.stringify({configured:true,url:project,publishableKey:'sb_publishable_fixture_only'})+';');return;}
    const file=path.resolve(ROOT,'dist','.'+decodeURIComponent(url.pathname)+(url.pathname.endsWith('/')?'index.html':''));
    const relative=path.relative(path.join(ROOT,'dist'),file);
    if(relative.startsWith('..')||path.isAbsolute(relative)||!fs.existsSync(file)||!fs.statSync(file).isFile()){response.writeHead(404);response.end();return;}
    response.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json'})[path.extname(file)]??'application/octet-stream');
    fs.createReadStream(file).pipe(response);
  });
  const base=await listen(server);
  const report={scope:'Isolated real SDK/common API/original bodies; no live login, no U47 repeat',guides:[],errors:[],passwordRequests:0};
  let browser;
  try{
    browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE??'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
    const anonymous=await browser.newContext();
    await anonymous.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
    const publicPage=await anonymous.newPage();
    await publicPage.goto(base+'/');await publicPage.locator('.guide-entry').first().waitFor();
    assert.equal(await publicPage.locator('.guide-entry').count(),80);
    for(const product of selected){
      await publicPage.goto(base+'/product.html?id='+product.id);
      await publicPage.locator('#product-view').waitFor({state:'visible'});
      assert.equal(await publicPage.locator('#original-read').getAttribute('href'),product.htmlPath);
      await publicPage.locator('#original-read').click();
      await publicPage.locator('#gate-login').waitFor({state:'visible'});
      assert.equal(await publicPage.locator('#protected-reader').isVisible(),false);
    }
    const context=await browser.newContext({viewport:{width:1440,height:1000}});
    await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
    await context.addInitScript(({key,value})=>window.localStorage.setItem(key,JSON.stringify(value)),{key:'bluegee-audio-auth-'+new URL(project).hostname,value:{access_token:token,refresh_token:'fixture-refresh-unused',expires_at:4102444800,expires_in:3600,token_type:'bearer',user}});
    const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
    for(const product of selected){
      grants.clear();
      await page.setViewportSize({width:1440,height:1000});
      await page.goto(base+'/'+product.htmlPath);
      await page.getByText('이 계정에는 이 가이드의 열람 권한이 없습니다.').waitFor();
      assert.equal(await page.locator('#protected-reader').isVisible(),false);
      grants.add(product.id);
      await page.goto(base+'/'+product.htmlPath+'#'+encodeURIComponent(product.chapters[4].id));
      // Hash-only navigation keeps the denied document alive; use its retry action.
      await page.locator('#gate-retry').click();
      await page.locator('#protected-reader').waitFor({state:'visible'});
      const frame=page.frameLocator('#guide-frame');
      await frame.locator('#audio-guide-toc').waitFor();
      assert.equal(await frame.locator('.audio-guide-link').count(),product.chapters.length);
      assert.equal(await frame.locator('.audio-guide-current').getAttribute('id'),product.chapters[4].id);
      await frame.locator('.audio-guide-link').last().click();
      await page.waitForURL(url=>url.hash==='#'+encodeURIComponent(product.chapters.at(-1).id));
      await page.setViewportSize({width:390,height:900});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
      await frame.locator('#audio-guide-toggle').click();
      await frame.locator('#audio-guide-home').click();await page.waitForURL(base+'/index.html');
      report.guides.push({id:product.id,publicDetail:true,anonymousBlocked:true,noRightsBlocked:true,fullOriginal:true,chapters:product.chapters.length,deepLink:true,mobile:true,home:true});
    }
    assert.equal(passwordRequests,0);assert.deepEqual(report.errors,[]);report.passwordRequests=passwordRequests;
    const output=path.join(ROOT,'audit/all-guides-protection');fs.mkdirSync(output,{recursive:true});
    fs.writeFileSync(path.join(output,'browser-verification.json'),JSON.stringify({...report,passed:true},null,2)+'\n');
    console.log(JSON.stringify({...report,passed:true},null,2));
  }finally{if(browser){await browser.close();}await new Promise(resolve=>server.close(resolve));await new Promise(resolve=>upstream.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
