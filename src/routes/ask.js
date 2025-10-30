const express = require('express');
const DatabaseService = require('../services/databaseService');
const { authenticateToken } = require('../middleware/auth');
const { validateChatMessage } = require('../middleware/validation');
const GPTService = require('../services/gptService');

const router = express.Router();
const db = new DatabaseService();
const gptService = new GPTService();

// Debug logging utility
const debugLog = (endpoint, message, data = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[ASK DEBUG ${ require('crypto').randomBytes(4).toString('hex').toUpperCase() }] ${timestamp}`);
  console.log(`[ENDPOINT: ${endpoint}] ${message}`);
  if (Object.keys(data).length > 0) {
    console.log(`[DATA]`, JSON.stringify(data, null, 2));
  }
  console.log('─'.repeat(80));
};

// Enhanced error logging
const errorLog = (endpoint, error, context = {}) => {
  const timestamp = new Date().toISOString();
  console.error(`\n[ASK ERROR ${ require('crypto').randomBytes(4).toString('hex').toUpperCase() }] ${timestamp}`);
  console.error(`[ENDPOINT: ${endpoint}] Error occurred`);
  console.error(`[ERROR MESSAGE] ${error.message}`);
  console.error(`[ERROR STACK] ${error.stack}`);
  if (error.code) console.error(`[ERROR CODE] ${error.code}`);
  if (error.status) console.error(`[ERROR STATUS] ${error.status}`);
  if (error.response) console.error(`[ERROR RESPONSE]`, JSON.stringify(error.response, null, 2));
  if (Object.keys(context).length > 0) {
    console.error(`[CONTEXT]`, JSON.stringify(context, null, 2));
  }
  console.error('─'.repeat(80));
};

// Get suggested questions (no authentication required)
router.get('/suggestions', async (req, res) => {
  const requestId = require('crypto').randomBytes(4).toString('hex').toUpperCase();
  debugLog('GET /suggestions', 'Request received', { requestId });
  
  try {
    const suggestions = [
      "What's a Roth IRA?",
      "How do taxes work?",
      "What's the difference between stocks and bonds?",
      "How do I start investing?",
      "What's compound interest?",
      "How do I build an emergency fund?",
      "What's dollar-cost averaging?",
      "How do I choose between different investment accounts?",
      "What's the difference between ETFs and mutual funds?",
      "How do I calculate my risk tolerance?"
    ];

    debugLog('GET /suggestions', 'Successfully returning suggestions', { 
      requestId, 
      count: suggestions.length 
    });

    res.json({
      success: true,
      data: {
        suggestions
      }
    });
  } catch (error) {
    errorLog('GET /suggestions', error, { requestId });
    res.status(500).json({ 
      success: false,
      error: 'Failed to get suggestions' 
    });
  }
});

// Ask AI a quick question without conversation history
router.post('/quick', async (req, res) => {
  try {
    const { message } = req.body;
    const startTime = Date.now();
    
    console.log('\n=== QUICK QUESTION REQUEST ===');
    console.log(`Prompt: "${message}"`);
    console.log(`Timestamp: ${new Date().toISOString()}`);

    // Generate AI response without history
    console.log('\n--- Generating AI response (no history) ---');
    const response = await gptService.generateResponse(message);

    const responseTime = Date.now() - startTime;
    console.log(`Response generated in ${responseTime}ms`);

    res.json({
      success: true,
      data: {
        id: db.generateId(),
        answer: response.response,
        createdAt: new Date().toISOString()
      },
      responseTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Quick question error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process question',
      details: error.message 
    });
  }
});

// Get AI service status
router.get('/status', async (req, res) => {
  const requestId = require('crypto').randomBytes(4).toString('hex').toUpperCase();
  debugLog('GET /status', 'Checking AI service status', { requestId });
  
  try {
    const modelInfo = gptService.getModelInfo();
    debugLog('GET /status', 'Model info retrieved', { requestId, modelInfo });
    
    const isAvailable = await gptService.validateService();
    debugLog('GET /status', 'Service validation completed', { 
      requestId, 
      isAvailable,
      hasApiKey: !!process.env.OPENAI_API_KEY 
    });
    
    const response = {
      success: true,
      data: {
        available: isAvailable,
        model: modelInfo.model,
        maxTokens: modelInfo.maxTokens,
        hasApiKey: !!process.env.OPENAI_API_KEY,
        timestamp: new Date().toISOString()
      }
    };
    
    debugLog('GET /status', 'Sending status response', { requestId, response });
    
    res.json(response);
  } catch (error) {
    errorLog('GET /status', error, { requestId });
    res.status(500).json({ 
      success: false,
      error: 'Failed to get AI status',
      message: error.message 
    });
  }
});

// Test AI service directly (for debugging)
router.post('/test', async (req, res) => {
  try {
    console.log('\n=== AI TEST REQUEST ===');
    console.log('Testing GPT service directly...');
    
    const testResponse = await gptService.generateResponse('Hello, can you help me with investing?');
    
    console.log('Test response:', testResponse);
    
    res.json({
      success: true,
      testResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ AI Test error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: error.stack
    });
  }
});

// Comprehensive AI connection test endpoint
router.get('/connection-test', async (req, res) => {
  try {
    console.log('\n=== AI CONNECTION TEST REQUEST ===');
    
    const testResults = {
      timestamp: new Date().toISOString(),
      environment: {},
      openai: {},
      database: {},
      overall: 'UNKNOWN'
    };

    // Test 1: Environment Variables
    console.log('Testing environment variables...');
    const envVars = {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      OPENAI_MAX_TOKENS: process.env.OPENAI_MAX_TOKENS || '2000',
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET
    };
    
    testResults.environment = {
      status: Object.values(envVars).every(v => v === true || typeof v === 'string') ? 'PASS' : 'FAIL',
      variables: envVars
    };

    // Test 2: OpenAI API Connection
    console.log('Testing OpenAI API connection...');
    if (process.env.OPENAI_API_KEY) {
      try {
        const startTime = Date.now();
        const testResponse = await gptService.generateResponse('Hello, respond with exactly "Connection test successful"');
        const responseTime = Date.now() - startTime;
        
        testResults.openai = {
          status: testResponse.success ? 'PASS' : 'FAIL',
          response: testResponse.response,
          responseTime: responseTime,
          tokensUsed: testResponse.tokensUsed,
          error: testResponse.error
        };
      } catch (error) {
        testResults.openai = {
          status: 'FAIL',
          error: error.message,
          code: error.code
        };
      }
    } else {
      testResults.openai = {
        status: 'FAIL',
        error: 'No API key configured'
      };
    }

    // Test 3: Database Connection
    console.log('Testing database connection...');
    try {
      const dbTest = await db.query('SELECT NOW() as current_time');
      testResults.database = {
        status: 'PASS',
        serverTime: dbTest[0].current_time
      };
    } catch (error) {
      testResults.database = {
        status: 'FAIL',
        error: error.message
      };
    }

    // Test 4: ask_messages Table
    console.log('Testing ask_messages table...');
    try {
      const tableCheck = await db.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'ask_messages'
        );
      `);
      
      if (tableCheck[0].exists) {
        // Test insert/select
        const testId = 'test_' + Date.now();
        await db.query(`
          INSERT INTO ask_messages (id, "userId", prompt, response, "responseTime", "createdAt") 
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [testId, 'test_user', 'test', 'test', 100, new Date().toISOString()]);
        
        await db.query('DELETE FROM ask_messages WHERE id = $1', [testId]);
        
        testResults.database.askMessagesTable = 'OK';
      } else {
        testResults.database.askMessagesTable = 'MISSING';
      }
    } catch (error) {
      testResults.database.askMessagesTable = 'ERROR';
      testResults.database.tableError = error.message;
    }

    // Determine overall status
    const envOk = testResults.environment.status === 'PASS';
    const openaiOk = testResults.openai.status === 'PASS';
    const dbOk = testResults.database.status === 'PASS';
    const tableOk = testResults.database.askMessagesTable === 'OK';

    if (envOk && openaiOk && dbOk && tableOk) {
      testResults.overall = 'PASS';
    } else if (envOk && dbOk && tableOk) {
      testResults.overall = 'PARTIAL';
    } else {
      testResults.overall = 'FAIL';
    }

    console.log('Connection test completed:', testResults.overall);
    
    res.json({
      success: true,
      data: testResults
    });

  } catch (error) {
    console.error('❌ Connection test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
});

// Check environment variables (for debugging)
router.get('/env-check', async (req, res) => {
  try {
    const envInfo = {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 8)}...${process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 4)}` : 'NOT_SET',
      OPENAI_MODEL: process.env.OPENAI_MODEL || 'NOT_SET',
      OPENAI_MAX_TOKENS: process.env.OPENAI_MAX_TOKENS || 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT_SET'
    };
    
    console.log('Environment check:', envInfo);
    
    res.json({
      success: true,
      envInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Environment check error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message
    });
  }
});

// Ask AI a question - main endpoint for the Ask feature
router.post('/question', authenticateToken, validateChatMessage, async (req, res) => {
  const requestId = require('crypto').randomBytes(4).toString('hex').toUpperCase();
  const startTime = Date.now();
  
  try {
    const { message } = req.body;
    
    debugLog('POST /question', 'New question request received', {
      requestId,
      userId: req.user.id,
      userEmail: req.user.email,
      messageLength: message?.length || 0,
      messagePreview: message?.substring(0, 100) || 'No message',
      timestamp: new Date().toISOString()
    });

    // Validate message
    if (!message || !message.trim()) {
      errorLog('POST /question', new Error('Empty message provided'), { requestId });
      return res.status(400).json({
        success: false,
        error: 'Message cannot be empty'
      });
    }

    // Get recent conversation history for context (last 5 messages)
    debugLog('POST /question', 'Fetching conversation history', { requestId, userId: req.user.id });
    
    let recentMessages = [];
    try {
      recentMessages = await db.query(
        'SELECT prompt, response, "createdAt" FROM ask_messages WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 5',
        [req.user.id]
      );
      debugLog('POST /question', 'Conversation history retrieved', {
        requestId,
        messageCount: recentMessages.length
      });
    } catch (dbError) {
      errorLog('POST /question', dbError, { requestId, step: 'fetch_history' });
      recentMessages = [];
    }

    // Convert database format to GPT service format
    const conversationHistory = [];
    recentMessages.reverse().forEach(msg => {
      if (msg.prompt) {
        conversationHistory.push({
          role: 'user',
          content: msg.prompt
        });
      }
      if (msg.response) {
        conversationHistory.push({
          role: 'assistant',
          content: msg.response
        });
      }
    });

    debugLog('POST /question', 'Prepared conversation history', {
      requestId,
      historyLength: conversationHistory.length
    });

    // Generate AI response
    debugLog('POST /question', 'Calling GPT service', {
      requestId,
      hasHistory: conversationHistory.length > 0,
      model: gptService.getModelInfo().model
    });
    
    const gptStartTime = Date.now();
    const response = await gptService.generateResponseWithHistory(message, conversationHistory);
    const gptResponseTime = Date.now() - gptStartTime;

    debugLog('POST /question', 'GPT service response received', {
      requestId,
      success: response.success,
      responseTime: gptResponseTime,
      responseLength: response.response?.length || 0,
      tokensUsed: response.tokensUsed || 0,
      hasError: !!response.error,
      errorCode: response.errorCode || null
    });

    // Check if GPT service returned an error
    if (!response.success) {
      errorLog('POST /question', new Error(response.error || 'GPT service error'), {
        requestId,
        errorCode: response.errorCode,
        response
      });
      
      return res.status(500).json({
        success: false,
        error: 'AI service temporarily unavailable',
        details: response.error || 'Unknown error',
        code: response.errorCode || 'GPT_ERROR',
        requestId,
        debug: process.env.NODE_ENV !== 'production' ? {
          errorMessage: response.error,
          errorCode: response.errorCode,
          model: response.model,
          responseTime: response.responseTime
        } : undefined
      });
    }

    // Save the conversation
    debugLog('POST /question', 'Saving conversation to database', { requestId });
    
    const totalResponseTime = Date.now() - startTime;
    const messageId = db.generateId();
    
    try {
      await db.query(
        'INSERT INTO ask_messages (id, "userId", prompt, response, "responseTime", "createdAt") VALUES ($1, $2, $3, $4, $5, $6)',
        [messageId, req.user.id, message, response.response, totalResponseTime, new Date().toISOString()]
      );
      
      debugLog('POST /question', 'Conversation saved successfully', {
        requestId,
        messageId,
        totalResponseTime
      });
    } catch (saveError) {
      errorLog('POST /question', saveError, { requestId, step: 'save_conversation' });
    }

    const finalResponse = {
      success: true,
      data: {
        id: messageId,
        answer: response.response,
        createdAt: new Date().toISOString()
      },
      responseTime: totalResponseTime,
      gptResponseTime: gptResponseTime,
      tokensUsed: response.tokensUsed || 0,
      timestamp: new Date().toISOString(),
      requestId
    };

    debugLog('POST /question', 'Request completed successfully', {
      requestId,
      totalTime: totalResponseTime,
      responseLength: response.response?.length || 0
    });

    res.json(finalResponse);

  } catch (error) {
    const totalResponseTime = Date.now() - startTime;
    errorLog('POST /question', error, {
      requestId,
      userId: req.user?.id,
      responseTime: totalResponseTime
    });
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to process question',
      details: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      requestId
    });
  }
});

// Get ask history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const messages = await db.query(
      'SELECT * FROM ask_messages WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3',
      [req.user.id, parseInt(limit), parseInt(skip)]
    );

    const totalResult = await db.query(
      'SELECT COUNT(*) as count FROM ask_messages WHERE "userId" = $1',
      [req.user.id]
    );
    const total = parseInt(totalResult[0].count);

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get ask history error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get ask history',
      details: error.message 
    });
  }
});

// Clear ask history
router.delete('/history', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM ask_messages WHERE "userId" = $1', [req.user.id]);

    res.json({ 
      success: true,
      message: 'Ask history cleared' 
    });
  } catch (error) {
    console.error('Clear ask history error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to clear ask history',
      details: error.message 
    });
  }
});

// Simple test endpoint - no auth required, returns environment check and quick AI test
router.get('/test', async (req, res) => {
  const requestId = require('crypto').randomBytes(4).toString('hex').toUpperCase();
  debugLog('GET /test', 'Test endpoint called', { requestId });
  
  const testResult = {
    success: true,
    requestId,
    timestamp: new Date().toISOString(),
    environment: {
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      openaiKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
      openaiKeyPrefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 8) + '...' : 'NOT_SET',
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      maxTokens: process.env.OPENAI_MAX_TOKENS || '2000',
      nodeEnv: process.env.NODE_ENV || 'development'
    },
    service: {
      model: gptService.getModelInfo().model,
      maxTokens: gptService.getModelInfo().maxTokens,
      available: gptService.getModelInfo().available
    },
    tests: {
      quickTest: null,
      detailedTest: null
    }
  };

  // Quick test - just validate API key format (starts with sk-)
  if (process.env.OPENAI_API_KEY) {
    testResult.tests.quickTest = {
      hasApiKey: true,
      keyFormatValid: process.env.OPENAI_API_KEY.startsWith('sk-'),
      keyLength: process.env.OPENAI_API_KEY.length
    };
  } else {
    testResult.tests.quickTest = {
      hasApiKey: false,
      error: 'OPENAI_API_KEY environment variable is not set'
    };
  }

  // Detailed test - try to make an actual API call (if API key exists)
  if (process.env.OPENAI_API_KEY && testResult.tests.quickTest.keyFormatValid) {
    try {
      debugLog('GET /test', 'Running detailed AI test...', { requestId });
      const startTime = Date.now();
      const testResponse = await gptService.generateResponse('Say "OK" and nothing else.');
      const duration = Date.now() - startTime;
      
      testResult.tests.detailedTest = {
        success: testResponse.success,
        duration: `${duration}ms`,
        responseLength: testResponse.response?.length || 0,
        tokensUsed: testResponse.tokensUsed || 0,
        error: testResponse.error || null,
        errorCode: testResponse.errorCode || null,
        responsePreview: testResponse.response ? testResponse.response.substring(0, 50) : null
      };
      
      debugLog('GET /test', 'Detailed test completed', { requestId, result: testResult.tests.detailedTest });
    } catch (error) {
      testResult.tests.detailedTest = {
        success: false,
        error: error.message,
        errorCode: error.code,
        statusCode: error.statusCode
      };
      errorLog('GET /test', error, { requestId, step: 'detailed_test' });
    }
  } else {
    testResult.tests.detailedTest = {
      skipped: true,
      reason: 'API key not available or invalid format'
    };
  }

  debugLog('GET /test', 'Test completed', { requestId });
  
  res.json({
    success: true,
    data: testResult
  });
});

// Comprehensive debug endpoint for AI service
router.get('/debug', async (req, res) => {
  const requestId = require('crypto').randomBytes(4).toString('hex').toUpperCase();
  debugLog('GET /debug', 'Debug endpoint called', { requestId });
  
  const debugInfo = {
    requestId,
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      openaiKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      maxTokens: process.env.OPENAI_MAX_TOKENS || '2000'
    },
    service: {
      model: gptService.getModelInfo().model,
      maxTokens: gptService.getModelInfo().maxTokens,
      available: gptService.getModelInfo().available
    },
    database: {
      status: 'unknown'
    },
    tests: {}
  };

  // Test database connection
  try {
    await db.query('SELECT 1');
    debugInfo.database.status = 'connected';
    debugLog('GET /debug', 'Database connection test passed', { requestId });
  } catch (dbError) {
    debugInfo.database.status = 'error';
    debugInfo.database.error = dbError.message;
    errorLog('GET /debug', dbError, { requestId, step: 'database_test' });
  }

  // Test OpenAI service
  try {
    debugLog('GET /debug', 'Testing OpenAI service', { requestId });
    const testResponse = await gptService.generateResponse('Test message - respond with "OK"');
    debugInfo.tests.openai = {
      success: testResponse.success,
      responseTime: testResponse.responseTime,
      tokensUsed: testResponse.tokensUsed,
      error: testResponse.error || null
    };
    debugLog('GET /debug', 'OpenAI test completed', { requestId, result: debugInfo.tests.openai });
  } catch (openaiError) {
    debugInfo.tests.openai = {
      success: false,
      error: openaiError.message,
      code: openaiError.code
    };
    errorLog('GET /debug', openaiError, { requestId, step: 'openai_test' });
  }

  // Test ask_messages table
  try {
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'ask_messages'
      );
    `);
    debugInfo.database.askMessagesTableExists = tableCheck[0].exists;
    debugLog('GET /debug', 'Table check completed', { requestId, exists: tableCheck[0].exists });
  } catch (tableError) {
    debugInfo.database.askMessagesTableError = tableError.message;
    errorLog('GET /debug', tableError, { requestId, step: 'table_check' });
  }

  debugLog('GET /debug', 'Debug info compiled', { requestId });
  
  res.json({
    success: true,
    debug: debugInfo
  });
});

module.exports = router;