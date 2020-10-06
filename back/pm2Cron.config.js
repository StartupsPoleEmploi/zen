const config = {
  apps: [
    {
      name: 'mailing-agent',
      script: 'jobs/mailing-agent.js',
      node_args: '--optimize_for_size --max_old_space_size=1024 --gc_interval=100',
    },
    {
      name: 'utilities-agent',
      script: 'jobs/utilities-agent.js',
      node_args: '--optimize_for_size --max_old_space_size=6144 --gc_interval=100',
    },
  ],
};

module.exports = config;
