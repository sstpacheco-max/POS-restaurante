module.exports = {
  apps: [
    {
      name: "punto-pos",
      script: "node_modules\\next\\dist\\bin\\next",
      args: "start",
      cwd: "d:\\punto POS española",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 2000,
    },
  ],
};
