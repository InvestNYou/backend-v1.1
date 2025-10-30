#!/usr/bin/env node

const DatabaseSetup = require('../utils/databaseSetup');
require('dotenv').config();

async function setupDatabase() {
  console.log('🚀 Starting automated database setup...\n');
  
  const dbSetup = new DatabaseSetup();
  
  try {
    // Test connection first
    console.log('🔍 Testing database connection...');
    const connectionTest = await dbSetup.testConnection();
    
    if (!connectionTest.success) {
      console.error('❌ Database connection failed:', connectionTest.error);
      console.log('\n💡 Troubleshooting suggestions:');
      connectionTest.suggestions?.forEach(suggestion => {
        console.log(`   • ${suggestion}`);
      });
      process.exit(1);
    }
    
    console.log('✅ Database connection successful\n');
    
    // Setup database
    console.log('🔧 Setting up database...');
    const setupResult = await dbSetup.setupDatabase();
    
    if (!setupResult.success) {
      console.error('❌ Database setup failed:', setupResult.message);
      if (setupResult.error) {
        console.error('Error details:', setupResult.error);
      }
      process.exit(1);
    }
    
    console.log('✅ Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run "npm run db:seed" to populate with sample data');
    console.log('2. Run "npm run dev" to start the development server');
    console.log('3. Visit http://localhost:5000/health to verify everything is working');
    
  } catch (error) {
    console.error('💥 Setup failed:', error.message);
    process.exit(1);
  } finally {
    await dbSetup.cleanup();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
