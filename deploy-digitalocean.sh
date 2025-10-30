#!/bin/bash
# Digital Ocean deployment script for InvestNYou Backend

echo "🌊 Deploying to Digital Ocean..."

# Set production environment
export NODE_ENV=production
export USE_PRISMA=true

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Push database schema (Digital Ocean doesn't use migrations)
echo "🔄 Pushing database schema..."
npx prisma db push --accept-data-loss

# Start the application
echo "🚀 Starting application..."
npm start
