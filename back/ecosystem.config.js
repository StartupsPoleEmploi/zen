const config = {
  apps: [
    {
      name: 'back',
      script: 'bin/www',
      watch:
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'test',
    },
    {
      name: 'admin',
      script: 'bin/www',
      args: '--admin',
      watch: process.env.NODE_ENV === 'development',
    },
  ],
}

if (process.env.NODE_ENV === 'production') {
  config.apps.push({
    name: 'mailing-agent',
    script: 'mailing-agent.js',
  })
}

module.exports = config
