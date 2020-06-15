module.exports = {
  extends: ['airbnb-base'],
  env: {
    jest: true,
    node: true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
  },
  ignorePatterns: ['extracts/*'],
  rules: {
    'max-len': ['error', {
      ignoreComments: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true,
      code: 100,
    }],
    'implicit-arrow-linebreak': 0,
    'class-methods-use-this': 0,
    'consistent-return': 0, // Often bothering with early returns
    'no-param-reassign': 0, // Useful for our wotk with db models
    'no-restricted-syntax': 0,
  },
};
