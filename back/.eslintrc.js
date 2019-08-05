module.exports = {
  extends: ['airbnb-base', 'prettier'],
  env: {
    jest: true,
    node: true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'arrow-body-style': [2, 'as-needed'],
    curly: [2, 'multi-line'],
    'class-methods-use-this': 0,
    'consistent-return': 0, // Often bothering with early returns
    'func-names': 0,
    'import/no-named-as-default': 0,
    'import/prefer-default-export': 0,
    'no-continue': 0,
    'no-nested-ternary': 0,
    'no-param-reassign': 0, // Useful for our wotk with db models
    'no-restricted-syntax': 0,
    'no-plusplus': 0,
  },
}
