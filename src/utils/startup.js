const DatabaseSetup = require('./databaseSetup');
const { execSync } = require('child_process');

class StartupManager {
  constructor() {
    this.dbSetup = new DatabaseSetup();
    this.startupLog = [];
  }

  /**
   * Log startup events with timestamps
   */
  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message, type };
    this.startupLog.push(logEntry);
    
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[type] || 'ℹ️';
    
    console.log(`${emoji} [${timestamp}] ${message}`);
  }

  /**
   * Comprehensive startup process
   */
  async initialize() {
    this.log('🚀 Starting MoneySmart Backend initialization...', 'info');
    
    try {
      // Step 1: Environment validation
      await this.validateEnvironment();
      
      // Step 2: Database setup
      await this.setupDatabase();
      
      // Step 3: Seed database if needed
      await this.seedDatabase();
      
      // Step 4: Final validation
      await this.finalValidation();
      
      this.log('🎉 Backend initialization completed successfully!', 'success');
      return { success: true, logs: this.startupLog };
      
    } catch (error) {
      this.log(`💥 Initialization failed: ${error.message}`, 'error');
      return { 
        success: false, 
        error: error.message, 
        logs: this.startupLog,
        suggestions: this.getTroubleshootingSuggestions(error)
      };
    }
  }

  /**
   * Validate environment variables
   */
  async validateEnvironment() {
    this.log('🔍 Validating environment configuration...', 'info');
    
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'PORT'];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    // Validate DATABASE_URL format
    try {
      const url = new URL(process.env.DATABASE_URL);
      if (url.protocol !== 'postgresql:') {
        throw new Error('DATABASE_URL must use postgresql:// protocol');
      }
    } catch (error) {
      throw new Error(`Invalid DATABASE_URL format: ${error.message}`);
    }
    
    this.log('✅ Environment validation passed', 'success');
  }

  /**
   * Setup database with comprehensive error handling
   */
  async setupDatabase() {
    this.log('🗄️ Setting up database...', 'info');
    
    const dbResult = await this.dbSetup.setupDatabase();
    
    if (!dbResult.success) {
      this.log(`❌ Database setup failed: ${dbResult.message}`, 'error');
      
      if (dbResult.suggestions) {
        this.log('💡 Troubleshooting suggestions:', 'warning');
        dbResult.suggestions.forEach(suggestion => {
          this.log(`   • ${suggestion}`, 'warning');
        });
      }
      
      throw new Error(`Database setup failed: ${dbResult.message}`);
    }
    
    this.log('✅ Database setup completed', 'success');
    
    // Log detailed database information after successful setup
    this.log('📊 Logging detailed database information...', 'info');
    await this.dbSetup.logDatabaseInfo();
  }

  /**
   * Seed database with sample data
   */
  async seedDatabase() {
    this.log('🌱 Checking if database needs seeding...', 'info');
    
    try {
      // Check if data already exists
      if (this.dbSetup.usePrisma && this.dbSetup.prisma) {
        const userCount = await this.dbSetup.prisma.user.count();
        const factCount = await this.dbSetup.prisma.dailyFact.count();
        
        if (userCount > 0 && factCount > 0) {
          this.log('✅ Database already contains data, skipping seed', 'success');
          return;
        }
      } else {
        // Use raw SQL to check data
        const userCountResult = await this.dbSetup.query('SELECT COUNT(*) as count FROM users');
        const factCountResult = await this.dbSetup.query('SELECT COUNT(*) as count FROM daily_facts');
        
        const userCount = parseInt(userCountResult[0].count);
        const factCount = parseInt(factCountResult[0].count);
        
        if (userCount > 0 && factCount > 0) {
          this.log('✅ Database already contains data, skipping seed', 'success');
          return;
        }
      }
      
      this.log('🌱 Seeding database with sample data...', 'info');
      
      // Run the seed script
      execSync('npm run db:seed', { 
        stdio: 'pipe',
        cwd: process.cwd()
      });
      
      this.log('✅ Database seeding completed', 'success');
      
    } catch (error) {
      this.log(`⚠️ Database seeding failed: ${error.message}`, 'warning');
      if (this.dbSetup.usePrisma) {
        this.log('💡 You can manually run "npm run db:seed" later', 'info');
      } else {
        this.log('💡 Production mode: Seeding skipped (tables already exist)', 'info');
      }
    }
  }

  /**
   * Final validation of the setup
   */
  async finalValidation() {
    this.log('🔍 Performing final validation...', 'info');
    
    try {
      // Test database connection
      const connectionTest = await this.dbSetup.testConnection();
      if (!connectionTest.success) {
        throw new Error('Database connection validation failed');
      }
      
      // Test basic database operations
      if (this.dbSetup.usePrisma && this.dbSetup.prisma) {
        await this.dbSetup.prisma.user.findMany({ take: 1 });
        await this.dbSetup.prisma.dailyFact.findMany({ take: 1 });
      } else {
        // In production, just test basic connectivity
        await this.dbSetup.query('SELECT 1');
        try {
          await this.dbSetup.query('SELECT * FROM users LIMIT 1');
        } catch (error) {
          this.log('⚠️ Users table not accessible, but basic connection works', 'warning');
        }
      }
      
      this.log('✅ Final validation passed', 'success');
      
    } catch (error) {
      this.log(`❌ Final validation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Get troubleshooting suggestions based on error
   */
  getTroubleshootingSuggestions(error) {
    const suggestions = [];
    
    if (error.message.includes('DATABASE_URL')) {
      suggestions.push('Check your .env file for correct DATABASE_URL');
      suggestions.push('Format: postgresql://username:password@host:port/database');
    }
    
    if (error.message.includes('connection')) {
      suggestions.push('Ensure PostgreSQL is running');
      suggestions.push('Check if the database exists in pgAdmin');
      suggestions.push('Verify network connectivity to the database');
    }
    
    if (error.message.includes('permission')) {
      suggestions.push('Grant proper permissions to your database user');
      suggestions.push('Try using the postgres superuser account');
      suggestions.push('Check if the user has CREATE and INSERT privileges');
    }
    
    if (error.message.includes('tables')) {
      suggestions.push('Run the manual table creation script');
      suggestions.push('Check if the database schema is correct');
    }
    
    return suggestions;
  }

  /**
   * Get startup status and logs
   */
  getStatus() {
    return {
      isInitialized: this.startupLog.some(log => log.type === 'success' && log.message.includes('completed')),
      logs: this.startupLog,
      lastError: this.startupLog.find(log => log.type === 'error')?.message || null
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    await this.dbSetup.cleanup();
  }
}

module.exports = StartupManager;
