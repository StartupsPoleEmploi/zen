const config = {
  apps: [
    {
      name: 'back',
      script: 'bin/www',
    },
    {
      name: 'admin',
      script: 'bin/www',
      args: '--admin',
    },
  ],
}

if (process.env.NODE_ENV === 'production') {
  config.apps.push({
    name: 'pe-agent',
    script: 'pe-agent.js',
  })
}

if (process.env.NODE_ENV === 'production') {
  config.apps.push({
    name: 'mailing-agent',
    script: 'mailing-agent.js',
  })
}

module.exports = config
