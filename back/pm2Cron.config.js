const config = {
  apps: [
    {
      name: 'mailing-agent',
      script: 'jobs/mailing-agent.js',
    },
    {
      name: 'utilities-agent',
      script: 'jobs/utilities-agent.js',
    },
  ],
}

module.exports = config
