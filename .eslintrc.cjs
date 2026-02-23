/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['expo'],
  rules: {
    'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
  },
  overrides: [
    {
      files: ['**/__tests__/**', 'HaremAltinSocket-main/**/*'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};

