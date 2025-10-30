#!/usr/bin/env node

/**
 * AI Connection Test Script
 * Tests OpenAI API connectivity, environment variables, and database connections
 */

require('dotenv').config();
const OpenAI = require('openai');
const DatabaseService = require('./src/services/databaseService');

class AIConnectionTester {
  constructor() {
    this.db = new DatabaseService();
    this.results = {
      environment: {},
      openai: {},
      database: {},
      overall: 'UNKNOWN'
    };
  }

  async runAllTests() {
    console.log('🔍 AI Connection Test Starting...\n');
    
    try {
      await this.testEnvironmentVariables();
      await this.testOpenAIConnection();
      await this.testDatabaseConnection();
      await this.testAskMessagesTable();
      
      this.determineOverallStatus();
      this.printResults();
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      this.results.overall = 'FAILED';
    }
  }

  async testEnvironmentVariables() {
    console.log('📋 Testing Environment Variables...');
    
    const requiredVars = {
      'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
      'OPENAI_MODEL': process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      'OPENAI_MAX_TOKENS': process.env.OPENAI_MAX_TOKENS || '2000',
      'DATABASE_URL': process.env.DATABASE_URL,
      'JWT_SECRET': process.env.JWT_SECRET,
      'NODE_ENV': process.env.NODE_ENV || 'development'
    };

    let allPresent = true;
    
    for (const [key, value] of Object.entries(requiredVars)) {
      const isPresent = !!value;
      const displayValue = this.maskSensitiveValue(key, value);
      
      console.log(`  ${isPresent ? '✅' : '❌'} ${key}: ${displayValue}`);
      
      if (!isPresent && key !== 'OPENAI_MAX_TOKENS') {
        allPresent = false;
      }
    }

    this.results.environment = {
      status: allPresent ? 'PASS' : 'FAIL',
      variables: requiredVars,
      missing: Object.entries(requiredVars)
        .filter(([key, value]) => !value && key !== 'OPENAI_MAX_TOKENS')
        .map(([key]) => key)
    };

    console.log(`\n  Environment Status: ${allPresent ? '✅ PASS' : '❌ FAIL'}\n`);
  }

  async testOpenAIConnection() {
    console.log('🤖 Testing OpenAI API Connection...');
    
    if (!process.env.OPENAI_API_KEY) {
      console.log('  ❌ No API key found - skipping OpenAI test');
      this.results.openai = { status: 'FAIL', error: 'No API key' };
      return;
    }

    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });

      const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
      const maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 2000;

      console.log(`  📡 Testing with model: ${model}`);
      console.log(`  📡 Max tokens: ${maxTokens}`);

      const startTime = Date.now();
      
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. Respond with exactly "Connection test successful" and nothing else.'
          },
          {
            role: 'user',
            content: 'Test connection'
          }
        ],
        max_completion_tokens: 50
      });

      const responseTime = Date.now() - startTime;
      const response = completion.choices[0].message.content;
      const tokensUsed = completion.usage.total_tokens;

      console.log(`  ✅ Response received: "${response}"`);
      console.log(`  ⏱️  Response time: ${responseTime}ms`);
      console.log(`  🎯 Tokens used: ${tokensUsed}`);

      this.results.openai = {
        status: 'PASS',
        response: response,
        responseTime: responseTime,
        tokensUsed: tokensUsed,
        model: model
      };

    } catch (error) {
      console.log(`  ❌ OpenAI API Error: ${error.message}`);
      console.log(`  📊 Error code: ${error.code || 'UNKNOWN'}`);
      console.log(`  📊 Error type: ${error.type || 'UNKNOWN'}`);
      
      this.results.openai = {
        status: 'FAIL',
        error: error.message,
        code: error.code,
        type: error.type
      };
    }

    console.log(`\n  OpenAI Status: ${this.results.openai.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}\n`);
  }

  async testDatabaseConnection() {
    console.log('🗄️  Testing Database Connection...');
    
    try {
      // Test basic connection
      const testQuery = await this.db.query('SELECT NOW() as current_time');
      const currentTime = testQuery[0].current_time;
      
      console.log(`  ✅ Database connected successfully`);
      console.log(`  ⏰ Server time: ${currentTime}`);

      this.results.database = {
        status: 'PASS',
        serverTime: currentTime
      };

    } catch (error) {
      console.log(`  ❌ Database Error: ${error.message}`);
      
      this.results.database = {
        status: 'FAIL',
        error: error.message
      };
    }

    console.log(`\n  Database Status: ${this.results.database.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}\n`);
  }

  async testAskMessagesTable() {
    console.log('📝 Testing ask_messages Table...');
    
    try {
      // Check if table exists
      const tableCheck = await this.db.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'ask_messages'
        );
      `);
      
      const tableExists = tableCheck[0].exists;
      
      if (!tableExists) {
        console.log('  ❌ ask_messages table does not exist');
        this.results.database.askMessagesTable = 'MISSING';
        return;
      }

      console.log('  ✅ ask_messages table exists');

      // Check table structure
      const columns = await this.db.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'ask_messages'
        ORDER BY ordinal_position;
      `);

      console.log('  📋 Table structure:');
      columns.forEach(col => {
        console.log(`    - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULLABLE)'}`);
      });

      // Test insert/select
      const testId = 'test_' + Date.now();
      const testPrompt = 'Test prompt';
      const testResponse = 'Test response';
      
      await this.db.query(`
        INSERT INTO ask_messages (id, "userId", prompt, response, "responseTime", "createdAt") 
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [testId, 'test_user', testPrompt, testResponse, 100, new Date().toISOString()]);

      const inserted = await this.db.query(`
        SELECT * FROM ask_messages WHERE id = $1
      `, [testId]);

      if (inserted.length > 0) {
        console.log('  ✅ Insert/Select test successful');
        
        // Clean up test data
        await this.db.query('DELETE FROM ask_messages WHERE id = $1', [testId]);
        console.log('  🧹 Test data cleaned up');
      }

      this.results.database.askMessagesTable = 'OK';

    } catch (error) {
      console.log(`  ❌ ask_messages table error: ${error.message}`);
      this.results.database.askMessagesTable = 'ERROR';
    }

    console.log(`\n  ask_messages Status: ${this.results.database.askMessagesTable === 'OK' ? '✅ OK' : '❌ ISSUE'}\n`);
  }

  determineOverallStatus() {
    const envOk = this.results.environment.status === 'PASS';
    const openaiOk = this.results.openai.status === 'PASS';
    const dbOk = this.results.database.status === 'PASS';
    const tableOk = this.results.database.askMessagesTable === 'OK';

    if (envOk && openaiOk && dbOk && tableOk) {
      this.results.overall = 'PASS';
    } else if (envOk && dbOk && tableOk) {
      this.results.overall = 'PARTIAL'; // OpenAI might be down but system is configured
    } else {
      this.results.overall = 'FAIL';
    }
  }

  printResults() {
    console.log('📊 FINAL RESULTS');
    console.log('================\n');
    
    console.log(`Overall Status: ${this.getStatusIcon()} ${this.results.overall}`);
    console.log(`Environment: ${this.getStatusIcon(this.results.environment.status)} ${this.results.environment.status}`);
    console.log(`OpenAI API: ${this.getStatusIcon(this.results.openai.status)} ${this.results.openai.status}`);
    console.log(`Database: ${this.getStatusIcon(this.results.database.status)} ${this.results.database.status}`);
    console.log(`ask_messages: ${this.getStatusIcon(this.results.database.askMessagesTable === 'OK' ? 'PASS' : 'FAIL')} ${this.results.database.askMessagesTable}`);

    console.log('\n🔧 TROUBLESHOOTING TIPS:');
    
    if (this.results.environment.status === 'FAIL') {
      console.log('  • Check your .env file for missing environment variables');
      console.log('  • Ensure OPENAI_API_KEY is set correctly');
      console.log('  • Verify DATABASE_URL is properly formatted');
    }
    
    if (this.results.openai.status === 'FAIL') {
      console.log('  • Verify your OpenAI API key is valid and active');
      console.log('  • Check if you have sufficient API credits');
      console.log('  • Ensure your API key has the correct permissions');
      console.log('  • Check OpenAI service status at https://status.openai.com/');
    }
    
    if (this.results.database.status === 'FAIL') {
      console.log('  • Check your DATABASE_URL connection string');
      console.log('  • Ensure your database server is running');
      console.log('  • Verify network connectivity to the database');
    }
    
    if (this.results.database.askMessagesTable !== 'OK') {
      console.log('  • Run the database setup script to create missing tables');
      console.log('  • Check if the ask_messages table has the correct structure');
    }

    console.log('\n🚀 NEXT STEPS:');
    if (this.results.overall === 'PASS') {
      console.log('  ✅ All systems are working! The AI should be functional.');
    } else if (this.results.overall === 'PARTIAL') {
      console.log('  ⚠️  System is configured but OpenAI API has issues.');
      console.log('  • Check OpenAI API status and credits');
      console.log('  • The AI feature may work intermittently');
    } else {
      console.log('  ❌ Critical issues found. Fix the failing components above.');
      console.log('  • Start with environment variables and database connection');
      console.log('  • Then test OpenAI API connectivity');
    }
  }

  getStatusIcon(status = this.results.overall) {
    switch (status) {
      case 'PASS':
      case 'OK':
        return '✅';
      case 'PARTIAL':
        return '⚠️';
      case 'FAIL':
      case 'ERROR':
      case 'MISSING':
        return '❌';
      default:
        return '❓';
    }
  }

  maskSensitiveValue(key, value) {
    if (!value) return 'NOT_SET';
    
    const sensitiveKeys = ['OPENAI_API_KEY', 'JWT_SECRET', 'DATABASE_URL'];
    
    if (sensitiveKeys.includes(key)) {
      if (key === 'DATABASE_URL') {
        // Mask password in database URL
        return value.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@');
      } else {
        // Show first 8 and last 4 characters
        return `${value.substring(0, 8)}...${value.substring(value.length - 4)}`;
      }
    }
    
    return value;
  }
}

// Run the test
async function main() {
  const tester = new AIConnectionTester();
  await tester.runAllTests();
  
  // Exit with appropriate code
  process.exit(tester.results.overall === 'PASS' ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = AIConnectionTester;

