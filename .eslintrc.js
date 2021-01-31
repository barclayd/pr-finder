module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'simple-import-sort'],
  rules: {
    '@typescript-eslint/semi': 'warn',
    'simple-import-sort/imports': [
      'error',
      {
        groups: [['^\\u0000', '^@?\\w', '^[^.]', '^\\.']],
      },
    ],
    curly: 'warn',
    eqeqeq: 'warn',
    'no-throw-literal': 'warn',
    semi: 'off',
  },
};
