const axios = require('axios');

class AlphaVantageService {
  constructor() {
    this.apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    this.baseUrl = 'https://www.alphavantage.co/query';
    this.rateLimitDelay = 12000; // 12 seconds between requests (5 requests per minute limit)
    this.lastRequestTime = 0;
    this.cache = new Map(); // Simple in-memory cache
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  // Rate limiting helper
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      console.log(`⏳ Waiting ${waitTime}ms for rate limit...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  // Get real-time stock quote with caching
  async getStockQuote(symbol) {
    try {
      // Check cache first
      const cacheKey = `quote_${symbol}`;
      const cached = this.cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
        console.log(`📦 Using cached data for ${symbol}`);
        return cached.data;
      }

      await this.waitForRateLimit();
      
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: this.apiKey
        },
        timeout: 10000
      });

      if (response.data['Error Message']) {
        throw new Error(`Alpha Vantage Error: ${response.data['Error Message']}`);
      }

      if (response.data['Note']) {
        throw new Error(`Alpha Vantage Rate Limit: ${response.data['Note']}`);
      }

      const quote = response.data['Global Quote'];
      if (!quote || !quote['01. symbol']) {
        throw new Error(`No data found for symbol: ${symbol}`);
      }

      const stockData = {
        symbol: quote['01. symbol'],
        name: await this.getCompanyName(symbol), // We'll get this separately
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        open: parseFloat(quote['02. open']),
        previousClose: parseFloat(quote['08. previous close']),
        lastTradingDay: quote['07. latest trading day']
      };

      console.log(`📊 Alpha Vantage data for ${symbol}:`, {
        symbol: stockData.symbol,
        price: stockData.price,
        change: stockData.change,
        changePercent: stockData.changePercent,
        rawPrice: quote['05. price'],
        rawChange: quote['09. change'],
        rawChangePercent: quote['10. change percent']
      });

      return stockData;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error.message);
      throw error;
    }
  }

  // Get company name from overview
  async getCompanyName(symbol) {
    try {
      await this.waitForRateLimit();
      
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'OVERVIEW',
          symbol: symbol,
          apikey: this.apiKey
        },
        timeout: 10000
      });

      if (response.data['Error Message']) {
        return symbol; // Fallback to symbol if name not found
      }

      return response.data['Name'] || symbol;
    } catch (error) {
      console.error(`Error fetching company name for ${symbol}:`, error.message);
      return symbol; // Fallback to symbol
    }
  }

  // Get multiple stock quotes with batching
  async getMultipleStockQuotes(symbols) {
    const results = [];
    const errors = [];

    for (const symbol of symbols) {
      try {
        console.log(`📊 Fetching data for ${symbol}...`);
        const quote = await this.getStockQuote(symbol);
        results.push(quote);
        console.log(`✅ Successfully fetched ${symbol}: $${quote.price}`);
      } catch (error) {
        console.error(`❌ Failed to fetch ${symbol}:`, error.message);
        errors.push({ symbol, error: error.message });
        
        // If rate limited, wait longer
        if (error.message.includes('Rate Limit')) {
          console.log('⏳ Rate limited, waiting 60 seconds...');
          await new Promise(resolve => setTimeout(resolve, 60000));
        }
      }
    }

    return { results, errors };
  }

  // Get historical data
  async getHistoricalData(symbol, days = 30) {
    try {
      await this.waitForRateLimit();
      
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: symbol,
          apikey: this.apiKey,
          outputsize: days > 100 ? 'full' : 'compact'
        },
        timeout: 15000
      });

      if (response.data['Error Message']) {
        throw new Error(`Alpha Vantage Error: ${response.data['Error Message']}`);
      }

      if (response.data['Note']) {
        throw new Error(`Alpha Vantage Rate Limit: ${response.data['Note']}`);
      }

      const timeSeries = response.data['Time Series (Daily)'];
      if (!timeSeries) {
        throw new Error(`No historical data found for symbol: ${symbol}`);
      }

      const history = [];
      const dates = Object.keys(timeSeries).sort().slice(-days);
      
      for (const date of dates) {
        const data = timeSeries[date];
        history.push({
          date: date,
          price: parseFloat(data['4. close']),
          volume: parseInt(data['5. volume']),
          high: parseFloat(data['2. high']),
          low: parseFloat(data['3. low']),
          open: parseFloat(data['1. open'])
        });
      }

      return history.sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error.message);
      throw error;
    }
  }

  // Search for stocks
  async searchStocks(keyword) {
    try {
      await this.waitForRateLimit();
      
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords: keyword,
          apikey: this.apiKey
        },
        timeout: 10000
      });

      if (response.data['Error Message']) {
        throw new Error(`Alpha Vantage Error: ${response.data['Error Message']}`);
      }

      if (response.data['Note']) {
        throw new Error(`Alpha Vantage Rate Limit: ${response.data['Note']}`);
      }

      const matches = response.data['bestMatches'] || [];
      return matches.map(match => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region'],
        marketOpen: match['5. marketOpen'],
        marketClose: match['6. marketClose'],
        timezone: match['7. timezone'],
        currency: match['8. currency']
      }));
    } catch (error) {
      console.error(`Error searching stocks for "${keyword}":`, error.message);
      throw error;
    }
  }
}

module.exports = new AlphaVantageService();
