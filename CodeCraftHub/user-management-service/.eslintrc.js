module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': 'error',
    'arrow-spacing': 'error',
    'prefer-arrow-callback': 'error',
    'no-param-reassign': ['error', { props: false }],
    'consistent-return': 'off',
    'func-names': 'off',
    'max-len': ['error', { code: 120, ignoreComments: true }],
    'no-underscore-dangle': ['error', { allow: ['_id', '__v'] }],
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.test.js', '**/*.spec.js'] }],
  },
};