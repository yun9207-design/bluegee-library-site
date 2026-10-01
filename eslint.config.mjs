export default [{
  files: ['src/**/*.js', 'scripts/**/*.cjs', 'tests/**/*.cjs', 'eslint.config.mjs'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'commonjs',
    globals: Object.fromEntries([
      'module', 'require', '__dirname', 'process', 'Buffer', 'console', 'URL',
      'window', 'document', 'location', 'history', 'URLSearchParams', 'addEventListener',
      'fetch', 'setTimeout', 'clearTimeout', 'structuredClone',
      'innerWidth',
    ].map(name => [name, 'readonly'])),
  },
  rules: {
    'no-undef': 'error', 'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
    'eqeqeq': ['error', 'always', { null: 'ignore' }], 'curly': ['error', 'all'],
    'no-unreachable': 'error', 'no-dupe-keys': 'error', 'no-constant-condition': 'error',
    'no-empty': 'error', 'use-isnan': 'error', 'valid-typeof': 'error',
  },
}, { files: ['eslint.config.mjs', 'src/auth.js'], languageOptions: { sourceType: 'module' } }];
