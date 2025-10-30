const express = require('express');
const DatabaseService = require('../services/databaseService');
const { authenticateToken } = require('../middleware/auth');
const { validatePortfolioBuy, validatePortfolioSell } = require('../middleware/validation');
const portfolioSnapshotService = require('../services/portfolioSnapshotService');

const router = express.Router();
const db = new DatabaseService();

// Helper function to ensure portfolio exists
async function ensurePortfolioExists(userId) {
  let portfolio = await db.query('SELECT * FROM user_portfolios WHERE "userId" = $1', [userId]);

  if (!portfolio || portfolio.length === 0) {
    console.log(`Creating portfolio for user ${userId}`);
    const newPortfolio = await db.query(
      'INSERT INTO user_portfolios (id, "userId", balance, "totalValue", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [db.generateId(), userId, 10000.00, 10000.00, new Date().toISOString(), new Date().toISOString()]
    );
    portfolio = newPortfolio;
  }

  return portfolio[0];
}

// Get user portfolio
router.get('/', authenticateToken, async (req, res) => {
  try {
    const portfolio = await ensurePortfolioExists(req.user.id);

    // Get user's transactions
    const transactions = await db.query(
      'SELECT * FROM portfolio_transactions WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 10',
      [req.user.id]
    );

    res.json({
      portfolio,
      recentTransactions: transactions
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ error: 'Failed to get portfolio' });
  }
});

// Get portfolio value over time
router.get('/value-history', authenticateToken, async (req, res) => {
  try {
    const { days = 30, interval = 'daily' } = req.query;
    
    const snapshots = await db.query(
      'SELECT * FROM portfolio_snapshots WHERE "userId" = $1 AND date >= $2 ORDER BY date ASC',
      [req.user.id, new Date(Date.now() - days * 24 * 60 * 60 * 1000)]
    );

    // Get current portfolio value
    const portfolio = await ensurePortfolioExists(req.user.id);
    const currentValue = parseFloat(portfolio.totalValue);
    const currentBalance = parseFloat(portfolio.balance);

    // Process snapshots based on interval
    let processedSnapshots = snapshots;
    if (interval === 'hourly') {
      // For hourly, we might want to group by hour
      processedSnapshots = snapshots.filter((_, index) => index % 2 === 0); // Sample every other snapshot
    } else if (interval === 'weekly') {
      // For weekly, group by week
      const weeklyData = {};
      snapshots.forEach(snapshot => {
        const week = new Date(snapshot.createdAt).toISOString().split('T')[0].slice(0, 7); // YYYY-MM
        if (!weeklyData[week] || new Date(snapshot.createdAt) > new Date(weeklyData[week].createdAt)) {
          weeklyData[week] = snapshot;
        }
      });
      processedSnapshots = Object.values(weeklyData).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    const valueHistory = processedSnapshots.map((snapshot, index) => {
      const prevSnapshot = index > 0 ? processedSnapshots[index - 1] : null;
      const dailyChange = prevSnapshot ? parseFloat(snapshot.totalValue) - parseFloat(prevSnapshot.totalValue) : 0;
      const dailyChangePercent = prevSnapshot && parseFloat(prevSnapshot.totalValue) > 0 
        ? (dailyChange / parseFloat(prevSnapshot.totalValue)) * 100 
        : 0;

      return {
        date: snapshot.date,
        totalValue: parseFloat(snapshot.totalValue),
        balance: parseFloat(snapshot.balance),
        dailyChange,
        dailyChangePercent
      };
    });

    res.json({
      valueHistory,
      currentValue,
      currentBalance,
      period: `${days} days`,
      dataSource: 'Historical Snapshots'
    });
  } catch (error) {
    console.error('Get portfolio value history error:', error);
    res.status(500).json({ error: 'Failed to get portfolio value history' });
  }
});

// Get portfolio balance history
router.get('/balance-history', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const snapshots = await db.query(
      'SELECT * FROM portfolio_snapshots WHERE "userId" = $1 AND date >= $2 ORDER BY date ASC',
      [req.user.id, new Date(Date.now() - days * 24 * 60 * 60 * 1000)]
    );

    // Get current portfolio
    const portfolio = await ensurePortfolioExists(req.user.id);
    const currentBalance = parseFloat(portfolio.balance);

    // Calculate cumulative invested and sold amounts
    const transactions = await db.query(
      'SELECT * FROM portfolio_transactions WHERE "userId" = $1 AND "createdAt" >= $2 ORDER BY "createdAt" ASC',
      [req.user.id, new Date(Date.now() - days * 24 * 60 * 60 * 1000)]
    );

    let cumulativeInvested = 0;
    let cumulativeSold = 0;
    const transactionMap = {};

    transactions.forEach(transaction => {
      // Handle Date object or string
      const createdAt = transaction.createdAt instanceof Date 
        ? transaction.createdAt.toISOString() 
        : transaction.createdAt;
      const date = createdAt.split('T')[0];
      if (!transactionMap[date]) {
        transactionMap[date] = { invested: 0, sold: 0 };
      }
      if (transaction.type === 'BUY') {
        transactionMap[date].invested += parseFloat(transaction.total || transaction.totalValue || 0);
        cumulativeInvested += parseFloat(transaction.total || transaction.totalValue || 0);
      } else if (transaction.type === 'SELL') {
        transactionMap[date].sold += parseFloat(transaction.total || transaction.totalValue || 0);
        cumulativeSold += parseFloat(transaction.total || transaction.totalValue || 0);
      }
    });

    const balanceHistory = snapshots.map(snapshot => {
      // Handle Date object or string
      const snapshotDate = snapshot.date instanceof Date 
        ? snapshot.date.toISOString() 
        : snapshot.date;
      const date = snapshotDate.split('T')[0];
      const dayTransactions = transactionMap[date] || { invested: 0, sold: 0 };
      
      return {
        date: snapshotDate,
        balance: parseFloat(snapshot.balance || 0),
        cumulativeInvested: cumulativeInvested - (transactionMap[date]?.invested || 0),
        cumulativeSold: cumulativeSold - (transactionMap[date]?.sold || 0)
      };
    });

    res.json({
      balanceHistory,
      currentBalance,
      period: `${days} days`,
      dataSource: 'Historical Snapshots'
    });
  } catch (error) {
    console.error('Get portfolio balance history error:', error);
    res.status(500).json({ error: 'Failed to get portfolio balance history' });
  }
});

// Get portfolio analytics (volume data)
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    // Get transactions for the specified period
    const transactions = await db.query(
      'SELECT * FROM portfolio_transactions WHERE "userId" = $1 AND "createdAt" >= $2 ORDER BY "createdAt" ASC',
      [req.user.id, new Date(Date.now() - days * 24 * 60 * 60 * 1000)]
    );

    // Group transactions by date
    const dailyVolume = {};
    transactions.forEach(transaction => {
      // Handle Date object or string
      const createdAt = transaction.createdAt instanceof Date 
        ? transaction.createdAt.toISOString() 
        : transaction.createdAt;
      const date = createdAt.split('T')[0];
      if (!dailyVolume[date]) {
        dailyVolume[date] = {
          date: createdAt,
          volume: 0,
          transactions: 0
        };
      }
      dailyVolume[date].volume += parseFloat(transaction.total || transaction.totalValue || 0);
      dailyVolume[date].transactions += 1;
    });

    const dailyVolumeArray = Object.values(dailyVolume).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      dailyVolume: dailyVolumeArray,
      period: `${days} days`,
      dataSource: 'Transaction History'
    });
  } catch (error) {
    console.error('Get portfolio analytics error:', error);
    res.status(500).json({ error: 'Failed to get portfolio analytics' });
  }
});

// Get enhanced performance metrics
router.get('/performance-enhanced', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const snapshots = await db.query(
      'SELECT * FROM portfolio_snapshots WHERE "userId" = $1 AND date >= $2 ORDER BY date ASC',
      [req.user.id, new Date(Date.now() - days * 24 * 60 * 60 * 1000)]
    );

    if (snapshots.length < 2) {
      return res.json({
        performance: {
          totalReturn: 0,
          totalReturnPercent: 0,
          volatility: 0,
          sharpeRatio: 0,
          maxDrawdown: 0,
          dailyReturns: [],
          bestDay: null,
          worstDay: null,
          dataPoints: snapshots.length,
          period: `${days} days`
        }
      });
    }

    // Calculate daily returns
    const dailyReturns = [];
    for (let i = 1; i < snapshots.length; i++) {
      const current = parseFloat(snapshots[i].totalValue);
      const previous = parseFloat(snapshots[i - 1].totalValue);
      const dailyReturn = previous > 0 ? ((current - previous) / previous) * 100 : 0;
      
      dailyReturns.push({
        date: snapshots[i].date,
        return: dailyReturn
      });
    }

    // Calculate performance metrics
    const returns = dailyReturns.map(r => r.return);
    const totalReturn = parseFloat(snapshots[snapshots.length - 1].totalValue) - parseFloat(snapshots[0].totalValue);
    const totalReturnPercent = parseFloat(snapshots[0].totalValue) > 0 
      ? (totalReturn / parseFloat(snapshots[0].totalValue)) * 100 
      : 0;

    // Calculate volatility (standard deviation of daily returns)
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);

    // Calculate Sharpe ratio (assuming risk-free rate of 0)
    const sharpeRatio = volatility > 0 ? (mean / volatility) : 0;

    // Calculate maximum drawdown
    let maxDrawdown = 0;
    let peak = parseFloat(snapshots[0].totalValue);
    
    for (let i = 1; i < snapshots.length; i++) {
      const currentValue = parseFloat(snapshots[i].totalValue);
      if (currentValue > peak) {
        peak = currentValue;
      }
      const drawdown = ((peak - currentValue) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    // Find best and worst days
    const bestDay = dailyReturns.reduce((best, current) => 
      current.return > best.return ? current : best, dailyReturns[0]);
    const worstDay = dailyReturns.reduce((worst, current) => 
      current.return < worst.return ? current : worst, dailyReturns[0]);

    res.json({
      performance: {
        totalReturn,
        totalReturnPercent,
        volatility,
        sharpeRatio,
        maxDrawdown,
        dailyReturns,
        bestDay: bestDay.return > 0 ? bestDay : null,
        worstDay: worstDay.return < 0 ? worstDay : null,
        dataPoints: snapshots.length,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Get portfolio performance error:', error);
    res.status(500).json({ error: 'Failed to get portfolio performance' });
  }
});

// Create portfolio snapshot
router.post('/create-snapshot', authenticateToken, async (req, res) => {
  try {
    const portfolio = await ensurePortfolioExists(req.user.id);
    
    // Create snapshot using the portfolio snapshot service
    const snapshot = await portfolioSnapshotService.createSnapshot(req.user.id);
    
    res.json({
      message: 'Portfolio snapshot created successfully',
      snapshot
    });
  } catch (error) {
    console.error('Create snapshot error:', error);
    res.status(500).json({ error: 'Failed to create portfolio snapshot' });
  }
});

// Buy stock
router.post('/buy', authenticateToken, validatePortfolioBuy, async (req, res) => {
  try {
    const { symbol, quantity, price } = req.body;
    const parsedQuantity = parseFloat(quantity) || 0;
    const parsedPrice = parseFloat(price) || 0;
    const totalCost = parsedQuantity * parsedPrice;

    // Ensure portfolio exists
    const portfolio = await ensurePortfolioExists(req.user.id);
    const portfolioBalance = parseFloat(portfolio.balance) || 0;

    // Check if user has enough balance
    if (portfolioBalance < totalCost) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Check if user already owns this stock
    const existingHolding = await db.query(
      'SELECT * FROM portfolio_holdings WHERE "userId" = $1 AND symbol = $2',
      [req.user.id, symbol]
    );

    let newQuantity = parsedQuantity;
    let newAveragePrice = parsedPrice;

    if (existingHolding && existingHolding.length > 0) {
      const holding = existingHolding[0];
      const holdingQuantity = parseFloat(holding.quantity) || 0;
      const holdingAveragePrice = parseFloat(holding.averagePrice) || 0;
      newQuantity = holdingQuantity + parsedQuantity;
      newAveragePrice = ((holdingQuantity * holdingAveragePrice) + totalCost) / newQuantity;
      
      // Update existing holding
      await db.query(
        'UPDATE portfolio_holdings SET quantity = $1, "averagePrice" = $2, "updatedAt" = $3 WHERE "userId" = $4 AND symbol = $5',
        [newQuantity, newAveragePrice, new Date().toISOString(), req.user.id, symbol]
      );
    } else {
      // Create new holding
      await db.query(
        'INSERT INTO portfolio_holdings (id, "userId", symbol, quantity, "averagePrice", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [db.generateId(), req.user.id, symbol, parsedQuantity, parsedPrice, new Date().toISOString(), new Date().toISOString()]
      );
    }

    // Update portfolio balance
    const newBalance = portfolioBalance - totalCost;
    await db.query(
      'UPDATE user_portfolios SET balance = $1, "updatedAt" = $2 WHERE "userId" = $3',
      [newBalance, new Date().toISOString(), req.user.id]
    );

    // Record transaction
    await db.query(
      'INSERT INTO portfolio_transactions (id, "userId", type, symbol, shares, price, total, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [db.generateId(), req.user.id, 'BUY', symbol, parsedQuantity, parsedPrice, totalCost, new Date().toISOString()]
    );

    // Create portfolio snapshot
    await portfolioSnapshotService.createSnapshot(req.user.id);

    // Get updated portfolio and transaction data
    const updatedPortfolio = await db.query('SELECT * FROM user_portfolios WHERE "userId" = $1', [req.user.id]);
    const transaction = await db.query(
      'SELECT * FROM portfolio_transactions WHERE "userId" = $1 AND symbol = $2 ORDER BY "createdAt" DESC LIMIT 1',
      [req.user.id, symbol]
    );

    res.json({
      message: `Successfully bought ${quantity} shares of ${symbol}`,
      portfolio: updatedPortfolio[0],
      transaction: transaction[0],
      newBalance,
      newQuantity,
      newAveragePrice
    });
  } catch (error) {
    console.error('Buy stock error:', error);
    res.status(500).json({ error: 'Failed to buy stock' });
  }
});

// Sell stock
router.post('/sell', authenticateToken, validatePortfolioSell, async (req, res) => {
  try {
    const { symbol, quantity, price } = req.body;
    const parsedQuantity = parseFloat(quantity) || 0;
    const parsedPrice = parseFloat(price) || 0;
    const totalValue = parsedQuantity * parsedPrice;

    // Check if user owns this stock
    const existingHolding = await db.query(
      'SELECT * FROM portfolio_holdings WHERE "userId" = $1 AND symbol = $2',
      [req.user.id, symbol]
    );

    if (!existingHolding || existingHolding.length === 0) {
      return res.status(400).json({ error: 'You do not own this stock' });
    }

    const holding = existingHolding[0];
    const holdingQuantity = parseFloat(holding.quantity) || 0;

    if (holdingQuantity < parsedQuantity) {
      return res.status(400).json({ error: 'Insufficient shares to sell' });
    }

    // Update holding quantity
    const newQuantity = holdingQuantity - parsedQuantity;
    
    if (newQuantity === 0) {
      // Remove holding completely
      await db.query(
        'DELETE FROM portfolio_holdings WHERE "userId" = $1 AND symbol = $2',
        [req.user.id, symbol]
      );
    } else {
      // Update holding
      await db.query(
        'UPDATE portfolio_holdings SET quantity = $1, "updatedAt" = $2 WHERE "userId" = $3 AND symbol = $4',
        [newQuantity, new Date().toISOString(), req.user.id, symbol]
      );
    }

    // Update portfolio balance
    const portfolio = await ensurePortfolioExists(req.user.id);
    const portfolioBalance = parseFloat(portfolio.balance) || 0;
    const newBalance = portfolioBalance + totalValue;
    await db.query(
      'UPDATE user_portfolios SET balance = $1, "updatedAt" = $2 WHERE "userId" = $3',
      [newBalance, new Date().toISOString(), req.user.id]
    );

    // Record transaction
    await db.query(
      'INSERT INTO portfolio_transactions (id, "userId", type, symbol, shares, price, total, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [db.generateId(), req.user.id, 'SELL', symbol, parsedQuantity, parsedPrice, totalValue, new Date().toISOString()]
    );

    // Create portfolio snapshot
    await portfolioSnapshotService.createSnapshot(req.user.id);

    // Get updated portfolio and transaction data
    const updatedPortfolio = await db.query('SELECT * FROM user_portfolios WHERE "userId" = $1', [req.user.id]);
    const transaction = await db.query(
      'SELECT * FROM portfolio_transactions WHERE "userId" = $1 AND symbol = $2 ORDER BY "createdAt" DESC LIMIT 1',
      [req.user.id, symbol]
    );

    res.json({
      message: `Successfully sold ${quantity} shares of ${symbol}`,
      portfolio: updatedPortfolio[0],
      transaction: transaction[0],
      newBalance,
      remainingQuantity: newQuantity
    });
  } catch (error) {
    console.error('Sell stock error:', error);
    res.status(500).json({ error: 'Failed to sell stock' });
  }
});

// Get portfolio holdings
router.get('/holdings', authenticateToken, async (req, res) => {
  try {
    // Get portfolio data
    const portfolio = await ensurePortfolioExists(req.user.id);
    
    // Get holdings
    const rawHoldings = await db.query(
      'SELECT * FROM portfolio_holdings WHERE "userId" = $1 ORDER BY symbol',
      [req.user.id]
    );

    // Enrich holdings with stock data and calculations
    const enrichedHoldings = await Promise.all(rawHoldings.map(async (holding) => {
      const quantity = parseFloat(holding.quantity) || 0;
      const averagePrice = parseFloat(holding.averagePrice) || 0;
      
      // Get current stock data
      let currentPrice = averagePrice;
      let stockName = holding.symbol;
      let dailyChange = 0;
      let dailyChangePercent = 0;
      
      try {
        const stockData = await db.query(
          'SELECT * FROM stock_data WHERE symbol = $1 ORDER BY "updatedAt" DESC LIMIT 1',
          [holding.symbol.toUpperCase()]
        );
        
        if (stockData && stockData.length > 0) {
          currentPrice = parseFloat(stockData[0].price) || averagePrice;
          stockName = stockData[0].name || holding.symbol;
          dailyChange = parseFloat(stockData[0].change) || 0;
          dailyChangePercent = parseFloat(stockData[0].changePercent) || 0;
        }
      } catch (error) {
        console.error(`Error fetching stock data for ${holding.symbol}:`, error);
      }
      
      // Calculate values
      const currentValue = quantity * currentPrice;
      const totalCost = quantity * averagePrice;
      const allTimeGainLoss = currentValue - totalCost;
      const allTimeGainLossPercent = totalCost > 0 ? (allTimeGainLoss / totalCost) * 100 : 0;
      
      // Daily gain/loss is based on price change
      const dailyGainLoss = quantity * dailyChange;
      const dailyGainLossPercent = dailyChangePercent;
      
      return {
        ...holding,
        // Map to frontend expected format
        shares: quantity,
        quantity: quantity,
        averageCost: averagePrice,
        averagePrice: averagePrice,
        currentPrice: currentPrice,
        currentValue: currentValue,
        name: stockName,
        allTimeGainLoss: allTimeGainLoss,
        allTimeGainLossPercent: allTimeGainLossPercent,
        dailyGainLoss: dailyGainLoss,
        dailyGainLossPercent: dailyGainLossPercent,
        dailyChange: dailyChange,
        dailyChangePercent: dailyChangePercent
      };
    }));

    // Calculate portfolio totals
    const totalInvested = enrichedHoldings.reduce((sum, h) => sum + (parseFloat(h.shares) || 0) * (parseFloat(h.averageCost) || 0), 0);
    const totalCurrentValue = enrichedHoldings.reduce((sum, h) => sum + (parseFloat(h.currentValue) || 0), 0);
    const totalAllTimeGainLoss = enrichedHoldings.reduce((sum, h) => sum + (parseFloat(h.allTimeGainLoss) || 0), 0);
    const totalAllTimeGainLossPercent = totalInvested > 0 ? (totalAllTimeGainLoss / totalInvested) * 100 : 0;
    
    // Get previous snapshot for daily comparison
    const previousSnapshot = await db.query(
      'SELECT * FROM portfolio_snapshots WHERE "userId" = $1 AND date < $2 ORDER BY date DESC LIMIT 1',
      [req.user.id, new Date()]
    );
    
    let totalDailyGainLoss = 0;
    let totalDailyGainLossPercent = 0;
    
    if (previousSnapshot && previousSnapshot.length > 0) {
      const previousValue = parseFloat(previousSnapshot[0].totalValue) || 0;
      const currentPortfolioValue = (parseFloat(portfolio.balance) || 0) + totalCurrentValue;
      totalDailyGainLoss = currentPortfolioValue - previousValue;
      totalDailyGainLossPercent = previousValue > 0 ? (totalDailyGainLoss / previousValue) * 100 : 0;
    }

    const updatedPortfolio = {
      ...portfolio,
      totalInvested: totalInvested,
      totalCurrentValue: totalCurrentValue,
      totalAllTimeGainLoss: totalAllTimeGainLoss,
      totalAllTimeGainLossPercent: totalAllTimeGainLossPercent,
      totalDailyGainLoss: totalDailyGainLoss,
      totalDailyGainLossPercent: totalDailyGainLossPercent
    };

    res.json({ 
      portfolio: updatedPortfolio,
      holdings: enrichedHoldings
    });
  } catch (error) {
    console.error('Get holdings error:', error);
    res.status(500).json({ error: 'Failed to get holdings' });
  }
});

// Get transaction history
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const transactions = await db.query(
      'SELECT * FROM portfolio_transactions WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3',
      [req.user.id, parseInt(limit), parseInt(skip)]
    );

    const totalResult = await db.query(
      'SELECT COUNT(*) as count FROM portfolio_transactions WHERE "userId" = $1',
      [req.user.id]
    );
    const total = parseInt(totalResult[0].count);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// Update portfolio value (called by cron job)
router.post('/update-value', authenticateToken, async (req, res) => {
  try {
    const holdings = await db.query(
      'SELECT * FROM portfolio_holdings WHERE "userId" = $1',
      [req.user.id]
    );

    let totalValue = 0;
    
    // For now, we'll use a simple calculation
    // In a real app, you'd fetch current stock prices
    for (const holding of holdings) {
      const quantity = parseFloat(holding.quantity) || 0;
      const averagePrice = parseFloat(holding.averagePrice) || 0;
      totalValue += quantity * averagePrice;
    }

    const portfolio = await ensurePortfolioExists(req.user.id);
    const newTotalValue = (parseFloat(portfolio.balance) || 0) + totalValue;

    await db.query(
      'UPDATE user_portfolios SET "totalValue" = $1, "updatedAt" = $2 WHERE "userId" = $3',
      [newTotalValue, new Date().toISOString(), req.user.id]
    );

    // Create portfolio snapshot
    await portfolioSnapshotService.createSnapshot(req.user.id);

    res.json({
      message: 'Portfolio value updated',
      totalValue: newTotalValue
    });
  } catch (error) {
    console.error('Update portfolio value error:', error);
    res.status(500).json({ error: 'Failed to update portfolio value' });
  }
});

module.exports = router;