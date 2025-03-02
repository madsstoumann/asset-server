module.exports = {
  apps: [{
    name: "asset-server",
    script: "./server.js",
    instances: "max",     // Use maximum available CPUs
    exec_mode: "cluster", // Run in cluster mode for load balancing
    watch: false,         // Don't watch for file changes in production
    max_memory_restart: "300M", // Restart if memory exceeds 300M
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
      PORT: 3000
    },
    // Auto-restart configuration
    autorestart: true,    // Auto restart if app crashes
    restart_delay: 4000,  // Delay between restart attempts (4 seconds)
    max_restarts: 10,     // Max auto restarts within min_uptime
    min_uptime: "30s",    // Minimum uptime application needs to be running
    // Error logs
    error_file: "logs/pm2-error.log",
    out_file: "logs/pm2-output.log",
    merge_logs: true,
    // Additional settings
    listen_timeout: 8000, // Time to wait before forcing restart (8 seconds)
    kill_timeout: 1600    // Time to wait before killing process (1.6 seconds)
  }]
};
