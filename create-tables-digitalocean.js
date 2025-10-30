const { Pool } = require('pg');
require('dotenv').config();

// Disable TLS certificate verification for DigitalOcean database connections
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined,
    requestCert: false,
    agent: false
  }
});

async function createTablesDigitalOcean() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Creating tables for Digital Ocean...');
    
    // First, check what tables exist
    console.log('📋 Checking existing tables...');
    const existingTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Existing tables:', existingTables.rows.map(r => r.table_name));
    
    // Create users table
    console.log('🔧 Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        "ageRange" VARCHAR(50),
        "financialGoal" VARCHAR(100),
        "learningMode" VARCHAR(50),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');
    
    // Create user_progress table
    console.log('🔧 Creating user_progress table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL,
        level INTEGER DEFAULT 1,
        xp INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        badges JSONB DEFAULT '[]',
        "completedFacts" JSONB DEFAULT '[]',
        "completedLessons" JSONB DEFAULT '[]',
        "lastActiveDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ User progress table created');
    
    // Create user_portfolios table
    console.log('🔧 Creating user_portfolios table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_portfolios (
        id VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL,
        balance DECIMAL(15,2) DEFAULT 10000.00,
        "totalValue" DECIMAL(15,2) DEFAULT 10000.00,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ User portfolios table created');
    
    // Create daily_facts table
    console.log('🔧 Creating daily_facts table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_facts (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100),
        difficulty VARCHAR(50),
        "xpValue" INTEGER DEFAULT 10,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Daily facts table created');
    
    // Create courses table
    console.log('🔧 Creating courses table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content JSONB,
        difficulty VARCHAR(50),
        "estimatedTime" INTEGER,
        "order" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Courses table created');
    
    // Create quizzes table
    console.log('🔧 Creating quizzes table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        questions JSONB NOT NULL,
        "courseId" VARCHAR(255),
        difficulty VARCHAR(50),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Quizzes table created');
    
    // Create user_watchlist table
    console.log('🔧 Creating user_watchlist table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_watchlist (
        id VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL,
        symbol VARCHAR(10) NOT NULL,
        name VARCHAR(255),
        price DECIMAL(10,2) DEFAULT 0,
        "addedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ User watchlist table created');
    
    // Create additional tables that might be needed
    console.log('🔧 Creating additional tables...');
    
    // Portfolio transactions
    await client.query(`
      CREATE TABLE IF NOT EXISTS portfolio_transactions (
        id VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL,
        type VARCHAR(10) NOT NULL,
        symbol VARCHAR(10) NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        "totalValue" DECIMAL(15,2) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Portfolio holdings
    await client.query(`
      CREATE TABLE IF NOT EXISTS portfolio_holdings (
        id VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL,
        symbol VARCHAR(10) NOT NULL,
        quantity INTEGER NOT NULL,
        "averagePrice" DECIMAL(10,2) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Chat messages
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        context JSONB,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Ask messages
    await client.query(`
      CREATE TABLE IF NOT EXISTS ask_messages (
        id VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL,
        prompt TEXT NOT NULL,
        response TEXT NOT NULL,
        "responseTime" INTEGER,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Stock data
    await client.query(`
      CREATE TABLE IF NOT EXISTS stock_data (
        id VARCHAR(255) PRIMARY KEY,
        symbol VARCHAR(10) UNIQUE NOT NULL,
        name VARCHAR(255),
        price DECIMAL(10,2),
        change DECIMAL(10,2),
        "changePercent" DECIMAL(5,2),
        volume BIGINT,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Additional tables created');
    
    // Verify tables were created
    console.log('📋 Verifying tables...');
    const finalTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('Final tables:', finalTables.rows.map(r => r.table_name));
    
    console.log('🎉 All tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    console.error('Full error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createTablesDigitalOcean();
