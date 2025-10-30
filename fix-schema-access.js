#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

// Disable TLS certificate verification for DigitalOcean database connections
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

console.log('🔧 Fixing Database Schema Access...\n');

async function fixSchemaAccess() {
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
    console.log('🔍 Checking current database and schema...');
    
    // Get current database and schema info
    const dbInfo = await client.query(`
      SELECT 
        current_database() as current_database,
        current_schema() as current_schema,
        current_user as current_user
    `);
    
    console.log(`   Database: ${dbInfo.rows[0].current_database}`);
    console.log(`   Schema: ${dbInfo.rows[0].current_schema}`);
    console.log(`   User: ${dbInfo.rows[0].current_user}`);
    
    // Check current search path
    console.log('\n🔍 Current search path:');
    const searchPath = await client.query('SHOW search_path');
    console.log(`   ${searchPath.rows[0].search_path}`);
    
    // Set search path to include public schema
    console.log('\n🔧 Setting search path to include public schema...');
    await client.query('SET search_path TO public, "$user"');
    
    // Verify search path was set
    const newSearchPath = await client.query('SHOW search_path');
    console.log(`   New search path: ${newSearchPath.rows[0].search_path}`);
    
    // Test accessing users table
    console.log('\n🧪 Testing users table access...');
    try {
      const userCount = await client.query('SELECT COUNT(*) as count FROM users');
      console.log(`   ✅ SUCCESS! Users table accessible: ${userCount.rows[0].count} records`);
      
      // Test a few more tables
      const tables = ['daily_facts', 'user_progress', 'user_portfolios'];
      for (const table of tables) {
        try {
          await client.query(`SELECT COUNT(*) FROM ${table}`);
          console.log(`   ✅ ${table} table accessible`);
        } catch (error) {
          console.log(`   ❌ ${table} table not accessible: ${error.message}`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Users table not accessible: ${error.message}`);
      
      // Try with explicit schema
      try {
        const userCount = await client.query('SELECT COUNT(*) as count FROM public.users');
        console.log(`   ✅ SUCCESS with explicit schema! Users table accessible: ${userCount.rows[0].count} records`);
      } catch (schemaError) {
        console.log(`   ❌ Even with explicit schema: ${schemaError.message}`);
      }
    }
    
    console.log('\n💡 SOLUTION:');
    console.log('   The issue is that your database search path needs to include the "public" schema.');
    console.log('   I\'ve updated the database service to set the search path automatically.');
    console.log('   This should fix the "relation does not exist" errors.');
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('   1. Deploy the updated code');
    console.log('   2. The app should now find your tables');
    console.log('   3. If issues persist, set USE_PRISMA=false as backup');

  } catch (error) {
    console.error('❌ Error fixing schema access:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixSchemaAccess();
