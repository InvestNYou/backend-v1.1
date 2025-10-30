const express = require('express');
const DatabaseService = require('../services/databaseService');
const { authenticateToken } = require('../middleware/auth');
const polygonService = require('../services/polygonService');

const router = express.Router();
const db = new DatabaseService();

// Cache for table name to avoid multiple queries
let watchlistTableName = null;

// Helper function to get the correct table name
async function getWatchlistTableName() {
  if (watchlistTableName) {
    return watchlistTableName;
  }

  // Try watchlist table first (Prisma schema), fallback to user_watchlist
  try {
    await db.query('SELECT 1 FROM watchlist LIMIT 1');
    watchlistTableName = 'watchlist';
  } catch (error) {
    // Fallback to user_watchlist if watchlist doesn't exist
    if (error.code === '42P01') {
      try {
        await db.query('SELECT 1 FROM user_watchlist LIMIT 1');
        watchlistTableName = 'user_watchlist';
      } catch (err) {
        // If neither exists, default to watchlist
        watchlistTableName = 'watchlist';
      }
    } else {
      // Other errors - default to watchlist
      watchlistTableName = 'watchlist';
    }
  }
  
  return watchlistTableName;
}

// Get user's watchlist
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Try watchlist table first (Prisma schema), fallback to user_watchlist
    let watchlist;
    try {
      watchlist = await db.query(
        'SELECT * FROM watchlist WHERE "userId" = $1 ORDER BY "addedAt" DESC',
        [req.user.id]
      );
    } catch (error) {
      // Fallback to user_watchlist if watchlist doesn't exist
      if (error.code === '42P01') {
        watchlist = await db.query(
          'SELECT * FROM user_watchlist WHERE "userId" = $1 ORDER BY "addedAt" DESC',
          [req.user.id]
        );
      } else {
        throw error;
      }
    }

    res.json({ watchlist });
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({ error: 'Failed to get watchlist' });
  }
});

// Add stock to watchlist
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { symbol, name, price } = req.body;

    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const symbolUpper = symbol.toUpperCase();
    const tableName = await getWatchlistTableName();

    // Check if already in watchlist
    const existing = await db.query(
      `SELECT * FROM ${tableName} WHERE "userId" = $1 AND symbol = $2`,
      [req.user.id, symbolUpper]
    );

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'Stock already in watchlist' });
    }

    // Add to watchlist
    const watchlistId = db.generateId();
    const stockName = name || symbolUpper;
    const stockPrice = price ? parseFloat(price) : 0;
    
    const nowIso = new Date().toISOString();
    if (tableName === 'watchlist') {
      await db.query(
        `INSERT INTO ${tableName} (id, "userId", symbol, name, price, "addedAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [watchlistId, req.user.id, symbolUpper, stockName, stockPrice, nowIso, nowIso]
      );
    } else {
      // Fallback schema (user_watchlist) without updatedAt
      await db.query(
        `INSERT INTO ${tableName} (id, "userId", symbol, name, price, "addedAt") VALUES ($1, $2, $3, $4, $5, $6)`,
        [watchlistId, req.user.id, symbolUpper, stockName, stockPrice, nowIso]
      );
    }

    res.json({ message: 'Stock added to watchlist' });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
      stack: error.stack
    });
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Stock already in watchlist' });
    }
    
    res.status(500).json({ 
      error: 'Failed to add stock to watchlist',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Remove stock from watchlist
router.delete('/remove/:symbol', authenticateToken, async (req, res) => {
  try {
    const { symbol } = req.params;
    const tableName = await getWatchlistTableName();

    const result = await db.query(
      `DELETE FROM ${tableName} WHERE "userId" = $1 AND symbol = $2 RETURNING *`,
      [req.user.id, symbol.toUpperCase()]
    );

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Stock not found in watchlist' });
    }

    res.json({ message: 'Stock removed from watchlist' });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({ error: 'Failed to remove stock from watchlist' });
  }
});

// Update watchlist stock price
router.put('/update-price/:symbol', authenticateToken, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { price } = req.body;
    const tableName = await getWatchlistTableName();

    if (!price) {
      return res.status(400).json({ error: 'Price is required' });
    }

    const result = await db.query(
      `UPDATE ${tableName} SET price = $1 WHERE "userId" = $2 AND symbol = $3 RETURNING *`,
      [price, req.user.id, symbol.toUpperCase()]
    );

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Stock not found in watchlist' });
    }

    res.json({ message: 'Price updated', stock: result[0] });
  } catch (error) {
    console.error('Update watchlist price error:', error);
    res.status(500).json({ error: 'Failed to update price' });
  }
});

// Get watchlist with current prices
router.get('/with-prices', authenticateToken, async (req, res) => {
  try {
    const tableName = await getWatchlistTableName();
    const watchlist = await db.query(
      `SELECT * FROM ${tableName} WHERE "userId" = $1 ORDER BY "addedAt" DESC`,
      [req.user.id]
    );

    // Get current prices for all symbols
    const symbols = watchlist.map(item => item.symbol);
    const { results: currentPrices } = await polygonService.getMultipleStockQuotes(symbols);

    // Merge watchlist with current prices
    const watchlistWithPrices = watchlist.map(item => {
      const currentPrice = currentPrices.find(p => p.symbol === item.symbol);
      return {
        ...item,
        currentPrice: currentPrice?.price || item.price,
        change: currentPrice ? currentPrice.price - item.price : 0,
        changePercent: currentPrice ? ((currentPrice.price - item.price) / item.price) * 100 : 0
      };
    });

    res.json({ watchlist: watchlistWithPrices });
  } catch (error) {
    console.error('Get watchlist with prices error:', error);
    res.status(500).json({ error: 'Failed to get watchlist with prices' });
  }
});

module.exports = router;