module.exports = {
  extends: ['plugin:cypress/recommended', 'airbnb-base'],
  env: {
    jest: true,
    node: true,
    'cypress/globals': true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
  },
  plugins: ['cypress'],
  rules: {
    'max-len': ['error', {
      ignoreComments: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true,
      code: 100,
    }],
  },
};
