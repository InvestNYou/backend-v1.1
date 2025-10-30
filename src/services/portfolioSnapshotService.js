const DatabaseService = require('./databaseService');
const polygonService = require('./polygonService');

class PortfolioSnapshotService {
  constructor() {
    this.db = new DatabaseService();
    console.log('✅ Portfolio Snapshot Service initialized');
  }

  // Create a daily snapshot of user's portfolio
  async createDailySnapshot(userId) {
    try {
      console.log(`📊 Creating daily snapshot for user ${userId}`);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of day
      
      // Check if snapshot already exists for today
      const existingSnapshot = await this.db.query(
        'SELECT * FROM portfolio_snapshots WHERE "userId" = $1 AND date = $2',
        [userId, today]
      );

      if (existingSnapshot && existingSnapshot.length > 0) {
        console.log(`📦 Snapshot already exists for ${today.toISOString().split('T')[0]}`);
        return existingSnapshot[0];
      }

      // Get current portfolio data
      const portfolio = await this.db.query(
        'SELECT * FROM user_portfolios WHERE "userId" = $1',
        [userId]
      );

      if (!portfolio || portfolio.length === 0) {
        console.log(`❌ No portfolio found for user ${userId}`);
        return null;
      }

      const portfolioData = portfolio[0];

      // Get current holdings
      const holdings = await this.db.query(
        'SELECT * FROM portfolio_holdings WHERE "userId" = $1',
        [userId]
      );

      // Calculate total value
      let totalValue = parseFloat(portfolioData.balance) || 0;
      for (const holding of holdings) {
        // In a real app, you'd fetch current stock prices
        // For now, we'll use the average price
        const quantity = parseFloat(holding.quantity) || 0;
        const averagePrice = parseFloat(holding.averagePrice) || 0;
        totalValue += quantity * averagePrice;
      }

      // Calculate totalInvested and totalSold from transactions
      const buyTransactions = await this.db.query(
        'SELECT COALESCE(SUM(total), 0) as total FROM portfolio_transactions WHERE "userId" = $1 AND type = $2',
        [userId, 'BUY']
      );
      const sellTransactions = await this.db.query(
        'SELECT COALESCE(SUM(total), 0) as total FROM portfolio_transactions WHERE "userId" = $1 AND type = $2',
        [userId, 'SELL']
      );

      const totalInvested = parseFloat(buyTransactions[0]?.total || '0') || 0;
      const totalSold = parseFloat(sellTransactions[0]?.total || '0') || 0;

      // Get previous day's snapshot for daily change calculation
      // Get the most recent snapshot before today (in case of gaps)
      const previousSnapshot = await this.db.query(
        'SELECT * FROM portfolio_snapshots WHERE "userId" = $1 AND date < $2 ORDER BY date DESC LIMIT 1',
        [userId, today]
      );

      let dailyChange = 0;
      let dailyChangePercent = 0;

      if (previousSnapshot && previousSnapshot.length > 0) {
        const previousValue = parseFloat(previousSnapshot[0].totalValue) || 0;
        dailyChange = parseFloat(totalValue) - previousValue;
        dailyChangePercent = previousValue > 0 ? (dailyChange / previousValue) * 100 : 0;
      }

      // Create snapshot
      const snapshot = await this.db.query(
        'INSERT INTO portfolio_snapshots (id, "userId", date, balance, "totalValue", "totalInvested", "totalSold", "dailyChange", "dailyChangePercent", holdings, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
        [
          this.db.generateId(),
          userId,
          today,
          parseFloat(portfolioData.balance) || 0,
          parseFloat(totalValue) || 0,
          totalInvested,
          totalSold,
          dailyChange,
          dailyChangePercent,
          JSON.stringify(holdings),
          new Date().toISOString()
        ]
      );

      console.log(`✅ Daily snapshot created for user ${userId}`);
      return snapshot[0];

    } catch (error) {
      console.error('❌ Error creating daily snapshot:', error);
      throw error;
    }
  }

  // Create snapshot for a specific user (called by routes)
  async createSnapshot(userId) {
    return await this.createDailySnapshot(userId);
  }

  // Get portfolio value history
  async getPortfolioHistory(userId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const snapshots = await this.db.query(
        'SELECT * FROM portfolio_snapshots WHERE "userId" = $1 AND date >= $2 ORDER BY date ASC',
        [userId, startDate]
      );

      return snapshots.map(snapshot => ({
        date: snapshot.date,
        balance: parseFloat(snapshot.balance),
        totalValue: parseFloat(snapshot.totalValue),
        holdings: JSON.parse(snapshot.holdings || '[]')
      }));

    } catch (error) {
      console.error('❌ Error getting portfolio history:', error);
      throw error;
    }
  }

  // Get portfolio performance metrics
  async getPortfolioPerformance(userId, days = 30) {
    try {
      const snapshots = await this.getPortfolioHistory(userId, days);
      
      if (snapshots.length < 2) {
        return {
          totalReturn: 0,
          totalReturnPercent: 0,
          dailyReturns: [],
          volatility: 0,
          sharpeRatio: 0
        };
      }

      const firstValue = snapshots[0].totalValue;
      const lastValue = snapshots[snapshots.length - 1].totalValue;
      const totalReturn = lastValue - firstValue;
      const totalReturnPercent = (totalReturn / firstValue) * 100;

      // Calculate daily returns
      const dailyReturns = [];
      for (let i = 1; i < snapshots.length; i++) {
        const prevValue = snapshots[i - 1].totalValue;
        const currentValue = snapshots[i].totalValue;
        const dailyReturn = (currentValue - prevValue) / prevValue;
        dailyReturns.push(dailyReturn);
      }

      // Calculate volatility (standard deviation of daily returns)
      const avgReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length;
      const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / dailyReturns.length;
      const volatility = Math.sqrt(variance);

      // Calculate Sharpe ratio (simplified)
      const sharpeRatio = volatility > 0 ? avgReturn / volatility : 0;

      return {
        totalReturn,
        totalReturnPercent,
        dailyReturns,
        volatility,
        sharpeRatio,
        period: `${days} days`
      };

    } catch (error) {
      console.error('❌ Error calculating portfolio performance:', error);
      throw error;
    }
  }

  // Cleanup old snapshots (keep only last 90 days)
  async cleanupOldSnapshots() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);

      const result = await this.db.query(
        'DELETE FROM portfolio_snapshots WHERE date < $1',
        [cutoffDate]
      );

      console.log(`🧹 Cleaned up old snapshots before ${cutoffDate.toISOString().split('T')[0]}`);
      return result;

    } catch (error) {
      console.error('❌ Error cleaning up old snapshots:', error);
      throw error;
    }
  }
}

module.exports = new PortfolioSnapshotService();