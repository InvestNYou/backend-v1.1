#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

// Disable TLS certificate verification for DigitalOcean database connections
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

console.log('🔍 Checking Database Schema Configuration...\n');

async function checkSchema() {
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
    console.log('📊 Database Information:');
    
    // Get database name and current schema
    const dbInfo = await client.query(`
      SELECT 
        current_database() as database_name,
        current_schema() as current_schema,
        current_user as current_user
    `);
    
    console.log(`🗄️  Database: ${dbInfo.rows[0].database_name}`);
    console.log(`📁 Current Schema: ${dbInfo.rows[0].current_schema}`);
    console.log(`👤 User: ${dbInfo.rows[0].current_user}`);
    
    // Check all schemas
    console.log('\n📋 Available Schemas:');
    const schemas = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY schema_name
    `);
    
    schemas.rows.forEach(schema => {
      console.log(`   • ${schema.schema_name}`);
    });
    
    // Check tables in each schema
    console.log('\n📊 Tables by Schema:');
    for (const schema of schemas.rows) {
      const schemaName = schema.schema_name;
      const tables = await client.query(`
        SELECT table_name
        FROM information_schema.tables 
        WHERE table_schema = $1
        ORDER BY table_name
      `, [schemaName]);
      
      if (tables.rows.length > 0) {
        console.log(`\n📁 Schema '${schemaName}' (${tables.rows.length} tables):`);
        tables.rows.forEach(table => {
          console.log(`   • ${table.table_name}`);
        });
      }
    }
    
    // Check specifically for our app tables
    console.log('\n🎯 Application Tables Found:');
    const appTables = await client.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables 
      WHERE table_name IN (
        'users', 'daily_facts', 'courses', 'lessons', 'user_progress', 
        'fact_completions', 'lesson_completions', 'user_portfolios', 
        'portfolio_transactions', 'chat_messages', 'stock_data', 
        'user_watchlist', 'portfolio_snapshots', 'quizzes', 
        'quiz_attempts', 'units', 'unit_tests', 'unit_test_attempts', 
        'ask_messages'
      )
      ORDER BY table_schema, table_name
    `);
    
    if (appTables.rows.length > 0) {
      appTables.rows.forEach(table => {
        console.log(`   ✅ ${table.table_schema}.${table.table_name}`);
      });
    } else {
      console.log(`   ❌ No application tables found!`);
    }
    
    // Check current search path
    console.log('\n🔍 Current Search Path:');
    const searchPath = await client.query('SHOW search_path');
    console.log(`   ${searchPath.rows[0].search_path}`);
    
    // Test table access
    console.log('\n🧪 Testing Table Access:');
    try {
      const testResult = await client.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
      `);
      
      const hasUsersTable = parseInt(testResult.rows[0].count) > 0;
      console.log(`   ${hasUsersTable ? '✅' : '❌'} Schema 'public': ${hasUsersTable ? 'Has users table' : 'No users table'}`);
      
      if (hasUsersTable) {
        try {
          await client.query(`SELECT COUNT(*) FROM public.users`);
          console.log(`      ✅ Can query public.users table`);
        } catch (queryError) {
          console.log(`      ❌ Cannot query public.users: ${queryError.message}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Schema 'public': Error - ${error.message}`);
    }
    
    console.log('\n💡 Recommendations:');
    if (appTables.rows.some(t => t.table_schema === 'public')) {
      console.log('   • Your tables are in the "public" schema');
      console.log('   • This is the standard configuration');
    } else {
      console.log('   • No application tables found in expected schemas');
      console.log('   • You may need to create the tables');
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkSchema();
