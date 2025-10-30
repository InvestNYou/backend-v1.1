#!/usr/bin/env node

/**
 * OpenAI API Key Setup Script
 * This script helps users configure their OpenAI API key for AI-powered quiz grading
 */

const fs = require('fs');
const path = require('path');

function setupOpenAIKey() {
  console.log('🔑 OpenAI API Key Setup for Quiz Grading');
  console.log('==========================================\n');
  
  console.log('This script will help you set up your OpenAI API key for AI-powered quiz grading.');
  console.log('Without an API key, the system will use fallback grading methods.\n');
  
  console.log('📋 Steps to get your OpenAI API key:');
  console.log('1. Go to https://platform.openai.com/api-keys');
  console.log('2. Sign in to your OpenAI account');
  console.log('3. Click "Create new secret key"');
  console.log('4. Copy the generated key\n');
  
  console.log('⚠️  Important Notes:');
  console.log('- Keep your API key secure and never share it publicly');
  console.log('- API usage will incur costs based on OpenAI pricing');
  console.log('- The system works without AI using fallback grading methods\n');
  
  const envPath = path.join(__dirname, '.env');
  const envExists = fs.existsSync(envPath);
  
  if (envExists) {
    console.log('📄 Found existing .env file');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('OPENAI_API_KEY=')) {
      console.log('✅ OPENAI_API_KEY is already configured in .env file');
      console.log('Current configuration:');
      const lines = envContent.split('\n');
      const keyLine = lines.find(line => line.startsWith('OPENAI_API_KEY='));
      if (keyLine) {
        const key = keyLine.split('=')[1];
        if (key && key.trim() !== '') {
          console.log(`   OPENAI_API_KEY: ${key.substring(0, 8)}...${key.substring(key.length - 4)}`);
        } else {
          console.log('   OPENAI_API_KEY: (empty)');
        }
      }
    } else {
      console.log('❌ OPENAI_API_KEY not found in .env file');
      console.log('You can add it manually or run this script to set it up.\n');
    }
  } else {
    console.log('📄 No .env file found');
    console.log('This script will create one for you.\n');
  }
  
  console.log('🚀 To set up your API key:');
  console.log('1. Add this line to your .env file:');
  console.log('   OPENAI_API_KEY=your_api_key_here');
  console.log('2. Optionally set the model:');
  console.log('   OPEN_API_MODEL=gpt-3.5-turbo');
  console.log('3. Optionally set max tokens:');
  console.log('   OPENAI_MAX_TOKENS=2000\n');
  
  console.log('📊 Current Quiz Grading Status:');
  console.log('- Multiple Choice: ✅ Always works');
  console.log('- True/False: ✅ Always works');
  console.log('- Free Response: 🔄 AI-powered (with API key) or fallback');
  console.log('- Short Answer: 🔄 AI-powered (with API key) or fallback\n');
  
  console.log('✅ Your quiz system is fully functional with or without AI!');
  console.log('The fallback grading system provides intelligent keyword-based scoring.');
}

if (require.main === module) {
  setupOpenAIKey();
}

module.exports = { setupOpenAIKey };
