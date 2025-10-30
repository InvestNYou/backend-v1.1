const express = require('express');
const axios = require('axios');
const DatabaseService = require('../services/databaseService');
const { optionalAuth } = require('../middleware/auth');
const polygonService = require('../services/polygonService');

const router = express.Router();
const db = new DatabaseService();

// Get stock data
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { symbols, limit = 20 } = req.query;
    
    let stockData;
    
    if (symbols) {
      // Get specific stocks
      const symbolList = symbols.split(',').map(s => s.trim().toUpperCase());
      const placeholders = symbolList.map((_, i) => `$${i + 1}`).join(', ');
      stockData = await db.query(
        `SELECT * FROM stock_data WHERE symbol IN (${placeholders}) ORDER BY "updatedAt" DESC`,
        symbolList
      );
    } else {
      // Get all stocks with limit
      stockData = await db.query(
        'SELECT * FROM stock_data ORDER BY "updatedAt" DESC LIMIT $1',
        [parseInt(limit)]
      );
    }

    res.json({ stocks: stockData });
  } catch (error) {
    console.error('Get stocks error:', error);
    res.status(500).json({ error: 'Failed to get stock data' });
  }
});

// Get specific stock
router.get('/:symbol', optionalAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const stock = await db.query(
      'SELECT * FROM stock_data WHERE symbol = $1 ORDER BY "updatedAt" DESC LIMIT 1',
      [symbol.toUpperCase()]
    );

    if (!stock || stock.length === 0) {
      // Fallback: fetch live data if not cached
      try {
        const quote = await polygonService.getStockQuote(symbol.toUpperCase());
        await db.query(
          'INSERT INTO stock_data (id, symbol, name, price, change, "changePercent", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (symbol) DO UPDATE SET price = $4, change = $5, "changePercent" = $6, "updatedAt" = $7',
          [
            db.generateId(),
            symbol.toUpperCase(),
            quote.name || symbol.toUpperCase(),
            quote.price,
            quote.change,
            quote.changePercent,
            new Date().toISOString()
          ]
        );
        return res.json({
          stock: {
            symbol: symbol.toUpperCase(),
            name: quote.name || symbol.toUpperCase(),
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            updatedAt: new Date().toISOString()
          },
          source: 'api'
        });
      } catch (apiError) {
        console.error('Get specific stock fallback API error:', apiError);
        return res.status(404).json({ error: 'Stock not found' });
      }
    }

    res.json({ stock: stock[0] });
  } catch (error) {
    console.error('Get stock error:', error);
    res.status(500).json({ error: 'Failed to get stock data' });
  }
});

// Search stocks
router.get('/search/:query', optionalAuth, async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

    const stocks = await db.query(
      'SELECT * FROM stock_data WHERE LOWER(symbol) LIKE LOWER($1) OR LOWER(name) LIKE LOWER($1) ORDER BY "updatedAt" DESC LIMIT $2',
      [`%${query}%`, parseInt(limit)]
    );

    res.json({ stocks });
  } catch (error) {
    console.error('Search stocks error:', error);
    res.status(500).json({ error: 'Failed to search stocks' });
  }
});

// Get stock price
router.get('/:symbol/price', optionalAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Try to get from database first
    const stock = await db.query(
      'SELECT * FROM stock_data WHERE symbol = $1 ORDER BY "updatedAt" DESC LIMIT 1',
      [symbol.toUpperCase()]
    );

    if (stock && stock.length > 0) {
      const stockData = stock[0];
      const lastUpdate = new Date(stockData.updatedAt);
      const now = new Date();
      const timeDiff = now - lastUpdate;

      // If data is less than 5 minutes old, return it
      if (timeDiff < 5 * 60 * 1000) {
        return res.json({
          symbol: stockData.symbol,
          price: parseFloat(stockData.price),
          change: parseFloat(stockData.change),
          changePercent: parseFloat(stockData.changePercent),
          lastUpdate: stockData.updatedAt,
          source: 'database'
        });
      }
    }

    // Otherwise, fetch fresh data
    try {
      const priceData = await polygonService.getStockQuote(symbol.toUpperCase());
      
      // Update database with fresh data
      await db.query(
        'INSERT INTO stock_data (id, symbol, name, price, change, "changePercent", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (symbol) DO UPDATE SET price = $4, change = $5, "changePercent" = $6, "updatedAt" = $7',
        [db.generateId(), symbol.toUpperCase(), priceData.name || symbol.toUpperCase(), priceData.price, priceData.change, priceData.changePercent, new Date().toISOString()]
      );

      res.json({
        symbol: symbol.toUpperCase(),
        price: priceData.price,
        change: priceData.change,
        changePercent: priceData.changePercent,
        lastUpdate: new Date().toISOString(),
        source: 'api'
      });
    } catch (apiError) {
      console.error('API error:', apiError);
      
      // Return cached data if available, even if stale
      if (stock && stock.length > 0) {
        const stockData = stock[0];
        return res.json({
          symbol: stockData.symbol,
          price: parseFloat(stockData.price),
          change: parseFloat(stockData.change),
          changePercent: parseFloat(stockData.changePercent),
          lastUpdate: stockData.updatedAt,
          source: 'database_stale'
        });
      }
      
      res.status(500).json({ error: 'Failed to get stock price' });
    }
  } catch (error) {
    console.error('Get stock price error:', error);
    res.status(500).json({ error: 'Failed to get stock price' });
  }
});

// Get stock history
router.get('/:symbol/history', optionalAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { days = 30 } = req.query;

    const history = await db.query(
      'SELECT * FROM stock_history WHERE symbol = $1 AND "createdAt" >= $2 ORDER BY "createdAt" ASC',
      [symbol.toUpperCase(), new Date(Date.now() - days * 24 * 60 * 60 * 1000)]
    );

    res.json({
      symbol: symbol.toUpperCase(),
      history: history.map(h => ({
        date: h.createdAt,
        price: parseFloat(h.price),
        volume: parseInt(h.volume)
      }))
    });
  } catch (error) {
    console.error('Get stock history error:', error);
    res.status(500).json({ error: 'Failed to get stock history' });
  }
});

// Get trending stocks
router.get('/trending/up', optionalAuth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const stocks = await db.query(
      'SELECT * FROM stock_data WHERE "changePercent" > 0 ORDER BY "changePercent" DESC LIMIT $1',
      [parseInt(limit)]
    );

    res.json({ stocks });
  } catch (error) {
    console.error('Get trending up stocks error:', error);
    res.status(500).json({ error: 'Failed to get trending stocks' });
  }
});

// Get trending stocks down
router.get('/trending/down', optionalAuth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const stocks = await db.query(
      'SELECT * FROM stock_data WHERE "changePercent" < 0 ORDER BY "changePercent" ASC LIMIT $1',
      [parseInt(limit)]
    );

    res.json({ stocks });
  } catch (error) {
    console.error('Get trending down stocks error:', error);
    res.status(500).json({ error: 'Failed to get trending stocks' });
  }
});

// Get market overview
router.get('/market/overview', optionalAuth, async (req, res) => {
  try {
    // Get market indices
    const indices = await db.query(
      'SELECT * FROM stock_data WHERE symbol IN ($1, $2, $3, $4) ORDER BY "updatedAt" DESC',
      ['SPY', 'QQQ', 'IWM', 'DIA']
    );

    // Get top gainers
    const topGainers = await db.query(
      'SELECT * FROM stock_data WHERE "changePercent" > 0 ORDER BY "changePercent" DESC LIMIT 5'
    );

    // Get top losers
    const topLosers = await db.query(
      'SELECT * FROM stock_data WHERE "changePercent" < 0 ORDER BY "changePercent" ASC LIMIT 5'
    );

    // Get most active
    const mostActive = await db.query(
      'SELECT * FROM stock_data ORDER BY volume DESC LIMIT 5'
    );

    res.json({
      indices,
      topGainers,
      topLosers,
      mostActive
    });
  } catch (error) {
    console.error('Get market overview error:', error);
    res.status(500).json({ error: 'Failed to get market overview' });
  }
});

module.exports = router;