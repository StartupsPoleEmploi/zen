module.exports = {
  extends: ['airbnb-base', 'prettier'],
  env: {
    jest: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2017,
  },
  rules: {
    'class-methods-use-this': 0,
    'consistent-return': 0, // Often bothering with early returns
    'import/no-named-as-default': 0,
    'import/prefer-default-export': 0,
    'no-nested-ternary': 0,
    'no-param-reassign': 0, // Useful for our wotk with db models
    'func-names': 0,
  },
}
