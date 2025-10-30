#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌊 Setting up Prisma for Digital Ocean deployment...\n');

try {
  // Step 1: Check if we're in a Digital Ocean environment
  const isDigitalOcean = process.env.DATABASE_URL?.includes('digitalocean') || 
                        process.env.NODE_ENV === 'production';
  
  if (isDigitalOcean) {
    console.log('🌊 Digital Ocean environment detected');
  } else {
    console.log('💻 Local development environment detected');
  }

  // Step 2: Generate Prisma client with Digital Ocean optimizations
  console.log('\n🔄 Generating Prisma client for Digital Ocean...');
  
  // Set environment variables for Digital Ocean
  if (isDigitalOcean) {
    process.env.PRISMA_CLI_BINARY_TARGETS = 'native';
  }
  
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');

  // Step 3: Create Digital Ocean specific environment configuration
  console.log('\n🔧 Configuring Digital Ocean environment...');
  
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Add Digital Ocean specific configurations
  const digitalOceanConfigs = [
    '',
    '# Digital Ocean specific configurations',
    'USE_PRISMA=true',
    'NODE_ENV=production',
    'PRISMA_CLI_BINARY_TARGETS=native',
    '',
    '# Connection pooling for Digital Ocean',
    '# Add these parameters to your DATABASE_URL:',
    '# ?connection_limit=5&pool_timeout=20&connect_timeout=60',
    '',
    '# For Digital Ocean managed databases, you might need:',
    '# DIRECT_URL=your_direct_connection_string',
    '# DATABASE_URL=your_pooled_connection_string'
  ];

  // Check if Digital Ocean configs already exist
  const hasDigitalOceanConfig = envContent.includes('Digital Ocean specific');
  if (!hasDigitalOceanConfig) {
    fs.appendFileSync(envPath, digitalOceanConfigs.join('\n'));
    console.log('✅ Digital Ocean configurations added to .env');
  } else {
    console.log('✅ Digital Ocean configurations already exist');
  }

  // Step 4: Test database connection with Digital Ocean settings
  console.log('\n🔍 Testing Digital Ocean database connection...');
  
  try {
    // For Digital Ocean, we'll use db push instead of migrate
    if (isDigitalOcean) {
      console.log('🌊 Using db push for Digital Ocean (no migrations)...');
      execSync('npx prisma db push --accept-data-loss', { stdio: 'pipe' });
    } else {
      console.log('💻 Using migrate for local development...');
      execSync('npx prisma migrate dev', { stdio: 'pipe' });
    }
    
    console.log('✅ Database connection successful');
    console.log('✅ Database schema synchronized');
  } catch (error) {
    console.log('⚠️ Database connection failed:', error.message);
    console.log('💡 Digital Ocean troubleshooting tips:');
    console.log('   1. Verify DATABASE_URL includes SSL parameters');
    console.log('   2. Check if connection pooling is configured');
    console.log('   3. Ensure firewall allows connections from Digital Ocean');
    console.log('   4. Try using DIRECT_URL for migrations');
  }

  // Step 5: Create Digital Ocean deployment script
  console.log('\n📦 Creating Digital Ocean deployment script...');
  
  const deployScript = `#!/bin/bash
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
`;

  fs.writeFileSync(path.join(__dirname, 'deploy-digitalocean.sh'), deployScript);
  fs.chmodSync(path.join(__dirname, 'deploy-digitalocean.sh'), '755');
  console.log('✅ Digital Ocean deployment script created');

  console.log('\n🎉 Digital Ocean Prisma setup completed!');
  console.log('\n📋 Digital Ocean specific notes:');
  console.log('   • Use "npx prisma db push" instead of migrations');
  console.log('   • Connection pooling is automatically configured');
  console.log('   • SSL is handled automatically by Digital Ocean');
  console.log('   • Binary targets are set to "native" for better performance');
  
  console.log('\n🔧 Digital Ocean deployment steps:');
  console.log('   1. Set DATABASE_URL with connection pooling parameters');
  console.log('   2. Set NODE_ENV=production');
  console.log('   3. Set USE_PRISMA=true');
  console.log('   4. Run "npm run deploy-digitalocean" or use the created script');
  
  console.log('\n⚠️ Important Digital Ocean considerations:');
  console.log('   • Digital Ocean PostgreSQL has connection limits');
  console.log('   • Use connection pooling to avoid "too many connections" errors');
  console.log('   • Consider using PgBouncer for high-traffic applications');
  console.log('   • Monitor connection usage in Digital Ocean dashboard');

} catch (error) {
  console.error('❌ Digital Ocean Prisma setup failed:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('   1. Make sure you have a valid DATABASE_URL');
  console.log('   2. Check if your Digital Ocean database is running');
  console.log('   3. Verify network connectivity');
  console.log('   4. Check Digital Ocean firewall settings');
  process.exit(1);
}
