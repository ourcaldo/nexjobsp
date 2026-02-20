module.exports = {
  apps: [
    {
      name: 'nexjob-frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/home/nexjob/nexjobsp',
      // NOTE: Using fork mode with 1 instance. Next.js handles its own worker
      // threads internally. For multi-core, change to exec_mode: 'cluster' and
      // instances: 'max', but ensure no in-process state (e.g. rate-limit Map).
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Restart settings
      max_restarts: 10,
      restart_delay: 4000,
      
      // Memory and CPU settings
      max_memory_restart: '1G',
      
      // Logging (use relative PM2 log dir, not hardcoded /root)
      log_file: './logs/nexjob-frontend.log',
      out_file: './logs/nexjob-frontend-out.log',
      error_file: './logs/nexjob-frontend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
    }
  ]
};