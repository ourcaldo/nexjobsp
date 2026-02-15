module.exports = {
  apps: [
    {
      name: 'nexjob-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/root/nexjobsp',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT,
      },
      // Restart settings
      max_restarts: 10,
      restart_delay: 4000,
      
      // Memory and CPU settings
      max_memory_restart: '1G',
      
      // Logging
      log_file: '/root/.pm2/logs/nexjob-frontend.log',
      out_file: '/root/.pm2/logs/nexjob-frontend-out.log',
      error_file: '/root/.pm2/logs/nexjob-frontend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
    }
  ]
};