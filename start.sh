#!/bin/bash

# Enable strict mode
set -e

#echo "Starting DevTools Environment..."

# Ensure node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Fix for Apache ServerName warning (optional but cleaner)
echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Enable Apache Rewrite Module
a2enmod rewrite

# Start Apache in background
docker-php-entrypoint apache2-foreground &

# Start Vite Dev Server
echo "Starting Vite..."
npm run dev -- --host

# Wait for any process to exit
wait -n
