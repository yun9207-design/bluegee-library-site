'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const { readAuthConfig, renderAuthOutputs } = require('../scripts/auth-build.cjs');
const publicValues = { SUPABASE_URL: 'https://auth-fixture.invalid', SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_fixture_only' };
/** Synthetic JWT for configuration validation only; never a real credential. @param {string} role */
function keyFor(role) { return Buffer.from('{}').toString('base64url') + '.' + Buffer.from(JSON.stringify({ role })).toString('base64url') + '.fixture'; }

test('No configuration keeps Auth disabled without injecting unrelated environment values', () => {
  assert.deepEqual(readAuthConfig({ SUPABASE_SERVICE_ROLE_KEY: 'unrelated-secret-fixture' }, null), { configured: false, url: null, publishableKey: null });
  const config = readAuthConfig({ ...publicValues, UNRELATED_SECRET: 'unrelated-secret-fixture' }, null);
  assert.deepEqual(Object.keys(config).sort(), ['configured', 'publishableKey', 'url']);
  assert.equal(JSON.stringify(config).includes('unrelated-secret-fixture'), false);
});
test('Partial configuration and unsafe origins fail without printing values', () => {
  assert.throws(() => readAuthConfig({ SUPABASE_URL: publicValues.SUPABASE_URL }, null), /Set both/u);
  for (const url of ['http://external.invalid', 'https://user:password@auth-fixture.invalid', 'https://auth-fixture.invalid/path', 'https://auth-fixture.invalid?secret=value', 'javascript:alert(1)']) {
    assert.throws(() => readAuthConfig({ ...publicValues, SUPABASE_URL: url }, null), error => error instanceof Error && !error.message.includes(url));
  }
  assert.equal(readAuthConfig({ ...publicValues, SUPABASE_URL: 'http://127.0.0.1:54321/' }, null).url, 'http://127.0.0.1:54321');
});
test('Only publishable and legacy anon keys pass; secret/service_role are rejected', () => {
  assert.equal(readAuthConfig(publicValues, null).configured, true);
  assert.equal(readAuthConfig({ ...publicValues, SUPABASE_PUBLISHABLE_KEY: keyFor('anon') }, null).configured, true);
  for (const key of ['sb_secret_fixture_only', keyFor('service_role'), keyFor('authenticated'), 'not-a-key']) {
    assert.throws(() => readAuthConfig({ ...publicValues, SUPABASE_PUBLISHABLE_KEY: key }, null), error => error instanceof Error && error.message.includes('forbidden') && !error.message.includes(key));
  }
});
test('Ignored local configuration works and process environment takes precedence', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'bluegee-auth-config-'));
  try {
    const file = path.join(temporary, '.env.local');
    fs.writeFileSync(file, 'SUPABASE_URL=https://local-fixture.invalid\nSUPABASE_PUBLISHABLE_KEY=sb_publishable_local_fixture\nUNRELATED_SECRET=fixture_secret\n');
    assert.equal(readAuthConfig({}, file).url, 'https://local-fixture.invalid');
    assert.equal(readAuthConfig(publicValues, file).url, publicValues.SUPABASE_URL);
    assert.equal(JSON.stringify(readAuthConfig({}, file)).includes('fixture_secret'), false);
  } finally {
    const resolved = path.resolve(temporary);
    assert.ok(resolved.startsWith(path.resolve(os.tmpdir()) + path.sep) && path.basename(resolved).startsWith('bluegee-auth-config-'));
    fs.rmSync(resolved, { recursive: true, force: true });
  }
});
test('Build emits bundled local assets and a separate public configuration', () => {
  const outputs = renderAuthOutputs(readAuthConfig({}, null));
  const sandbox = { window: {} };
  vm.runInNewContext(outputs.get('auth-config.js') ?? '', sandbox);
  assert.equal(/** @type {any} */ (sandbox.window).BLUEGEE_AUTH_CONFIG.configured, false);
  assert.ok((outputs.get('auth.js') ?? '').length > fs.statSync(path.resolve(__dirname, '../src/auth.js')).size);
  const login = outputs.get('login.html') ?? '';
  assert.ok(login.includes('src="auth.js"') && login.includes('src="auth-config.js"'));
  assert.equal(/<script[^>]+src="https?:/u.test(login), false);
  assert.equal(login.includes('{{'), false);
});
