// override create-react-app config
// eslint-disable-next-line import/no-extraneous-dependencies
const { override, fixBabelImports } = require('customize-cra');

/* eslint-disable no-param-reassign */
module.exports = function overrideCustom(config, env) {
  // manage antd
  config = override(
    fixBabelImports('import', {
      libraryName: 'antd',
      libraryDirectory: 'es',
      style: 'css',
    }),
  )(config, env);

  // manage root path
  const isEnvDevelopment = env === 'development';
  if (isEnvDevelopment) {
    config.output.publicPath = '/zen-admin';
  }

  return config;
};
