const OpenAI = require('openai');

class GPTService {
  constructor() {
    console.log('[GPT Service] Initializing...');
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    
    // Get max tokens from environment, default to 2000
    let requestedMaxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 2000;
    
    // Model-specific token limits (completion tokens maximum)
    const modelLimits = {
      'gpt-3.5-turbo': 4096,
      'gpt-4': 8192,
      'gpt-4-turbo': 8192,
      'gpt-4o': 16384
    };
    
    // Cap max tokens to model's maximum completion tokens
    const modelLimit = modelLimits[this.model] || 4096;
    this.maxTokens = Math.min(requestedMaxTokens, modelLimit);
    
    if (requestedMaxTokens > modelLimit) {
      console.warn(`[GPT Service] ⚠️  WARNING: OPENAI_MAX_TOKENS (${requestedMaxTokens}) exceeds model limit (${modelLimit}). Capping to ${modelLimit}.`);
    }
    
    // Logging
    const hasApiKey = !!process.env.OPENAI_API_KEY;
    const apiKeyValid = hasApiKey && process.env.OPENAI_API_KEY.startsWith('sk-');
    
    console.log('[GPT Service] Environment check:', {
      hasApiKey: hasApiKey,
      apiKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
      apiKeyPrefix: hasApiKey ? process.env.OPENAI_API_KEY.substring(0, 8) + '...' : 'NOT_SET',
      apiKeyFormatValid: apiKeyValid,
      model: this.model,
      requestedMaxTokens: requestedMaxTokens,
      maxTokens: this.maxTokens,
      modelLimit: modelLimit
    });
    
    if (!hasApiKey) {
      console.error('[GPT Service] ❌ WARNING: OPENAI_API_KEY environment variable is not set!');
    } else if (!apiKeyValid) {
      console.error('[GPT Service] ❌ WARNING: OPENAI_API_KEY does not appear to be valid (should start with "sk-")');
    } else {
      console.log('[GPT Service] ✅ API Key format appears valid');
    }
    
    console.log('[GPT Service] ✅ Initialized successfully');
  }

  async generateResponse(prompt, context = '') {
    const startTime = Date.now();
    
    try {
      console.log('[GPT Service] generateResponse called', {
        promptLength: prompt?.length || 0,
        hasContext: !!context,
        model: this.model,
        hasApiKey: !!process.env.OPENAI_API_KEY
      });
      
      const systemMessage = {
        role: 'system',
        content: `You are a helpful financial literacy assistant for young people. You provide educational information about personal finance, investing, budgeting, and money management. Keep responses clear, engaging, and age-appropriate. Focus on practical advice and explain concepts in simple terms. If asked about specific financial advice, recommend consulting a qualified financial advisor. Always provide a helpful response - never leave the user without an answer.`
      };

      const userMessage = {
        role: 'user',
        content: context ? `${context}\n\nUser question: ${prompt}` : prompt
      };

      const messages = [systemMessage, userMessage];

      console.log('[GPT Service] Calling OpenAI API...');
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
        max_completion_tokens: this.maxTokens
      });
      console.log('[GPT Service] OpenAI API call successful');

      const responseTime = Date.now() - startTime;
      const response = completion.choices[0].message.content;
      const tokensUsed = completion.usage.total_tokens;

      return {
        success: true,
        response: response,
        model: this.model,
        tokensUsed: tokensUsed,
        responseTime: responseTime,
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens
      };

    } catch (error) {
      console.error('[GPT Service] Error in generateResponse:', error);
      console.error('[GPT Service] Error details:', {
        message: error.message,
        code: error.code,
        status: error.status,
        statusCode: error.statusCode,
        type: error.type,
        name: error.name
      });
      
      // Check for specific error types
      let errorCode = error.code || 'UNKNOWN_ERROR';
      let fallbackResponse = 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.';
      
      if (error.code === 'insufficient_quota' || error.statusCode === 429) {
        errorCode = 'INSUFFICIENT_QUOTA';
        fallbackResponse = 'I\'m currently experiencing high demand. Please try again in a few minutes.';
      } else if (error.code === 'rate_limit_exceeded') {
        errorCode = 'RATE_LIMIT_EXCEEDED';
        fallbackResponse = 'I\'m receiving too many requests. Please wait a moment before trying again.';
      } else if (error.code === 'invalid_api_key' || error.statusCode === 401) {
        errorCode = 'INVALID_API_KEY';
        fallbackResponse = 'Service temporarily unavailable. Please contact support.';
      } else if (error.code === 'api_error' || (error.statusCode && error.statusCode >= 500)) {
        errorCode = 'API_ERROR';
        fallbackResponse = 'The AI service is experiencing technical difficulties. Please try again later.';
      } else if (!error.code && error.message) {
        // Network or other errors
        if (error.message.includes('fetch') || error.message.includes('network')) {
          errorCode = 'NETWORK_ERROR';
        }
      }

      return {
        success: false,
        response: fallbackResponse,
        model: this.model,
        tokensUsed: 0,
        responseTime: Date.now() - startTime,
        error: error.message,
        errorCode: errorCode
      };
    }
  }

  async generateResponseWithHistory(prompt, conversationHistory = []) {
    const startTime = Date.now();
    
    try {
      const systemMessage = {
        role: 'system',
        content: `You are a helpful financial literacy assistant for young people. You provide educational information about personal finance, investing, budgeting, and money management. Keep responses clear, engaging, and age-appropriate. Focus on practical advice and explain concepts in simple terms. If asked about specific financial advice, recommend consulting a qualified financial advisor. Always provide a helpful response - never leave the user without an answer.`
      };

      const messages = [systemMessage];
      
      const recentHistory = conversationHistory.slice(-10);
      
      recentHistory.forEach((msg) => {
        if (msg && msg.content && msg.content.trim()) {
          messages.push({
            role: msg.role,
            content: msg.content.trim()
          });
        }
      });

      messages.push({
        role: 'user',
        content: prompt
      });

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
        max_completion_tokens: this.maxTokens
      });

      const responseTime = Date.now() - startTime;
      const response = completion.choices[0].message.content;
      const tokensUsed = completion.usage.total_tokens;

      if (!response || response.trim() === '') {
        return {
          success: false,
          response: 'I apologize, but I\'m having trouble generating a response right now. Please try rephrasing your question or try again in a moment.',
          model: this.model,
          tokensUsed: tokensUsed,
          responseTime: responseTime,
          error: 'Empty response from OpenAI'
        };
      }

      return {
        success: true,
        response: response,
        model: this.model,
        tokensUsed: tokensUsed,
        responseTime: responseTime,
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens
      };

    } catch (error) {
      console.error('[GPT Service] Error in generateResponseWithHistory:', error);
      console.error('[GPT Service] Error details:', {
        message: error.message,
        code: error.code,
        status: error.status,
        statusCode: error.statusCode,
        type: error.type,
        name: error.name
      });
      
      // Check for specific error types
      let errorCode = error.code || 'UNKNOWN_ERROR';
      let fallbackResponse = 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.';
      
      if (error.code === 'insufficient_quota' || error.statusCode === 429) {
        errorCode = 'INSUFFICIENT_QUOTA';
        fallbackResponse = 'I\'m currently experiencing high demand. Please try again in a few minutes.';
      } else if (error.code === 'rate_limit_exceeded') {
        errorCode = 'RATE_LIMIT_EXCEEDED';
        fallbackResponse = 'I\'m receiving too many requests. Please wait a moment before trying again.';
      } else if (error.code === 'invalid_api_key' || error.statusCode === 401) {
        errorCode = 'INVALID_API_KEY';
        fallbackResponse = 'Service temporarily unavailable. Please contact support.';
      } else if (error.code === 'api_error' || (error.statusCode && error.statusCode >= 500)) {
        errorCode = 'API_ERROR';
        fallbackResponse = 'The AI service is experiencing technical difficulties. Please try again later.';
      } else if (!error.code && error.message) {
        // Network or other errors
        if (error.message.includes('fetch') || error.message.includes('network')) {
          errorCode = 'NETWORK_ERROR';
        }
      }
      
      return {
        success: false,
        response: fallbackResponse,
        model: this.model,
        tokensUsed: 0,
        responseTime: Date.now() - startTime,
        error: error.message,
        errorCode: errorCode
      };
    }
  }

  getModelInfo() {
    return {
      model: this.model,
      maxTokens: this.maxTokens,
      available: !!process.env.OPENAI_API_KEY
    };
  }

  async validateService() {
    try {
      console.log('[GPT Service] Validating service...');
      console.log('[GPT Service] Has API Key:', !!process.env.OPENAI_API_KEY);
      console.log('[GPT Service] Model:', this.model);
      
      if (!process.env.OPENAI_API_KEY) {
        console.log('[GPT Service] Validation failed: No API key');
        return false;
      }

      console.log('[GPT Service] Making test API call...');
      const testStartTime = Date.now();
      const testResponse = await this.generateResponse('Hello');
      const testDuration = Date.now() - testStartTime;
      
      console.log('[GPT Service] Test response:', {
        success: testResponse.success,
        duration: `${testDuration}ms`,
        hasError: !!testResponse.error,
        error: testResponse.error || null
      });
      
      return testResponse.success;
    } catch (error) {
      console.error('[GPT Service] Validation Error:', error);
      console.error('[GPT Service] Error details:', {
        message: error.message,
        code: error.code,
        status: error.status
      });
      return false;
    }
  }
}

module.exports = GPTService;
