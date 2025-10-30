const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const polygonService = require('../services/polygonService');
const portfolioSnapshotService = require('../services/portfolioSnapshotService');

const prisma = new PrismaClient();

// Update stock prices every hour during market hours (9 AM - 4 PM EST, Monday-Friday)
const updateStockPrices = async () => {
  try {
    console.log('📊 Updating stock prices with Polygon.io...');
    
    // Popular stock symbols to track
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC'];
    
    try {
      // Fetch real data from Polygon.io
      const { results, errors } = await polygonService.getMultipleStockQuotes(symbols);
      
      console.log(`✅ Successfully fetched ${results.length} stocks from Polygon.io`);
      if (errors.length > 0) {
        console.warn(`⚠️ Failed to fetch ${errors.length} stocks:`, errors.map(e => e.symbol));
      }

      // Update database with real data
      for (const stock of results) {
        try {
          // Cap percentage values to prevent database overflow
          const cappedChangePercent = Math.min(Math.max(stock.changePercent, -999999.99), 999999.99);
          
          await prisma.stockData.upsert({
            where: { symbol: stock.symbol },
            update: {
              name: stock.name,
              price: stock.price,
              change: stock.change,
              changePercent: cappedChangePercent,
              updatedAt: new Date()
            },
            create: {
              symbol: stock.symbol,
              name: stock.name,
              price: stock.price,
              change: stock.change,
              changePercent: cappedChangePercent
            }
          });
          console.log(`✅ Updated ${stock.symbol}: $${stock.price} (${stock.changePercent > 0 ? '+' : ''}${stock.changePercent}%)`);
        } catch (dbError) {
          console.error(`❌ Database error for ${stock.symbol}:`, dbError.message);
        }
      }

      // If we got no real data, fall back to mock data
      if (results.length === 0) {
        console.warn('⚠️ No real data received, using mock data as fallback');
        await updateStockPricesWithMockData();
      }

    } catch (apiError) {
      console.error('❌ Polygon.io API error:', apiError.message);
      console.log('🔄 Falling back to mock data...');
      await updateStockPricesWithMockData();
    }

    console.log('✅ Stock prices update completed');
  } catch (error) {
    console.error('❌ Failed to update stock prices:', error);
  }
};

// Fallback function with mock data
const updateStockPricesWithMockData = async () => {
  try {
    console.log('📊 Using mock data as fallback...');
    
    const sampleStocks = [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 175.50 + (Math.random() - 0.5) * 10, change: (Math.random() - 0.5) * 5, changePercent: (Math.random() - 0.5) * 3 },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.80 + (Math.random() - 0.5) * 8, change: (Math.random() - 0.5) * 4, changePercent: (Math.random() - 0.5) * 2 },
      { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.90 + (Math.random() - 0.5) * 15, change: (Math.random() - 0.5) * 6, changePercent: (Math.random() - 0.5) * 2 },
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50 + (Math.random() - 0.5) * 20, change: (Math.random() - 0.5) * 8, changePercent: (Math.random() - 0.5) * 3 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 155.20 + (Math.random() - 0.5) * 12, change: (Math.random() - 0.5) * 5, changePercent: (Math.random() - 0.5) * 2 },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.30 + (Math.random() - 0.5) * 25, change: (Math.random() - 0.5) * 10, changePercent: (Math.random() - 0.5) * 3 },
      { symbol: 'META', name: 'Meta Platforms Inc.', price: 320.15 + (Math.random() - 0.5) * 15, change: (Math.random() - 0.5) * 6, changePercent: (Math.random() - 0.5) * 2 },
      { symbol: 'NFLX', name: 'Netflix Inc.', price: 485.60 + (Math.random() - 0.5) * 18, change: (Math.random() - 0.5) * 7, changePercent: (Math.random() - 0.5) * 2 },
      { symbol: 'AMD', name: 'Advanced Micro Devices', price: 125.40 + (Math.random() - 0.5) * 10, change: (Math.random() - 0.5) * 4, changePercent: (Math.random() - 0.5) * 2 },
      { symbol: 'INTC', name: 'Intel Corp.', price: 45.20 + (Math.random() - 0.5) * 5, change: (Math.random() - 0.5) * 2, changePercent: (Math.random() - 0.5) * 1 }
    ];

    for (const stock of sampleStocks) {
      await prisma.stockData.upsert({
        where: { symbol: stock.symbol },
        update: {
          name: stock.name,
          price: parseFloat(stock.price.toFixed(2)),
          change: parseFloat(stock.change.toFixed(2)),
          changePercent: parseFloat(stock.changePercent.toFixed(2)),
          updatedAt: new Date()
        },
        create: {
          symbol: stock.symbol,
          name: stock.name,
          price: parseFloat(stock.price.toFixed(2)),
          change: parseFloat(stock.change.toFixed(2)),
          changePercent: parseFloat(stock.changePercent.toFixed(2))
        }
      });
    }

    console.log('✅ Mock stock prices updated successfully');
  } catch (error) {
    console.error('❌ Mock data fallback error:', error);
  }
};

// Send daily fact notifications at 8 AM
const sendDailyFactNotifications = async () => {
  try {
    console.log('📧 Sending daily fact notifications...');
    
    // Get all active users
    const users = await prisma.user.findMany({
      where: {
        progress: {
          isNot: null
        }
      },
      include: {
        progress: true
      }
    });

    // Get today's fact
    const facts = await prisma.dailyFact.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    if (facts.length === 0) {
      console.log('No facts available for notification');
      return;
    }

    const randomFact = facts[Math.floor(Math.random() * facts.length)];

    // In a real app, you would send push notifications or emails here
    console.log(`📱 Would send notification to ${users.length} users about: "${randomFact.title}"`);
    
  } catch (error) {
    console.error('❌ Failed to send daily fact notifications:', error);
  }
};

// Reset user streaks for inactive users (run daily at midnight)
const resetInactiveStreaks = async () => {
  try {
    console.log('🔄 Checking for inactive users...');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const inactiveUsers = await prisma.userProgress.findMany({
      where: {
        lastActiveDate: {
          lt: yesterday
        },
        streak: {
          gt: 0
        }
      }
    });

    for (const user of inactiveUsers) {
      await prisma.userProgress.update({
        where: { userId: user.userId },
        data: { streak: 0 }
      });
    }

    console.log(`🔄 Reset streaks for ${inactiveUsers.length} inactive users`);
  } catch (error) {
    console.error('❌ Failed to reset inactive streaks:', error);
  }
};

// Create daily portfolio snapshots at 6 PM EST
const createDailySnapshots = async () => {
  try {
    console.log('📊 Creating daily portfolio snapshots...');
    const results = await portfolioSnapshotService.createSnapshotsForAllUsers();
    
    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Daily snapshot job completed: ${successCount}/${results.length} successful`);
    
    // Log any failures
    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
      console.warn('⚠️ Some snapshots failed:', failures);
    }
  } catch (error) {
    console.error('❌ Daily snapshot job failed:', error);
  }
};

// Clean up old snapshots weekly (Sunday at 2 AM EST)
const cleanupOldSnapshots = async () => {
  try {
    console.log('🗑️ Running weekly cleanup job...');
    const deletedCount = await portfolioSnapshotService.cleanupOldSnapshots();
    console.log(`✅ Cleanup job completed: ${deletedCount} old snapshots removed`);
  } catch (error) {
    console.error('❌ Cleanup job failed:', error);
  }
};

// Schedule cron jobs
const startCronJobs = () => {
  console.log('⏰ Starting cron jobs...');

  // Update stock prices every hour during market hours (9 AM - 4 PM EST, Monday-Friday)
  cron.schedule('0 9-16 * * 1-5', updateStockPrices, {
    scheduled: true,
    timezone: "America/New_York"
  });

  // Send daily fact notifications at 8 AM
  cron.schedule('0 8 * * *', sendDailyFactNotifications, {
    scheduled: true,
    timezone: "America/New_York"
  });

  // Reset inactive streaks at midnight
  cron.schedule('0 0 * * *', resetInactiveStreaks, {
    scheduled: true,
    timezone: "America/New_York"
  });

  // Create daily portfolio snapshots at 6 PM EST
  cron.schedule('0 18 * * *', createDailySnapshots, {
    scheduled: true,
    timezone: "America/New_York"
  });

  // Clean up old snapshots weekly (Sunday at 2 AM EST)
  cron.schedule('0 2 * * 0', cleanupOldSnapshots, {
    scheduled: true,
    timezone: "America/New_York"
  });

  console.log('✅ Cron jobs started successfully');
  console.log('📊 Portfolio snapshots will be created daily at 6 PM EST');
  console.log('🗑️ Old snapshots will be cleaned up weekly on Sundays at 2 AM EST');
};

module.exports = {
  startCronJobs,
  updateStockPrices,
  sendDailyFactNotifications,
  resetInactiveStreaks,
  createDailySnapshots,
  cleanupOldSnapshots
};
