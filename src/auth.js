import { createClient } from '@supabase/supabase-js';

/** @param {string} id */
function node(id) { return document.getElementById(id); }
const config = window.BLUEGEE_AUTH_CONFIG;
const form = /** @type {HTMLFormElement|null} */ (node('login-form'));
const controls = /** @type {HTMLFieldSetElement|null} */ (node('login-controls'));
const emailInput = /** @type {HTMLInputElement|null} */ (node('login-email'));
const passwordInput = /** @type {HTMLInputElement|null} */ (node('login-password'));
const submit = /** @type {HTMLButtonElement|null} */ (node('login-submit'));
const logout = /** @type {HTMLButtonElement|null} */ (node('account-logout'));
/** @param {string} id @param {string} message */
function message(id, message) {
  const target = node(id);
  if (target) { target.textContent = message; target.hidden = !message; }
}
/** Display identity only. Never hide catalogue items or authorize guide access.
 * @param {import('@supabase/supabase-js').User|null} user */
function renderUser(user) {
  const signedIn = Boolean(user);
  const accountLogin = node('account-login');
  const accountUser = node('account-user');
  const accountEmail = node('account-email');
  if (accountLogin) { accountLogin.hidden = signedIn; }
  if (accountUser) { accountUser.hidden = !signedIn; }
  if (accountEmail) { accountEmail.textContent = user?.email ?? '로그인 사용자'; accountEmail.title = user?.email ?? ''; }
  if (form) { form.hidden = signedIn; }
  const already = node('login-already');
  if (already) { already.hidden = !signedIn; }
}
/** @param {import('@supabase/supabase-js').AuthError | Error | null} error */
function loginError(error) {
  if (error && 'status' in error && error.status === 429) { return '로그인 요청이 많습니다. 잠시 후 다시 시도해 주세요.'; }
  if (error && 'code' in error && error.code === 'email_not_confirmed') { return '이메일 확인을 완료한 뒤 다시 로그인해 주세요.'; }
  if (error && 'code' in error && error.code === 'invalid_credentials') { return '이메일 또는 비밀번호를 확인해 주세요.'; }
  return '로그인에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.';
}

async function initialize() {
  renderUser(null);
  if (!config?.configured || !config.url || !config.publishableKey) {
    message('login-notice', '현재 로그인 기능을 준비 중입니다. 공개 가이드는 계속 이용할 수 있습니다.');
    return;
  }
  const client = createClient(config.url, config.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'bluegee-audio-auth-' + new URL(config.url).hostname },
  });
  let identityVersion = 0;
  // No awaited Supabase calls inside this callback: avoid re-entering the SDK auth lock.
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'INITIAL_SESSION') { return; }
    identityVersion++;
    renderUser(session?.user ?? null);
    if (event === 'SIGNED_OUT') { message('account-status', '로그아웃되었습니다.'); }
  });
  try {
    const version = identityVersion;
    const { data, error } = await client.auth.getSession();
    if (error) { throw error; }
    if (data.session) {
      const current = await client.auth.getUser();
      if (current.error) { throw current.error; }
      if (version === identityVersion) { renderUser(current.data.user); }
    }
    message('login-notice', '');
  } catch {
    message('login-notice', '로그인 상태를 확인하지 못했습니다. 다시 로그인하거나 공개 가이드를 이용해 주세요.');
    message('account-status', '로그인 상태를 확인하지 못했습니다.');
  } finally {
    if (controls) { controls.disabled = false; }
  }
  form?.addEventListener('submit', async event => {
    event.preventDefault();
    if (!emailInput || !passwordInput || !submit || !controls || !form.reportValidity()) { return; }
    message('login-error', ''); message('login-notice', '');
    controls.disabled = true; submit.textContent = '로그인 중…'; form.setAttribute('aria-busy', 'true');
    try {
      const result = await client.auth.signInWithPassword({ email: emailInput.value.trim(), password: passwordInput.value });
      if (result.error) { message('login-error', loginError(result.error)); return; }
      if (!result.data.session || !result.data.user) { message('login-error', '로그인을 완료하지 못했습니다. 다시 시도해 주세요.'); return; }
      passwordInput.value = '';
      window.location.assign('index.html');
    } catch { message('login-error', '로그인에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.'); }
    finally {
      passwordInput.value = ''; controls.disabled = false; submit.textContent = '로그인'; form.removeAttribute('aria-busy');
    }
  });
  logout?.addEventListener('click', async () => {
    logout.disabled = true; message('account-status', '');
    try {
      const { error } = await client.auth.signOut({ scope: 'local' });
      if (error) {
        // The SDK may remove the local session even when server revocation fails.
        const current = await client.auth.getSession();
        if (current.error) { message('account-status', '로그아웃 후 계정 상태를 확인하지 못했습니다. 다시 확인해 주세요.'); return; }
        renderUser(current.data.session?.user ?? null);
        message('account-status', current.data.session ? '로그아웃하지 못했습니다. 다시 시도해 주세요.' : '이 브라우저에서 로그아웃되었습니다. 서버 세션 종료는 확인하지 못했습니다.');
        return;
      }
      renderUser(null); message('account-status', '로그아웃되었습니다.');
    } catch { message('account-status', '로그아웃하지 못했습니다. 다시 시도해 주세요.'); }
    finally { logout.disabled = false; }
  });
}
initialize().catch(() => {
  message('login-notice', '로그인에 연결할 수 없습니다. 공개 가이드는 계속 이용할 수 있습니다.');
  message('account-status', '로그인에 연결할 수 없습니다.');
});
