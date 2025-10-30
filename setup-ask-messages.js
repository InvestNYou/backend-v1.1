#!/usr/bin/env node

/**
 * Quick Database Setup for ask_messages Table
 * This script creates the ask_messages table if it doesn't exist
 */

require('dotenv').config();
const DatabaseService = require('./src/services/databaseService');

async function setupAskMessagesTable() {
  console.log('🚀 Setting up ask_messages table...\n');
  
  const db = new DatabaseService();
  
  try {
    // Create the ask_messages table
    console.log('📝 Creating ask_messages table...');
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS ask_messages (
        id VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL,
        prompt TEXT NOT NULL,
        response TEXT NOT NULL,
        "responseTime" INTEGER,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ ask_messages table created/verified successfully');
    
    // Test the table
    console.log('\n🧪 Testing table...');
    const testId = 'test_' + Date.now();
    
    await db.query(`
      INSERT INTO ask_messages (id, "userId", prompt, response, "responseTime", "createdAt") 
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [testId, 'test_user', 'Test prompt', 'Test response', 100, new Date().toISOString()]);
    
    const result = await db.query('SELECT * FROM ask_messages WHERE id = $1', [testId]);
    
    if (result.length > 0) {
      console.log('✅ Table test successful');
    }
    
    // Clean up test data
    await db.query('DELETE FROM ask_messages WHERE id = $1', [testId]);
    console.log('🧹 Test data cleaned up');
    
    console.log('\n🎉 Setup completed successfully!');
    console.log('The ask_messages table is now ready for the AI feature.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('Error details:', error.stack);
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  setupAskMessagesTable().catch(console.error);
}

module.exports = setupAskMessagesTable;

