#!/bin/bash
# HBS Studio — DigitalOcean deploy script
# Run once on the server after cloning the repo:
#   chmod +x deploy.sh && ./deploy.sh

set -e

echo "==> Installing dependencies..."
cd welcome-app
npm install

echo "==> Building app..."
npm run build

echo "==> Running DB migrations & seeding admin..."
npx tsx migrate-and-set-admin.ts

echo "==> Starting with PM2..."
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo ""
echo "Done! App is running on port 4009."
