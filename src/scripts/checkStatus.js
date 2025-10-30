#!/usr/bin/env node

const DatabaseSetup = require('../utils/databaseSetup');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function checkStatus() {
  console.log('📊 Checking database status...\n');
  
  const dbSetup = new DatabaseSetup();
  const prisma = new PrismaClient();
  
  try {
    // Test connection
    console.log('🔌 Testing connection...');
    const connectionTest = await dbSetup.testConnection();
    
    if (!connectionTest.success) {
      console.log('❌ Connection failed:', connectionTest.error);
      return;
    }
    
    console.log('✅ Connection successful');
    
    // Check tables
    console.log('\n📋 Checking tables...');
    const tableCheck = await dbSetup.checkTablesExist();
    
    if (tableCheck.success) {
      console.log(`✅ Found ${tableCheck.tables.length} tables:`, tableCheck.tables);
    } else {
      console.log('❌ Failed to check tables:', tableCheck.error);
    }
    
    // Check data
    console.log('\n📊 Checking data...');
    try {
      const userCount = await prisma.user.count();
      const factCount = await prisma.dailyFact.count();
      const courseCount = await prisma.course.count();
      const stockCount = await prisma.stockData.count();
      
      console.log(`👥 Users: ${userCount}`);
      console.log(`📚 Daily facts: ${factCount}`);
      console.log(`🎓 Courses: ${courseCount}`);
      console.log(`📈 Stock data: ${stockCount}`);
      
      if (factCount === 0 && courseCount === 0) {
        console.log('\n💡 No sample data found. Run "npm run db:seed" to populate the database.');
      }
      
    } catch (error) {
      console.log('❌ Failed to check data:', error.message);
    }
    
    console.log('\n✅ Status check completed');
    
  } catch (error) {
    console.error('💥 Status check failed:', error.message);
  } finally {
    await dbSetup.cleanup();
    await prisma.$disconnect();
  }
}

// Run status check if called directly
if (require.main === module) {
  checkStatus();
}

module.exports = checkStatus;
