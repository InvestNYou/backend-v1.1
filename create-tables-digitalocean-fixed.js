#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

// Disable TLS certificate verification for DigitalOcean database connections
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

console.log('🌊 Digital Ocean Table Creation Script');
console.log('=====================================\n');

async function createTablesForDigitalOcean() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
      checkServerIdentity: () => undefined,
      requestCert: false,
      agent: false
    }
  });

  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking database permissions...');
    
    // Test basic permissions
    try {
      await client.query('SELECT 1');
      console.log('✅ Basic SELECT permission confirmed');
    } catch (error) {
      console.error('❌ No SELECT permission:', error.message);
      return;
    }

    // Check if we can create tables
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS permission_test (
          id SERIAL PRIMARY KEY,
          test_field TEXT
        )
      `);
      console.log('✅ CREATE TABLE permission confirmed');
      
      // Clean up test table
      await client.query('DROP TABLE IF EXISTS permission_test');
      console.log('✅ DROP TABLE permission confirmed');
      
    } catch (error) {
      console.error('❌ No CREATE TABLE permission:', error.message);
      console.log('\n💡 Digital Ocean Permission Issue:');
      console.log('   Your database user does not have CREATE permissions.');
      console.log('   This is common with Digital Ocean managed databases.');
      console.log('\n🔧 Solutions:');
      console.log('   1. Contact Digital Ocean support to grant CREATE permissions');
      console.log('   2. Use the Digital Ocean dashboard to create tables manually');
      console.log('   3. Use a different database user with CREATE permissions');
      console.log('   4. Create tables using pgAdmin or another database tool');
      return;
    }

    console.log('\n🔧 Creating application tables...');
    
    // Create users table
    console.log('📋 Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT,
        "ageRange" TEXT,
        "financialGoal" TEXT,
        "learningMode" TEXT NOT NULL DEFAULT 'facts',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      )
    `);
    console.log('✅ Users table created');

    // Create user_progress table
    console.log('📋 Creating user_progress table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "user_progress" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL UNIQUE,
        "level" INTEGER NOT NULL DEFAULT 1,
        "xp" INTEGER NOT NULL DEFAULT 0,
        "streak" INTEGER NOT NULL DEFAULT 0,
        "badges" JSONB NOT NULL DEFAULT '[]',
        "completedFacts" JSONB NOT NULL DEFAULT '[]',
        "completedLessons" JSONB NOT NULL DEFAULT '[]',
        "lastActiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      )
    `);
    console.log('✅ User progress table created');

    // Create daily_facts table
    console.log('📋 Creating daily_facts table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "daily_facts" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "xpValue" INTEGER NOT NULL DEFAULT 25,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      )
    `);
    console.log('✅ Daily facts table created');

    // Create fact_completions table
    console.log('📋 Creating fact_completions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "fact_completions" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "factId" INTEGER NOT NULL,
        "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Fact completions table created');

    // Create user_portfolios table
    console.log('📋 Creating user_portfolios table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "user_portfolios" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL UNIQUE,
        "balance" DECIMAL(10,2) NOT NULL DEFAULT 10000.00,
        "totalValue" DECIMAL(10,2) NOT NULL DEFAULT 10000.00,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      )
    `);
    console.log('✅ User portfolios table created');

    // Create portfolio_transactions table
    console.log('📋 Creating portfolio_transactions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "portfolio_transactions" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "symbol" TEXT NOT NULL,
        "shares" DECIMAL(10,4) NOT NULL,
        "price" DECIMAL(10,2) NOT NULL,
        "total" DECIMAL(10,2) NOT NULL,
        "type" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Portfolio transactions table created');

    // Create chat_messages table
    console.log('📋 Creating chat_messages table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "chat_messages" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "prompt" TEXT NOT NULL,
        "response" TEXT,
        "model" TEXT,
        "tokensUsed" INTEGER,
        "responseTime" INTEGER,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      )
    `);
    console.log('✅ Chat messages table created');

    // Create additional essential tables
    console.log('📋 Creating additional tables...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS "courses" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL UNIQUE,
        "description" TEXT,
        "lessonsCount" INTEGER NOT NULL DEFAULT 0,
        "thumbnail" TEXT,
        "color" TEXT,
        "isLocked" BOOLEAN NOT NULL DEFAULT false,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "units" (
        "id" SERIAL PRIMARY KEY,
        "courseId" INTEGER NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "lessons" (
        "id" SERIAL PRIMARY KEY,
        "unitId" INTEGER NOT NULL,
        "title" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        "xpValue" INTEGER NOT NULL DEFAULT 50,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "watchlist" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "symbol" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "price" DECIMAL(10,2),
        "notes" TEXT,
        "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      )
    `);

    console.log('✅ Additional tables created');

    // Add foreign key constraints (if possible)
    console.log('\n🔗 Adding foreign key constraints...');
    try {
      await client.query(`
        ALTER TABLE "user_progress" 
        ADD CONSTRAINT "user_progress_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `);
      console.log('✅ User progress foreign key added');

      await client.query(`
        ALTER TABLE "fact_completions" 
        ADD CONSTRAINT "fact_completions_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `);
      console.log('✅ Fact completions user foreign key added');

      await client.query(`
        ALTER TABLE "fact_completions" 
        ADD CONSTRAINT "fact_completions_factId_fkey" 
        FOREIGN KEY ("factId") REFERENCES "daily_facts"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `);
      console.log('✅ Fact completions fact foreign key added');

      await client.query(`
        ALTER TABLE "user_portfolios" 
        ADD CONSTRAINT "user_portfolios_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `);
      console.log('✅ User portfolios foreign key added');

      await client.query(`
        ALTER TABLE "portfolio_transactions" 
        ADD CONSTRAINT "portfolio_transactions_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `);
      console.log('✅ Portfolio transactions foreign key added');

      await client.query(`
        ALTER TABLE "chat_messages" 
        ADD CONSTRAINT "chat_messages_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `);
      console.log('✅ Chat messages foreign key added');

    } catch (fkError) {
      console.warn('⚠️ Some foreign key constraints could not be added:', fkError.message);
      console.log('💡 This is normal for Digital Ocean - tables will still work');
    }

    // Add unique constraints
    console.log('\n🔑 Adding unique constraints...');
    try {
      await client.query(`
        ALTER TABLE "fact_completions" 
        ADD CONSTRAINT "fact_completions_userId_factId_key" 
        UNIQUE ("userId", "factId")
      `);
      console.log('✅ Fact completions unique constraint added');

      await client.query(`
        ALTER TABLE "watchlist" 
        ADD CONSTRAINT "watchlist_userId_symbol_key" 
        UNIQUE ("userId", "symbol")
      `);
      console.log('✅ Watchlist unique constraint added');

    } catch (uniqueError) {
      console.warn('⚠️ Some unique constraints could not be added:', uniqueError.message);
    }

    // Verify tables were created
    console.log('\n📋 Verifying tables...');
    const finalTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📊 Created tables:', finalTables.rows.map(r => r.table_name));
    
    const essentialTables = ['users', 'daily_facts', 'user_progress', 'user_portfolios'];
    const hasEssentialTables = essentialTables.every(table => 
      finalTables.rows.some(r => r.table_name === table)
    );
    
    if (hasEssentialTables) {
      console.log('\n🎉 SUCCESS! All essential tables created successfully!');
      console.log('✅ Your Digital Ocean database is ready for the application');
    } else {
      console.log('\n⚠️ WARNING: Some essential tables are missing');
      console.log('❌ The application may not work correctly');
    }

  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    console.error('Full error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
createTablesForDigitalOcean();
