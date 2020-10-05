const config = {
  apps: [
    {
      name: 'back',
      script: 'bin/www',
      watch:
        process.env.NODE_ENV === 'development'
        || process.env.NODE_ENV === 'test',
      ignore_watch: ['uploads', 'datalake', 'var'],
      node_args: '--optimize_for_size --max_old_space_size=3072 --gc_interval=100',
    },
    {
      name: 'admin',
      script: 'bin/www',
      args: '--admin',
      watch: process.env.NODE_ENV === 'development',
      ignore_watch: ['uploads', 'datalake', 'var'],
      node_args: '--optimize_for_size --max_old_space_size=1024 --gc_interval=100',
    },
  ],
};

module.exports = config;
