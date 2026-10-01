import { createClient } from '@supabase/supabase-js';
/** @param {string} id */
const element = id => {
  const value = document.getElementById(id);
  if (!value) { throw new Error('Missing protected guide element'); }
  return value;
};
const metadata = /** @type {{productId:string,chapters:{id:string,title:string}[]}} */ (JSON.parse(element('audio-guide-config').textContent ?? '{}'));
const frame = /** @type {HTMLIFrameElement} */ (element('guide-frame'));
const config = window.BLUEGEE_AUTH_CONFIG;
let version = 0;
let readerOpen = false;
/** @param {string} message @param {boolean} [login] */
function lock(message, login = false) {
  version++; readerOpen = false;
  frame.removeAttribute('srcdoc'); frame.src = 'about:blank';
  element('protected-reader').hidden = true; element('guide-gate').hidden = false;
  element('gate-status').textContent = message; element('gate-login').hidden = !login; element('gate-retry').hidden = login;
}
/** @param {string} html */
function openGuide(html) {
  // Trusted, reviewed original remains isolated in a reader frame. No JWT is inserted.
  // srcdoc cannot rewrite history as a normal document can; bridge chapter hashes to the parent.
  const bridge = `<base href="${location.origin}${location.pathname}"><script>history.pushState=history.replaceState=function(_data,_title,url){const hash=String(url||'').split('#')[1];if(hash)parent.postMessage({type:'bluegee-guide-chapter',hash},${JSON.stringify(location.origin)});};<\/script>`;
  frame.srcdoc = html.replace(/<head\b[^>]*>/iu, match => match + bridge);
  readerOpen = true;
  element('guide-gate').hidden = true; element('protected-reader').hidden = false;
}
/** @returns {void} */
function selectHash() {
  if (!readerOpen || !frame.contentWindow) { return; }
  let anchor = '';
  try { anchor = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const index = metadata.chapters.findIndex(ch => ch.id === anchor);
  if (index >= 0) { frame.contentWindow.AudioGuide?.selectChapter(index, anchor, false); }
}
frame.addEventListener('load', () => {
  if (!readerOpen) { return; }
  const home = frame.contentDocument?.getElementById('audio-guide-home');
  if (home) { home.setAttribute('href', '/index.html'); home.setAttribute('target', '_top'); }
  // Cross-guide links open the common outer reader, rather than nesting lock frames.
  for (const link of frame.contentDocument?.querySelectorAll('a[href]') ?? []) {
    const href = link.getAttribute('href') ?? '';
    if (!href || href.startsWith('#')) { continue; }
    const target = new URL(href, location.href);
    if (target.origin === location.origin && ((target.pathname.startsWith('/guides/') && target.pathname.endsWith('.html')) || target.pathname === '/reader.html')) { link.setAttribute('target', '_top'); }
  }
  selectHash();
});
window.addEventListener('message', event => {
  if (!readerOpen || event.source !== frame.contentWindow || event.origin !== location.origin || event.data?.type !== 'bluegee-guide-chapter') { return; }
  let anchor;
  try { anchor = decodeURIComponent(String(event.data.hash)); } catch { return; }
  if (metadata.chapters.some(ch => ch.id === anchor)) { history.replaceState(null, '', '#' + encodeURIComponent(anchor)); }
});
window.addEventListener('hashchange', selectHash);
element('reader-close').addEventListener('click', () => lock('가이드를 닫았습니다. 다시 열려면 권한을 확인하세요.'));

async function initialize() {
  if (!config?.configured || !config.url || !config.publishableKey) { lock('가이드 연결을 준비 중입니다. 잠시 후 다시 확인해 주세요.'); return; }
  const client = createClient(config.url, config.publishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'bluegee-audio-auth-' + new URL(config.url).hostname } });
  /** @param {boolean} [checkOnly] */
  async function authorize(checkOnly = false) {
    const current = ++version;
    try {
      const { data, error } = await client.auth.getSession();
      if (current !== version) { return; }
      if (error || !data.session) { lock('로그인 후 이 가이드의 열람 권한을 확인하세요.', true); return; }
      const response = await fetch('/api/guide?id=' + encodeURIComponent(metadata.productId), { method: checkOnly ? 'HEAD' : 'GET', headers: { Authorization: 'Bearer ' + data.session.access_token }, cache: 'no-store', credentials: 'omit' });
      if (current !== version) { return; }
      if (response.status === 401) { lock('로그인이 필요합니다. 계정으로 로그인해 주세요.', true); return; }
      if (response.status === 403) { lock('이 계정에는 이 가이드의 열람 권한이 없습니다.'); return; }
      if (!response.ok) { lock('열람 권한을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.'); return; }
      if (checkOnly) { return; }
      const body = await response.json();
      if (current !== version) { return; }
      if (body.productId !== metadata.productId || typeof body.html !== 'string') { throw new Error('Invalid content'); }
      openGuide(body.html);
    } catch { if (current === version) { lock('가이드에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.'); } }
  }
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || (event !== 'INITIAL_SESSION' && !session)) { lock('로그인 후 이 가이드의 열람 권한을 확인하세요.', true); }
  });
  element('gate-retry').addEventListener('click', () => { authorize().catch(() => lock('권한 확인에 실패했습니다.')); });
  // Recheck entitlement on return to the page, and revoke already-open frames promptly.
  document.addEventListener('visibilitychange', () => { if (!document.hidden && readerOpen) { authorize(true).catch(() => lock('권한 확인에 실패했습니다.')); } });
  window.addEventListener('pageshow', event => { if (event.persisted) { lock('열람 권한을 다시 확인하고 있습니다.'); authorize().catch(() => lock('권한 확인에 실패했습니다.')); } });
  setInterval(() => { if (readerOpen && !document.hidden) { authorize(true).catch(() => lock('권한 확인에 실패했습니다.')); } }, 60000);
  await authorize();
}
initialize().catch(() => lock('가이드 연결에 실패했습니다.'));
