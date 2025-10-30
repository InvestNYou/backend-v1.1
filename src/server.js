const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Disable TLS certificate verification for DigitalOcean database connections
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const DatabaseService = require('./services/databaseService');
const StartupManager = require('./utils/startup');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const progressRoutes = require('./routes/progress');
const factsRoutes = require('./routes/facts');
const coursesRoutes = require('./routes/courses');
const portfolioRoutes = require('./routes/portfolio');
const chatRoutes = require('./routes/chat');
const askRoutes = require('./routes/ask');
const stockRoutes = require('./routes/stocks');
const quizRoutes = require('./routes/quizzes');
const unitTestRoutes = require('./routes/unitTests');
const watchlistRoutes = require('./routes/watchlist');
const { startCronJobs } = require('./utils/cron');

const app = express();
const db = new DatabaseService();
const startupManager = new StartupManager();

// Trust proxy for rate limiting behind load balancer
app.set('trust proxy', 1);

app.use(helmet());
app.use(compression());

// CORS configuration - moved before rate limiter
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Build allowed origins array dynamically
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'https://investnyou.netlify.app',
      'https://www.investnyou.netlify.app',
      'https://investnyou.netlify.app',
      'https://www.invstnyou.netlify.app'
    ];
    
    // Add production frontend URL if provided
    if (process.env.FRONTEND_URL) {
      const frontendUrl = process.env.FRONTEND_URL.trim();
      allowedOrigins.push(frontendUrl);
      // Also add version without trailing slash if it has one
      if (frontendUrl.endsWith('/')) {
        allowedOrigins.push(frontendUrl.slice(0, -1));
      } else {
        allowedOrigins.push(frontendUrl + '/');
      }
      // For Netlify deployments, also add the www subdomain version
      if (frontendUrl.includes('netlify.app')) {
        // Handle both invstnyou and investnyou variations
        if (frontendUrl.includes('invstnyou.netlify.app')) {
          allowedOrigins.push(frontendUrl.replace('invstnyou.netlify.app', 'www.invstnyou.netlify.app'));
          allowedOrigins.push(frontendUrl.replace('www.invstnyou.netlify.app', 'invstnyou.netlify.app'));
        }
        if (frontendUrl.includes('investnyou.netlify.app')) {
          allowedOrigins.push(frontendUrl.replace('investnyou.netlify.app', 'www.investnyou.netlify.app'));
          allowedOrigins.push(frontendUrl.replace('www.investnyou.netlify.app', 'investnyou.netlify.app'));
        }
      }
    }
    
    // Add additional frontend URLs if provided (comma-separated)
    if (process.env.ADDITIONAL_FRONTEND_URLS) {
      const additionalUrls = process.env.ADDITIONAL_FRONTEND_URLS.split(',').map(url => url.trim());
      allowedOrigins.push(...additionalUrls);
    }
    
    // In development, allow any localhost origin
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200,
  preflightContinue: false
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Additional CORS middleware to ensure headers are always present
app.use((req, res, next) => {
  // Set CORS headers for all responses
  const origin = req.headers.origin;
  
  // Build allowed origins array dynamically (same logic as corsOptions)
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'https://investnyou.netlify.app',
    'https://www.investnyou.netlify.app',
    'https://invstnyou.netlify.app',
    'https://www.invstnyou.netlify.app'
  ];
  
  // Add production frontend URL if provided
  if (process.env.FRONTEND_URL) {
    const frontendUrl = process.env.FRONTEND_URL.trim();
    allowedOrigins.push(frontendUrl);
    // Also add version without trailing slash if it has one
    if (frontendUrl.endsWith('/')) {
      allowedOrigins.push(frontendUrl.slice(0, -1));
    } else {
      allowedOrigins.push(frontendUrl + '/');
    }
    // For Netlify deployments, also add the www subdomain version
    if (frontendUrl.includes('netlify.app')) {
      allowedOrigins.push(frontendUrl.replace('invstnyou.netlify.app', 'www.invstnyou.netlify.app'));
      allowedOrigins.push(frontendUrl.replace('www.invstnyou.netlify.app', 'invstnyou.netlify.app'));
    }
  }
  
  // Add additional frontend URLs if provided (comma-separated)
  if (process.env.ADDITIONAL_FRONTEND_URLS) {
    const additionalUrls = process.env.ADDITIONAL_FRONTEND_URLS.split(',').map(url => url.trim());
    allowedOrigins.push(...additionalUrls);
  }
  
  // In development, allow any localhost origin
  if (process.env.NODE_ENV === 'development' && origin && origin.includes('localhost')) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Allow requests with no origin (like mobile apps or curl requests)
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
  res.header('Access-Control-Expose-Headers', 'Authorization');
  
  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 1000 : 100,
  message: 'Too many requests from this IP, please try again later.',
  // Ensure CORS headers are set even when rate limited
  handler: (req, res) => {
    // Set CORS headers before sending rate limit response
    const origin = req.headers.origin;
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://investnyou.org',
      'https://www.investnyou.org',
      'https://investnyou.org/',
      'https://www.investnyou.org/',
      'https://investnyou.netlify.app',
      'https://investnyou.netlify.app/',
      'https://www.investnyou.netlify.app',
      'https://www.investnyou.netlify.app/'
    ];
    
    if (process.env.FRONTEND_URL) {
      const frontendUrl = process.env.FRONTEND_URL.trim();
      allowedOrigins.push(frontendUrl);
      // Also add version without trailing slash if it has one
      if (frontendUrl.endsWith('/')) {
        allowedOrigins.push(frontendUrl.slice(0, -1));
      } else {
        allowedOrigins.push(frontendUrl + '/');
      }
      // For Netlify deployments, also add the www subdomain version
      if (frontendUrl.includes('netlify.app')) {
        // Handle both invstnyou and investnyou variations
        if (frontendUrl.includes('invstnyou.netlify.app')) {
          allowedOrigins.push(frontendUrl.replace('invstnyou.netlify.app', 'www.invstnyou.netlify.app'));
          allowedOrigins.push(frontendUrl.replace('www.invstnyou.netlify.app', 'invstnyou.netlify.app'));
        }
        if (frontendUrl.includes('investnyou.netlify.app')) {
          allowedOrigins.push(frontendUrl.replace('investnyou.netlify.app', 'www.investnyou.netlify.app'));
          allowedOrigins.push(frontendUrl.replace('www.investnyou.netlify.app', 'investnyou.netlify.app'));
        }
      }
    }
    
    if (process.env.ADDITIONAL_FRONTEND_URLS) {
      const additionalUrls = process.env.ADDITIONAL_FRONTEND_URLS.split(',').map(url => url.trim());
      allowedOrigins.push(...additionalUrls);
    }
    
    if (process.env.NODE_ENV === 'development' && origin && origin.includes('localhost')) {
      res.header('Access-Control-Allow-Origin', origin);
    } else if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    } else if (!origin) {
      res.header('Access-Control-Allow-Origin', '*');
    }
    
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.header('Access-Control-Expose-Headers', 'Authorization');
    
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(15 * 60 * 1000 / 1000) // seconds
    });
  }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      startup: startupManager.getStatus(),
      databaseMode: db.usePrisma ? 'prisma' : 'raw-sql'
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'disconnected',
      error: error.message,
      startup: startupManager.getStatus()
    });
  }
});

// Temporary endpoint to create tables (remove after tables are created)
app.post('/api/create-tables', async (req, res) => {
  try {
    console.log('🔧 Creating tables via API endpoint...');
    
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        "ageRange" VARCHAR(50),
        "financialGoal" VARCHAR(100),
        "learningMode" VARCHAR(50),
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');
    
    // Create user_progress table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL,
        level INTEGER DEFAULT 1,
        xp INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        badges JSONB DEFAULT '[]',
        "completedFacts" JSONB DEFAULT '[]',
        "completedLessons" JSONB DEFAULT '[]',
        "lastActiveDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ User progress table created');
    
    // Create user_portfolios table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_portfolios (
        id VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL,
        balance DECIMAL(15,2) DEFAULT 10000.00,
        "totalValue" DECIMAL(15,2) DEFAULT 10000.00,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ User portfolios table created');
    
    // Create daily_facts table
    await db.query(`
      CREATE TABLE IF NOT EXISTS daily_facts (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100),
        difficulty VARCHAR(50),
        "xpValue" INTEGER DEFAULT 10,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Daily facts table created');
    
    // Create fact_completions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS fact_completions (
        id VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL,
        "factId" VARCHAR(255) NOT NULL,
        "completedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Fact completions table created');
    
    // Create additional essential tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS portfolio_transactions (
        id VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL,
        type VARCHAR(10) NOT NULL,
        symbol VARCHAR(10) NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        "totalValue" DECIMAL(15,2) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS portfolio_holdings (
        id VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL,
        symbol VARCHAR(10) NOT NULL,
        quantity INTEGER NOT NULL,
        "averagePrice" DECIMAL(10,2) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        context JSONB,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS ask_messages (
        id VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL,
        prompt TEXT NOT NULL,
        response TEXT NOT NULL,
        "responseTime" INTEGER,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_watchlist (
        id VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL,
        symbol VARCHAR(10) NOT NULL,
        name VARCHAR(255),
        price DECIMAL(10,2) DEFAULT 0,
        "addedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS stock_data (
        id VARCHAR(255) PRIMARY KEY,
        symbol VARCHAR(10) UNIQUE NOT NULL,
        name VARCHAR(255),
        price DECIMAL(10,2),
        change DECIMAL(10,2),
        "changePercent" DECIMAL(5,2),
        volume BIGINT,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ All tables created successfully');
    
    res.json({ 
      success: true, 
      message: 'All tables created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/status', async (req, res) => {
  try {
    const dbSetup = require('./utils/databaseSetup');
    const db = new dbSetup();
    
    const connectionTest = await db.testConnection();
    const tableCheck = await db.checkTablesExist();
    
    res.json({
      connection: connectionTest,
      tables: tableCheck,
      startup: startupManager.getStatus()
    });
    
    await db.cleanup();
  } catch (error) {
    res.status(500).json({
      error: 'Failed to check database status',
      message: error.message
    });
  }
});

// Debug endpoint to log detailed database information
app.get('/api/debug-db', async (req, res) => {
  try {
    const dbSetup = require('./utils/databaseSetup');
    const db = new dbSetup();
    
    console.log('🔍 Manual database debug requested...');
    await db.logDatabaseInfo();
    
    res.json({
      success: true,
      message: 'Database debug information logged to console',
      timestamp: new Date().toISOString()
    });
    
    await db.cleanup();
  } catch (error) {
    console.error('❌ Database debug failed:', error.message);
    res.status(500).json({
      error: 'Failed to debug database',
      message: error.message
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/facts', factsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ask', askRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/unit-tests', unitTestRoutes);
app.use('/api/watchlist', watchlistRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await startupManager.cleanup();
  await db.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await startupManager.cleanup();
  await db.cleanup();
  process.exit(0);
});

async function startServer() {
  try {
    console.log('🚀 Starting MoneySmart Backend...');
    
    const initResult = await startupManager.initialize();
    
    if (!initResult.success) {
      console.error('❌ Failed to initialize backend:', initResult.error);
      console.log('💡 Troubleshooting suggestions:');
      initResult.suggestions?.forEach(suggestion => {
        console.log(`   • ${suggestion}`);
      });
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 MoneySmart Backend running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 Database status: http://localhost:${PORT}/api/status`);
      console.log(`🔍 Database debug: http://localhost:${PORT}/api/debug-db`);
      
      startCronJobs();
    });
    
  } catch (error) {
    console.error('💥 Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
