module.exports = {
  parser: 'babel-eslint',
  extends: ['airbnb', 'airbnb/hooks'],
  env: { 
    browser: true,
  },
  rules: {
    'react/jsx-filename-extension': 0,
    'react/no-unescaped-entities': 0,
  },
}
