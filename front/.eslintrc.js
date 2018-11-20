module.exports = {
  extends: ['airbnb', 'prettier', 'prettier/react'],
  env: {
    browser: true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'consistent-return': 0, // Often bothering with early returns
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/__tests__/*.js',
          '**/__stories__/*.js',
          '**/*.test.js',
          '**/tests/*.{js,jsx,mjs}',
        ],
      },
    ],
    'import/no-named-as-default': 0,
    'import/prefer-default-export': 0,
    'no-nested-ternary': 0,
    'react/no-unescaped-entities': 0,
    'react/jsx-filename-extension': [2, { extensions: ['.js'] }],
    'react/require-default-props': 0,
    'react/forbid-prop-types': 0, // Instead of activating this rule, flow or TS
    'react/sort-comp': 0,
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['to'],
        aspects: ['noHref', 'invalidHref', 'preferButton'],
      },
    ],
  },
}
