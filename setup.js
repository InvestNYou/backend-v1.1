#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up MoneySmart Backend...\n');

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log('📝 Creating .env file from template...');
  if (fs.existsSync('env.example')) {
    fs.copyFileSync('env.example', '.env');
    console.log('✅ .env file created. Please update with your configuration.');
  } else {
    console.log('❌ env.example not found. Please create .env manually.');
  }
} else {
  console.log('✅ .env file already exists.');
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully.');
  } catch (error) {
    console.log('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies already installed.');
}

// Generate Prisma client
console.log('🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated.');
} catch (error) {
  console.log('❌ Failed to generate Prisma client:', error.message);
  console.log('Please make sure PostgreSQL is running and DATABASE_URL is correct in .env');
}

// Run database migrations
console.log('🗄️ Running database migrations...');
try {
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  console.log('✅ Database migrations completed.');
} catch (error) {
  console.log('❌ Failed to run migrations:', error.message);
  console.log('Please check your DATABASE_URL in .env file');
}

// Seed the database
console.log('🌱 Seeding database...');
try {
  execSync('npm run db:seed', { stdio: 'inherit' });
  console.log('✅ Database seeded successfully.');
} catch (error) {
  console.log('❌ Failed to seed database:', error.message);
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Update your .env file with your configuration');
console.log('2. Make sure PostgreSQL is running');
console.log('3. Run "npm run dev" to start the development server');
console.log('4. Visit http://localhost:5000/health to verify the server is running');
console.log('\n🔗 API Documentation: http://localhost:5000/health');
console.log('📊 Database: Check your PostgreSQL database for seeded data');
console.log('\nHappy coding! 🚀');
