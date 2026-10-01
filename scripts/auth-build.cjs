'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { parseEnv } = require('node:util');
const { buildSync } = require('esbuild');
const ROOT = path.resolve(__dirname, '..');
/** @typedef {{configured:boolean, url:string|null, publishableKey:string|null}} AuthConfig */

/** Read only the two explicitly public fields. No environment dump or secret injection.
 * @param {Record<string,string|undefined>} [environment] @param {string|null} [localFile] @returns {AuthConfig} */
function readAuthConfig(environment = process.env, localFile = path.join(ROOT, '.env.local')) {
  const local = localFile && fs.existsSync(localFile) ? parseEnv(fs.readFileSync(localFile, 'utf8')) : {};
  const urlText = (environment.SUPABASE_URL ?? local.SUPABASE_URL ?? '').trim();
  const key = (environment.SUPABASE_PUBLISHABLE_KEY ?? local.SUPABASE_PUBLISHABLE_KEY ?? '').trim();
  if (!urlText && !key) { return { configured: false, url: null, publishableKey: null }; }
  if (!urlText || !key) { throw new Error('Set both SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY, or leave both unset.'); }
  let url;
  try { url = new URL(urlText); } catch { throw new Error('SUPABASE_URL must be a valid HTTPS project origin.'); }
  const localHost = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !(url.protocol === 'http:' && localHost)) || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('SUPABASE_URL must be an HTTPS origin (HTTP is allowed only on localhost).');
  }
  let publicKey = /^sb_publishable_[a-zA-Z0-9_-]+$/u.test(key);
  if (!publicKey && key.split('.').length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString('utf8'));
      publicKey = payload.role === 'anon';
    } catch { publicKey = false; }
  }
  if (!publicKey) { throw new Error('Only a publishable key or legacy anon key may be bundled. Secret/service_role keys are forbidden.'); }
  return { configured: true, url: url.origin, publishableKey: key };
}

const assets = '<link rel="stylesheet" href="auth.css"><script defer src="auth-config.js"></script><script defer src="auth.js"></script>';
const account = '<div class="account-area" aria-label="계정"><a id="account-login" class="account-login" href="login.html">로그인</a><div id="account-user" class="account-user" hidden><span id="account-email"></span><button id="account-logout" type="button">로그아웃</button></div><p id="account-status" class="account-status" role="status" aria-live="polite"></p></div>';
/** @param {string} source */
function authShell(source) {
  return source.replace('{{authAssets}}', assets).replace('{{accountArea}}', account);
}

let cachedBundle = '';
let cachedSource = '';
/** @param {AuthConfig} [config] @returns {Map<string,string>} */
function renderAuthOutputs(config = readAuthConfig()) {
  const entry = path.join(ROOT, 'src/auth.js');
  const source = fs.readFileSync(entry, 'utf8');
  if (source !== cachedSource || !cachedBundle) {
    const result = buildSync({ entryPoints: [entry], bundle: true, write: false, platform: 'browser', format: 'iife', target: ['es2022'], minify: true, treeShaking: true, legalComments: 'inline', define: { 'process.env.NODE_ENV': '"production"' } });
    cachedBundle = result.outputFiles[0].text; cachedSource = source;
  }
  // Runtime config is generated and gitignored; actual public values never enter tracked source.
  const encoded = JSON.stringify(config).replace(/</gu, '\\u003c');
  return new Map([
    ['login.html', authShell(fs.readFileSync(path.join(ROOT, 'src/login.template.html'), 'utf8'))],
    ['auth.css', fs.readFileSync(path.join(ROOT, 'src/auth.css'), 'utf8')],
    ['auth.js', cachedBundle],
    ['auth-config.js', `/* Generated public configuration; do not commit. */\nwindow.BLUEGEE_AUTH_CONFIG=${encoded};\n`],
  ]);
}
module.exports = { readAuthConfig, authShell, renderAuthOutputs };
