module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb', 'airbnb/hooks'],
  env: {
    browser: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'react/jsx-filename-extension': [2, { extensions: ['.js'] }],
    'react/no-unescaped-entities': 0,
    'max-len': ['error', {
      ignoreComments: true,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      code: 100,
    }],
    'react/jsx-props-no-spreading': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'react/static-property-placement': 0,
    'react/state-in-constructor': 0,
    'implicit-arrow-linebreak': 0,
    'class-methods-use-this': 0,
    'consistent-return': 0, // Often bothering with early returns
    'no-restricted-syntax': 0,
    'operator-linebreak': ['error', 'after'],

    curly: [2, 'multi-line'],
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
    'no-nested-ternary': 0, // TODO remove and correct code
    'react/require-default-props': 0, // TODO remove and correct code
    'react/forbid-prop-types': 0, // TODO remove and correct code
    'react/destructuring-assignment': 0, // TODO remove and correct code
  },
};
