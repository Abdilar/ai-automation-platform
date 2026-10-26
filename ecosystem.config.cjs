module.exports = {
  apps: [
    {
      name: "iautoplatform",
      script: "./dist/index.js",
      cwd: "/var/www/iautoplatform",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        HOST: "127.0.0.1",
        PORT: 4000,
      },
    },
  ],
};