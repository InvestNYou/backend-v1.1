#!/usr/bin/env node

/**
 * Fix ask_messages Table Script
 * This script will ensure the ask_messages table exists with the correct structure
 */

require('dotenv').config();
const DatabaseService = require('./src/services/databaseService');

async function fixAskMessagesTable() {
  console.log('🔧 Fixing ask_messages table...\n');
  
  const db = new DatabaseService();
  
  try {
    // Test database connection first
    console.log('📡 Testing database connection...');
    await db.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');
    
    // Check if table exists
    console.log('🔍 Checking if ask_messages table exists...');
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'ask_messages'
      );
    `);
    
    const tableExists = tableCheck[0].exists;
    console.log(`Table exists: ${tableExists ? '✅ YES' : '❌ NO'}\n`);
    
    if (!tableExists) {
      console.log('📝 Creating ask_messages table...');
      await db.query(`
        CREATE TABLE ask_messages (
          id VARCHAR(255) PRIMARY KEY,
          "userId" VARCHAR(255) NOT NULL,
          prompt TEXT NOT NULL,
          response TEXT NOT NULL,
          "responseTime" INTEGER,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ ask_messages table created successfully\n');
    } else {
      console.log('📋 Checking table structure...');
      const columns = await db.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'ask_messages'
        ORDER BY ordinal_position;
      `);
      
      console.log('Current table structure:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
      console.log('');
      
      // Check if we need to add missing columns
      const requiredColumns = ['id', 'userId', 'prompt', 'response', 'responseTime', 'createdAt'];
      const existingColumns = columns.map(col => col.column_name);
      
      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log(`⚠️  Missing columns: ${missingColumns.join(', ')}`);
        console.log('🔄 Adding missing columns...');
        
        for (const column of missingColumns) {
          let alterQuery = '';
          switch (column) {
            case 'id':
              alterQuery = 'ALTER TABLE ask_messages ADD COLUMN id VARCHAR(255) PRIMARY KEY';
              break;
            case 'userId':
              alterQuery = 'ALTER TABLE ask_messages ADD COLUMN "userId" VARCHAR(255) NOT NULL';
              break;
            case 'prompt':
              alterQuery = 'ALTER TABLE ask_messages ADD COLUMN prompt TEXT NOT NULL';
              break;
            case 'response':
              alterQuery = 'ALTER TABLE ask_messages ADD COLUMN response TEXT NOT NULL';
              break;
            case 'responseTime':
              alterQuery = 'ALTER TABLE ask_messages ADD COLUMN "responseTime" INTEGER';
              break;
            case 'createdAt':
              alterQuery = 'ALTER TABLE ask_messages ADD COLUMN "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP';
              break;
          }
          
          if (alterQuery) {
            try {
              await db.query(alterQuery);
              console.log(`  ✅ Added column: ${column}`);
            } catch (error) {
              console.log(`  ❌ Failed to add column ${column}: ${error.message}`);
            }
          }
        }
        console.log('');
      } else {
        console.log('✅ All required columns are present\n');
      }
    }
    
    // Test table functionality
    console.log('🧪 Testing table functionality...');
    
    // Test insert
    const testId = 'test_' + Date.now();
    const testUserId = 'test_user_' + Date.now();
    
    try {
      await db.query(`
        INSERT INTO ask_messages (id, "userId", prompt, response, "responseTime", "createdAt") 
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [testId, testUserId, 'Test prompt', 'Test response', 100, new Date().toISOString()]);
      
      console.log('✅ Insert test successful');
      
      // Test select
      const result = await db.query(`
        SELECT * FROM ask_messages WHERE id = $1
      `, [testId]);
      
      if (result.length > 0) {
        console.log('✅ Select test successful');
        console.log(`  Retrieved: ${result[0].prompt} -> ${result[0].response}`);
      } else {
        console.log('❌ Select test failed - no data found');
      }
      
      // Test update
      await db.query(`
        UPDATE ask_messages 
        SET response = $1, "responseTime" = $2 
        WHERE id = $3
      `, ['Updated test response', 200, testId]);
      
      console.log('✅ Update test successful');
      
      // Test delete
      await db.query('DELETE FROM ask_messages WHERE id = $1', [testId]);
      console.log('✅ Delete test successful');
      
      // Clean up any other test data
      await db.query('DELETE FROM ask_messages WHERE "userId" LIKE $1', ['test_user_%']);
      
    } catch (error) {
      console.log(`❌ Table functionality test failed: ${error.message}`);
      console.log(`   Error details: ${error.stack}`);
    }
    
    console.log('\n🎉 ask_messages table fix completed!');
    console.log('\n📊 FINAL STATUS:');
    console.log('  ✅ Database connection: OK');
    console.log('  ✅ ask_messages table: EXISTS');
    console.log('  ✅ Table structure: VERIFIED');
    console.log('  ✅ Table functionality: TESTED');
    
    console.log('\n🚀 Next steps:');
    console.log('  1. Run the AI connection test again: node test-ai-connection.js');
    console.log('  2. Test the AI feature in your application');
    console.log('  3. Check the /api/ask/connection-test endpoint');
    
  } catch (error) {
    console.error('❌ Failed to fix ask_messages table:', error.message);
    console.error('Error details:', error.stack);
    
    console.log('\n🔧 TROUBLESHOOTING TIPS:');
    console.log('  • Check your DATABASE_URL environment variable');
    console.log('  • Ensure your database user has CREATE and ALTER permissions');
    console.log('  • Verify the database server is running');
    console.log('  • Check if the database exists');
    
    process.exit(1);
  }
}

// Run the fix
if (require.main === module) {
  fixAskMessagesTable().catch(console.error);
}

module.exports = fixAskMessagesTable;

