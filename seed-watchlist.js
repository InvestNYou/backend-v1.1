// Disable SSL certificate verification for DigitalOcean
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const DatabaseService = require('./src/services/databaseService');

async function seedWatchlist() {
  const db = new DatabaseService();
  
  try {
    console.log('🌱 Starting watchlist seeding...');
    
    // First, get existing users
    const users = await db.query('SELECT id, email FROM users LIMIT 5');
    console.log(`Found ${users.length} users to seed watchlist for`);
    
    if (users.length === 0) {
      console.log('❌ No users found. Please create users first.');
      return;
    }
    
    // Sample stocks to add to watchlist
    const sampleStocks = [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 150.00 },
      { symbol: 'MSFT', name: 'Microsoft Corporation', price: 300.00 },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2500.00 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3200.00 },
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 800.00 },
      { symbol: 'META', name: 'Meta Platforms Inc.', price: 200.00 },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 400.00 },
      { symbol: 'NFLX', name: 'Netflix Inc.', price: 450.00 },
      { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', price: 100.00 },
      { symbol: 'INTC', name: 'Intel Corporation', price: 30.00 }
    ];
    
    let totalAdded = 0;
    
    for (const user of users) {
      console.log(`\n👤 Seeding watchlist for user: ${user.email}`);
      
      // Clear existing watchlist for this user
      await db.query('DELETE FROM watchlist WHERE "userId" = $1', [user.id]);
      console.log('  🗑️  Cleared existing watchlist');
      
      // Add 3-5 random stocks to each user's watchlist
      const numStocks = Math.floor(Math.random() * 3) + 3; // 3-5 stocks
      const shuffledStocks = [...sampleStocks].sort(() => 0.5 - Math.random());
      const userStocks = shuffledStocks.slice(0, numStocks);
      
      for (const stock of userStocks) {
        try {
          const watchlistId = db.generateId();
          const now = new Date().toISOString();
          
          await db.query(
            'INSERT INTO watchlist (id, "userId", symbol, name, price, "addedAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [watchlistId, user.id, stock.symbol, stock.name, stock.price, now, now]
          );
          
          console.log(`  ✅ Added ${stock.symbol} - ${stock.name}`);
          totalAdded++;
        } catch (error) {
          console.log(`  ❌ Failed to add ${stock.symbol}: ${error.message}`);
        }
      }
    }
    
    console.log(`\n🎉 Watchlist seeding completed!`);
    console.log(`📊 Total stocks added: ${totalAdded}`);
    console.log(`👥 Users processed: ${users.length}`);
    
    // Show final watchlist counts per user
    console.log('\n📈 Final watchlist counts:');
    for (const user of users) {
      const count = await db.query(
        'SELECT COUNT(*) as count FROM watchlist WHERE "userId" = $1',
        [user.id]
      );
      console.log(`  ${user.email}: ${count[0].count} stocks`);
    }
    
  } catch (error) {
    console.error('❌ Error seeding watchlist:', error.message);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint
    });
  } finally {
    await db.cleanup();
  }
}

// Run the seeding
seedWatchlist();
