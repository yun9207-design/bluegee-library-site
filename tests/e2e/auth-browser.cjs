'use strict';
// Real bundled Supabase SDK with isolated, synthetic Auth protocol responses.
// This does not establish that a real Supabase project/account is connected.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { ROOT, loadMaster } = require('../../scripts/catalog-data.cjs');
const { readAuthConfig, renderAuthOutputs } = require('../../scripts/auth-build.cjs');
const output = path.join(ROOT, 'audit/auth-stage1');
const fixtureEmail = 'audio-library-fixture@example.test';
const fixturePassword = 'synthetic-fixture-only-password';
const storageKey = 'bluegee-audio-auth-127.0.0.1';
const user = { id: '11111111-1111-4111-8111-111111111111', aud: 'authenticated', role: 'authenticated', email: fixtureEmail, email_confirmed_at: '2026-10-01T00:00:00Z', created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z', app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: {}, identities: [] };
function accessToken(exp) {
  return [JSON.stringify({ alg: 'HS256', typ: 'JWT' }), JSON.stringify({ sub: user.id, email: fixtureEmail, aud: 'authenticated', role: 'authenticated', exp }), 'synthetic-signature'].map(text => Buffer.from(text).toString('base64url')).join('.');
}
function session() {
  const expires = Math.floor(Date.now() / 1000) + 3600;
  return { access_token: accessToken(expires), refresh_token: 'synthetic-refresh-token', token_type: 'bearer', expires_in: 3600, expires_at: expires, user };
}
async function serve(directory) {
  const server = http.createServer((request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
      const file = path.resolve(directory, '.' + pathname + (pathname.endsWith('/') ? 'index.html' : ''));
      const relative = path.relative(directory, file);
      if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404); response.end('Not found'); return; }
      const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' };
      response.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
      fs.createReadStream(file).pipe(response);
    } catch (_error) { response.writeHead(400); response.end('Bad request'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { base: `http://127.0.0.1:${server.address().port}/`, close: () => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())) };
}
async function assertEmail(page) {
  await page.waitForFunction(email => document.getElementById('account-email')?.textContent === email && !document.getElementById('account-user')?.hidden, fixtureEmail);
  assert.equal(await page.locator('#account-login').isVisible(), false);
}
async function assertWidths(page, widths, report, state) {
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    assert.ok(documentWidth <= width + 1, `${state}: ${documentWidth} > ${width}`);
    report.mobile.push({ state, width, documentWidth });
    if (width === 390 || width === 1440) { await page.screenshot({ path: path.join(output, `${state}-${width}.png`), animations: 'disabled' }); }
  }
}
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const report = { checkedAt: new Date().toISOString(), realSupabaseVerified: false, mode: 'Isolated protocol fixture with the real bundled SDK; not live Supabase', mobile: [], requests: { password: 0, user: 0, refresh: 0, logout: 0 }, brokenLocalAssets: [], javascriptErrors: [] };
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'bluegee-auth-browser-'));
  let browser;
  let server;
  let authServer;
  let logoutFailure = false;
  try {
    // Copy public files into an isolated directory; no real catalogue/config changes.
    const fixtureDist = path.join(temporary, 'dist');
    fs.cpSync(path.join(ROOT, 'dist'), fixtureDist, { recursive: true });
    for (const [file, content] of renderAuthOutputs(readAuthConfig({}, null))) { fs.writeFileSync(path.join(fixtureDist, file), content); }
    server = await serve(fixtureDist);
    browser = await chromium.launch({ headless: true, args: ['--no-proxy-server'], executablePath: process.env.BROWSER_EXECUTABLE ?? (process.platform === 'win32' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : undefined) });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    context.setDefaultTimeout(15000);
    context.setDefaultNavigationTimeout(15000);
    context.on('page', page => {
      page.on('pageerror', error => report.javascriptErrors.push(error.message));
      page.on('response', response => { if (response.url().startsWith(server.base) && response.status() >= 400) { report.brokenLocalAssets.push({ url: new URL(response.url()).pathname, status: response.status() }); } });
    });
    const page = await context.newPage();
    const probe = await context.request.get(server.base + 'login.html');
    assert.equal(probe.status(), 200);
    await page.goto(server.base + 'login.html');
    await page.waitForFunction(() => document.getElementById('login-notice')?.textContent?.includes('준비 중'));
    assert.equal(await page.locator('#login-email').isDisabled(), true);
    assert.equal(await page.locator('#login-submit').isDisabled(), true);
    await assertWidths(page, [320, 390, 768, 1440], report, 'unconfigured-login');
    await page.locator('.login-back').click();
    await page.waitForSelector('.guide-entry');
    assert.equal(await page.locator('.guide-entry').count(), 80);
    assert.equal(report.requests.password, 0);
    report.unconfiguredPublicLibrary = true; console.log('Unconfigured login and public Library passed.');
    // An actual localhost Auth protocol server avoids intercepting browser requests.
    authServer = http.createServer(async (request, response) => {
      response.setHeader('access-control-allow-origin', '*');
      response.setHeader('access-control-allow-headers', 'apikey, authorization, content-type, x-client-info, x-supabase-api-version');
      response.setHeader('access-control-allow-methods', 'GET, POST, OPTIONS');
      response.setHeader('x-supabase-api-version', '2024-01-01');
      response.setHeader('access-control-expose-headers', 'x-supabase-api-version');
      if (request.method === 'OPTIONS') { response.writeHead(204); response.end(); return; }
      const json = (status, body) => { response.writeHead(status, { 'content-type': 'application/json' }); response.end(JSON.stringify(body)); };
      try {
        const url = new URL(request.url, 'http://127.0.0.1');
        assert.equal(request.headers.apikey, 'sb_publishable_fixture_only');
        let body = '';
        for await (const chunk of request) { body += chunk; }
        if (url.pathname === '/auth/v1/token' && url.searchParams.get('grant_type') === 'password') {
          report.requests.password++;
          const input = JSON.parse(body);
          if (input.email === fixtureEmail && input.password === fixturePassword) { json(200, session()); }
          else { json(400, { code: 'invalid_credentials', msg: 'Invalid login credentials' }); }
        } else if (url.pathname === '/auth/v1/user') {
          report.requests.user++; json(200, user);
        } else if (url.pathname === '/auth/v1/token' && url.searchParams.get('grant_type') === 'refresh_token') {
          report.requests.refresh++; json(200, session());
        } else if (url.pathname === '/auth/v1/logout') {
          report.requests.logout++;
          assert.equal(url.searchParams.get('scope'), 'local');
          if (logoutFailure) { json(400, { code: 'unexpected_failure', msg: 'Synthetic logout failure' }); }
          else { response.writeHead(204); response.end(); }
        } else { throw new Error('Unexpected SDK endpoint: ' + url.pathname); }
      } catch (error) { report.javascriptErrors.push(error.message); json(500, { msg: 'Fixture error' }); }
    });
    await new Promise(resolve => authServer.listen(0, '127.0.0.1', resolve));
    const config = readAuthConfig({ SUPABASE_URL: 'http://127.0.0.1:' + authServer.address().port, SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_fixture_only' }, null);
    fs.writeFileSync(path.join(fixtureDist, 'auth-config.js'), renderAuthOutputs(config).get('auth-config.js'));
    await page.goto(server.base + 'login.html');
    await page.waitForFunction(() => !document.getElementById('login-controls')?.disabled);
    await assertWidths(page, [320, 390, 768, 1440], report, 'login');
    await page.locator('#login-email').fill(fixtureEmail);
    await page.locator('#login-password').fill('wrong-synthetic-password');
    await page.locator('#login-submit').click();
    await page.waitForFunction(() => document.getElementById('login-error')?.textContent?.includes('비밀번호를 확인'));
    assert.equal(await page.locator('#login-error').isVisible(), true);
    assert.equal(await page.locator('#login-password').inputValue(), '');
    assert.equal(await page.locator('#login-submit').isEnabled(), true);
    report.invalidCredentials = true; console.log('Invalid credentials passed.');
    await page.screenshot({ path: path.join(output, 'login-error.png') });
    await page.locator('#login-password').fill(fixturePassword);
    await page.locator('#login-submit').click();
    await page.waitForURL('**/index.html');
    await assertEmail(page);
    assert.equal(await page.locator('.guide-entry').count(), 80);
    report.loginRedirectAndEmail = true; console.log('Login and email passed.');
    await page.reload();
    await assertEmail(page);
    report.reloadSession = true; console.log('Reload session passed.');
    await assertWidths(page, [320, 390, 768, 1440], report, 'signed-in-library');
    for (const number of ['001', '050', '080']) {
      await page.goto(server.base + `product.html?id=audio-${number}`);
      await page.waitForSelector('#product-view:not([hidden])');
      await assertEmail(page);
      assert.equal(await page.locator('#product-number').textContent(), number);
    }
    report.signedInDetails = ['001', '050', '080']; console.log('Signed-in details passed.');
    // A stored expired session must be refreshed by the SDK, then confirmed via getUser.
    await page.evaluate(key => {
      const value = JSON.parse(window.localStorage.getItem(key));
      value.expires_at = Math.floor(Date.now() / 1000) - 120;
      window.localStorage.setItem(key, JSON.stringify(value));
    }, storageKey);
    await page.reload();
    await assertEmail(page);
    assert.ok(report.requests.refresh > 0);
    report.refreshSession = true; console.log('Token refresh passed.');
    const other = await context.newPage();
    await other.goto(server.base + 'index.html');
    await assertEmail(other);
    logoutFailure = true;
    await page.locator('#account-logout').click();
    await page.waitForFunction(() => document.getElementById('account-status')?.textContent?.includes('서버 세션 종료는 확인하지 못했습니다'));
    assert.equal(await page.locator('#account-user').isVisible(), false);
    assert.equal(await page.evaluate(key => window.localStorage.getItem(key), storageKey), null);
    report.logoutErrorMatchesLocalSession = true; console.log('Logout failure handling passed.');
    logoutFailure = false;
    await page.goto(server.base + 'login.html');
    await page.waitForFunction(() => !document.getElementById('login-controls')?.disabled);
    await page.locator('#login-email').fill(fixtureEmail);
    await page.locator('#login-password').fill(fixturePassword);
    await page.locator('#login-submit').click();
    await page.waitForURL('**/index.html');
    await assertEmail(page);
    await assertEmail(other);
    await page.locator('#account-logout').click();
    await page.waitForSelector('#account-user[hidden]', { state: 'attached' });
    await other.waitForSelector('#account-user[hidden]', { state: 'attached' });
    assert.equal(await page.locator('#account-login').isVisible(), true);
    assert.equal(await page.evaluate(key => window.localStorage.getItem(key), storageKey), null);
    await page.reload();
    assert.equal(await page.locator('#account-user').isVisible(), false);
    await page.goto(server.base);
    await page.waitForSelector('.guide-entry');
    assert.equal(await page.locator('.guide-entry').count(), 80);
    const guide = loadMaster().products.find(product => product.number === '050');
    await page.goto(new URL(`reader.html?id=050&chapter=${encodeURIComponent(guide.chapters[0].id)}`, server.base).href);
    await page.waitForFunction(() => window.AudioGuide);
    assert.equal(new URL(page.url()).pathname, '/' + guide.htmlPath);
    report.logoutAndCrossTab = true;
    report.publicReaderAfterLogout = true;
    assert.deepEqual(report.javascriptErrors, []);
    assert.deepEqual(report.brokenLocalAssets, []);
    report.passed = true;
  } finally {
    if (browser) { await browser.close(); }
    if (server) { await server.close(); }
    if (authServer) { authServer.closeAllConnections(); await new Promise(resolve => authServer.close(resolve)); }
    const resolved = path.resolve(temporary);
    assert.ok(resolved.startsWith(path.resolve(os.tmpdir()) + path.sep) && path.basename(resolved).startsWith('bluegee-auth-browser-'));
    fs.rmSync(resolved, { recursive: true, force: true });
    report.fixtureRemoved = !fs.existsSync(resolved);
    fs.writeFileSync(path.join(output, 'browser-verification.json'), JSON.stringify(report, null, 2));
  }
  console.log(JSON.stringify(report, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
