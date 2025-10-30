const express = require('express');
const DatabaseService = require('./src/services/databaseService');

const app = express();
const db = new DatabaseService();

app.use(express.json());

// Endpoint to create tables
app.post('/create-tables', async (req, res) => {
  try {
    console.log('🔧 Creating tables via API endpoint...');
    
    // Create users table
    await db.query(`
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
    await db.query(`
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
    await db.query(`
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
    await db.query(`
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
    
    // Create fact_completions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS fact_completions (
        id VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL,
        "factId" VARCHAR(255) NOT NULL,
        "completedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Fact completions table created');
    
    // Create additional essential tables
    await db.query(`
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
    
    await db.query(`
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
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        context JSONB,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS ask_messages (
        id VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        context JSONB,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_watchlist (
        id VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL,
        symbol VARCHAR(10) NOT NULL,
        name VARCHAR(255),
        price DECIMAL(10,2) DEFAULT 0,
        "addedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.query(`
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
    
    console.log('✅ All tables created successfully');
    
    res.json({ 
      success: true, 
      message: 'All tables created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Table creation server running on port ${PORT}`);
  console.log(`📋 Use POST /create-tables to create all tables`);
  console.log(`💚 Use GET /health to check database connection`);
});
