/* eslint-disable @typescript-eslint/naming-convention */
/** @type {import('eslint'.Linter.Config)} */
// eslint-disable-next-line no-undef
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  rules: {
    "@typescript-eslint/no-var-requires": 'off',
    "@typescript-eslint/naming-convention": 'error',
    "@typescript-eslint/semi": 'error',
    "curly": 'off',
    "eqeqeq": 'error',
    "no-throw-literal": 'error',
    "semi": 'error',
    "no-unused-vars": 'error',
    "no-loop-func": 'error',
  },
  ignorePatterns: [
    'commitlint.config.js'
  ]
};