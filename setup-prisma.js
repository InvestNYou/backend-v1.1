#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Prisma for InvestNYou Backend...\n');

try {
  // Step 1: Check if Prisma is installed
  console.log('📦 Checking Prisma installation...');
  try {
    execSync('npx prisma --version', { stdio: 'pipe' });
    console.log('✅ Prisma is installed');
  } catch (error) {
    console.log('❌ Prisma not found, installing...');
    execSync('npm install prisma @prisma/client', { stdio: 'inherit' });
    console.log('✅ Prisma installed successfully');
  }

  // Step 2: Generate Prisma client
  console.log('\n🔄 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');

  // Step 3: Check if .env file exists
  console.log('\n🔍 Checking environment configuration...');
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('⚠️ .env file not found');
    const envExamplePath = path.join(__dirname, 'env.example');
    if (fs.existsSync(envExamplePath)) {
      console.log('💡 Copying env.example to .env...');
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ .env file created from env.example');
      console.log('🔧 Please update DATABASE_URL in .env file');
    } else {
      console.log('❌ No env.example file found');
    }
  } else {
    console.log('✅ .env file exists');
  }

  // Step 4: Set USE_PRISMA environment variable
  console.log('\n🔧 Setting up Prisma environment...');
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (!envContent.includes('USE_PRISMA')) {
    fs.appendFileSync(envPath, '\n# Enable Prisma for development\nUSE_PRISMA=true\n');
    console.log('✅ USE_PRISMA=true added to .env');
  } else {
    console.log('✅ USE_PRISMA already configured');
  }

  // Step 5: Test database connection
  console.log('\n🔍 Testing database connection...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'pipe' });
    console.log('✅ Database connection successful');
    console.log('✅ Database schema synchronized');
  } catch (error) {
    console.log('⚠️ Database connection failed:', error.message);
    console.log('💡 Please check your DATABASE_URL in .env file');
    console.log('💡 Make sure your PostgreSQL database is running');
  }

  console.log('\n🎉 Prisma setup completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Verify DATABASE_URL in .env file');
  console.log('   2. Run "npm run dev" to start the backend');
  console.log('   3. Check console logs for database connection details');
  console.log('\n🔧 Available Prisma commands:');
  console.log('   • npx prisma studio - Open Prisma Studio');
  console.log('   • npx prisma db push - Push schema changes');
  console.log('   • npx prisma generate - Generate Prisma client');
  console.log('   • npx prisma migrate dev - Create and apply migrations');

} catch (error) {
  console.error('❌ Prisma setup failed:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('   1. Make sure Node.js and npm are installed');
  console.log('   2. Check your internet connection');
  console.log('   3. Verify your package.json dependencies');
  process.exit(1);
}
