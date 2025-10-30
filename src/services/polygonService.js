const axios = require('axios');

class PolygonService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
    console.log('✅ Stock price service initialized');
  }

  // Get stock price with caching
  async getStockQuote(symbol) {
    try {
      console.log(`📊 Fetching price for ${symbol}...`);
      
      // Check cache first
      const cacheKey = `price_${symbol}`;
      const cached = this.cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
        console.log(`📦 Using cached price for ${symbol}: $${cached.data.price}`);
        return cached.data;
      }

      // Try Google Finance scraping
      const stockData = await this.scrapeGoogleFinance(symbol);
      if (!stockData) {
        throw new Error(`No price data found for ${symbol}`);
      }

      // Cache the result
      this.cache.set(cacheKey, {
        data: stockData,
        timestamp: Date.now()
      });

      console.log(`✅ Got price for ${symbol}: $${stockData.price}`);
      return stockData;
    } catch (error) {
      console.error(`❌ Failed to get price for ${symbol}:`, error.message);
      throw error;
    }
  }

  // Simple Google Finance scraping - only get price
  async scrapeGoogleFinance(symbol) {
    try {
      // Try different exchanges
      const exchanges = ['NASDAQ', 'NYSE', 'NSE', 'BSE'];
      
      for (const exchange of exchanges) {
        try {
          const url = `https://www.google.com/finance/quote/${symbol}:${exchange}`;
          console.log(`🌐 Trying ${exchange}: ${url}`);
          
          const response = await axios.get(url, {
            timeout: 10000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });

          if (response.status === 200) {
            const html = response.data;
            
            // Extract price using XPath approach
            const priceMatch = html.match(/data-last-price="([^"]+)"/) ||
                              html.match(/class="YMlKec fxKbKc">([^<]+)</) ||
                              html.match(/class="YMlKec fxKbKc"[^>]*>([^<]+)</);
            
            // Extract company name - better regex to stop at pipe
            const nameMatch = html.match(/<title>([^|]+?)\s*\([^)]*\)\s*\|/i) ||
                             html.match(/<title>([^|]+?)\s*Stock Price/i) ||
                             html.match(/data-name="([^"]+)"/) ||
                             html.match(/class="zzDege"[^>]*>([^<]+)</);
            
            if (priceMatch && priceMatch[1]) {
              const price = parseFloat(priceMatch[1].replace(/[,$]/g, ''));
              let companyName = symbol.toUpperCase();
              
              if (nameMatch && nameMatch[1]) {
                // Clean up the company name
                companyName = nameMatch[1]
                  .trim()
                  .replace(/&amp;/g, '&')
                  .replace(/\s*\([^)]*\)\s*Stock Price.*$/i, '') // Remove "(SYMBOL) Stock Price & News - Google Finance"
                  .replace(/\s*Stock Price.*$/i, '') // Remove "Stock Price & News - Google Finance"
                  .trim();
              }
              
              if (price > 0) {
                console.log(`✅ Found price for ${symbol}: $${price} (${exchange}) - ${companyName}`);
                return {
                  symbol: symbol.toUpperCase(),
                  name: companyName,
                  price: parseFloat(price.toFixed(2)),
                  change: 0, // Not needed for portfolio
                  changePercent: 0, // Not needed for portfolio
                  dataSource: 'Google Finance (Scraped)',
                  exchange: exchange
                };
              }
            }
          }
        } catch (exchangeError) {
          console.log(`❌ ${exchange} failed: ${exchangeError.message}`);
          continue;
        }
      }
      
      throw new Error('All exchanges failed');
    } catch (error) {
      console.error(`Google Finance scraping failed for ${symbol}:`, error.message);
      return null;
    }
  }

  // Get multiple stock quotes
  async getMultipleStockQuotes(symbols) {
    const results = [];
    const errors = [];

    for (const symbol of symbols) {
      try {
        const quote = await this.getStockQuote(symbol);
        results.push(quote);
      } catch (error) {
        errors.push({ symbol, error: error.message });
      }
    }

    return { results, errors };
  }

  // Get real-time price (alias for getStockQuote)
  async getRealTimePrice(symbol) {
    const quote = await this.getStockQuote(symbol);
    return {
      symbol: quote.symbol,
      price: quote.price,
      timestamp: new Date().toISOString()
    };
  }

  // Validate service availability
  async validateService() {
    return true;
  }

  // Get service info
  getServiceInfo() {
    return {
      service: 'Simple Stock Price Scraper',
      primaryMethod: 'Google Finance Web Scraping',
      features: ['Real-time stock prices', 'No API keys required', 'Caching']
    };
  }
}

module.exports = new PolygonService();