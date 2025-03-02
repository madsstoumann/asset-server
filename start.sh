#!/bin/bash

# Install dependencies (without development dependencies for production)
npm install --production

# Start the server using PM2
npm run prod

# Display logs
pm2 logs
