const config = {
  apps: [
    {
      name: 'back',
      script: 'bin/www',
      watch:
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'test',
      ignore_watch: ['uploads', 'datalake'],
    },
    {
      name: 'admin',
      script: 'bin/www',
      args: '--admin',
      watch: process.env.NODE_ENV === 'development',
      ignore_watch: ['uploads', 'datalake'],
    },
  ],
}

if (process.env.NODE_ENV === 'production') {
  config.apps.push({
    name: 'mailing-agent',
    script: 'jobs/mailing-agent.js',
  })
  config.apps.push({
    name: 'utilities-agent',
    script: 'jobs/utilities-agent.js',
  })
}

module.exports = config
