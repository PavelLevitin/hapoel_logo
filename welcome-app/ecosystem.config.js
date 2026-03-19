module.exports = {
  apps: [
    {
      name: 'hbs-studio',
      script: 'node_modules/.bin/next',
      args: 'start -p 4009',
      cwd: './',
      env: {
        NODE_ENV: 'production',
        PORT: 4009,
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
    },
  ],
};
