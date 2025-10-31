module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  plugins: [
    'vue'
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.d.ts'],
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      },
      rules: {
        'no-undef': 'off',
        'no-unused-vars': 'off',
        'no-useless-escape': 'off'
      }
    },
    {
      files: ['tests/**/*.js', 'tests/**/*.test.js'],
      env: {
        jest: true,
        vitest: true
      },
      globals: {
        vi: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        describe: 'readonly',
        afterEach: 'readonly',
        test: 'readonly'
      }
    }
  ]
}
