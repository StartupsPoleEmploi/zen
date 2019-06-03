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
    'react/sort-comp': [
      2,
      {
        order: ['static-methods', 'lifecycle', 'everything-else', 'render'],
        groups: {
          lifecycle: [
            'displayName',
            'propTypes',
            'contextTypes',
            'childContextTypes',
            'mixins',
            'statics',
            'defaultProps',
            'constructor',
            'getDefaultProps',
            'state',
            'getInitialState',
            'getChildContext',
            'getDerivedStateFromProps',
            'componentWillMount',
            'UNSAFE_componentWillMount',
            'componentDidMount',
            'componentWillReceiveProps',
            'UNSAFE_componentWillReceiveProps',
            'shouldComponentUpdate',
            'componentWillUpdate',
            'UNSAFE_componentWillUpdate',
            'getSnapshotBeforeUpdate',
            'componentDidUpdate',
            'componentDidCatch',
            'componentWillUnmount',
          ],
        },
      },
    ],
    'react/destructuring-assignment': 0,
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['to'],
        aspects: ['noHref', 'invalidHref', 'preferButton'],
      },
    ],
    'no-continue': 0,
    'no-plusplus': 0,
    'class-methods-use-this': 0,
  },
}
