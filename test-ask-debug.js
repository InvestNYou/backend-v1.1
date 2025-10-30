/**
 * Quick test script to debug Ask feature endpoints
 * Run with: node test-ask-debug.js
 */

const http = require('http');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

async function testEndpoint(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const requestOptions = {
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: options.headers || {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            data: json
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🔍 Testing Ask Feature Endpoints\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  console.log('─'.repeat(80));

  // Test 1: Health endpoint
  console.log('\n1️⃣ Testing /health endpoint...');
  try {
    const health = await testEndpoint('/health');
    console.log('✅ Status:', health.status);
    console.log('Response:', JSON.stringify(health.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 2: Suggestions endpoint
  console.log('\n2️⃣ Testing /api/ask/suggestions endpoint...');
  try {
    const suggestions = await testEndpoint('/api/ask/suggestions');
    console.log('✅ Status:', suggestions.status);
    console.log('Response:', JSON.stringify(suggestions.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 3: Status endpoint (most important)
  console.log('\n3️⃣ Testing /api/ask/status endpoint...');
  try {
    const status = await testEndpoint('/api/ask/status');
    console.log('✅ Status:', status.status);
    console.log('Response:', JSON.stringify(status.data, null, 2));
    
    if (status.data && status.data.data) {
      console.log('\n📊 Service Status:');
      console.log('  Available:', status.data.data.available);
      console.log('  Model:', status.data.data.model);
      console.log('  Has API Key:', status.data.data.hasApiKey);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 4: Debug endpoint
  console.log('\n4️⃣ Testing /api/ask/debug endpoint...');
  try {
    const debug = await testEndpoint('/api/ask/debug');
    console.log('✅ Status:', debug.status);
    if (debug.data && debug.data.debug) {
      console.log('\n📊 Debug Information:');
      console.log('Environment:', JSON.stringify(debug.data.debug.environment, null, 2));
      console.log('Service:', JSON.stringify(debug.data.debug.service, null, 2));
      console.log('Database:', JSON.stringify(debug.data.debug.database, null, 2));
      if (debug.data.debug.tests && debug.data.debug.tests.openai) {
        console.log('OpenAI Test:', JSON.stringify(debug.data.debug.tests.openai, null, 2));
      }
    } else {
      console.log('Response:', JSON.stringify(debug.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 5: Env check endpoint
  console.log('\n5️⃣ Testing /api/ask/env-check endpoint...');
  try {
    const envCheck = await testEndpoint('/api/ask/env-check');
    console.log('✅ Status:', envCheck.status);
    console.log('Response:', JSON.stringify(envCheck.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '─'.repeat(80));
  console.log('\n✨ Tests completed!');
}

runTests().catch(console.error);

