const { Pool } = require('pg');
const { execSync } = require('child_process');
require('dotenv').config();

class DatabaseSetup {
  constructor() {
    this.prisma = null;
    this.pool = null;
    // Default to Prisma unless explicitly disabled
    this.usePrisma = process.env.USE_PRISMA !== 'false';
    this.connectionStatus = {
      isConnected: false,
      lastError: null,
      connectionDetails: null
    };
    
    if (this.usePrisma) {
      const { PrismaClient } = require('@prisma/client');
      
      // Digital Ocean specific Prisma configuration
      const prismaConfig = {
        log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
        datasources: {
          db: {
            url: process.env.DATABASE_URL
          }
        }
      };

      // Add connection pooling for Digital Ocean
      if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('digitalocean')) {
        prismaConfig.datasources.db.url = process.env.DATABASE_URL + '?connection_limit=5&pool_timeout=20';
      }

      this.prisma = new PrismaClient(prismaConfig);
    }
  }

  /**
   * Comprehensive database connection testing and debugging
   */
  async testConnection() {
    console.log('🔍 Testing database connection...');
    
    try {
      // Test Prisma connection (only if enabled)
      if (this.usePrisma && this.prisma) {
        await this.prisma.$connect();
        console.log('✅ Prisma connection successful');
      } else {
        console.log('📋 Using raw SQL connection (Prisma disabled)');
      }
      
      // Test raw PostgreSQL connection
      await this.testRawConnection();
      
      // Test database permissions
      await this.testPermissions();
      
      // Log comprehensive database information
      await this.logDatabaseInfo();
      
      this.connectionStatus.isConnected = true;
      this.connectionStatus.lastError = null;
      
      return {
        success: true,
        message: 'Database connection successful',
        details: this.connectionStatus
      };
      
    } catch (error) {
      this.connectionStatus.isConnected = false;
      this.connectionStatus.lastError = error;
      
      console.error('❌ Database connection failed:', error.message);
      
      return {
        success: false,
        message: 'Database connection failed',
        error: error.message,
        details: this.connectionStatus
      };
    }
  }

  /**
   * Execute a raw SQL query
   */
  async query(sql, params = []) {
    if (this.usePrisma && this.prisma) {
      return await this.prisma.$queryRawUnsafe(sql, ...params);
    } else {
      const client = await this.pool.connect();
      try {
        const result = await client.query(sql, params);
        return result.rows;
      } finally {
        client.release();
      }
    }
  }

  /**
   * Test raw PostgreSQL connection
   */
  async testRawConnection() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL not found in environment variables');
    }

    // Parse connection string
    const url = new URL(dbUrl);
    const config = {
      user: url.username,
      password: url.password,
      host: url.hostname,
      port: url.port || 5432,
      database: url.pathname.slice(1),
      ssl: {
        rejectUnauthorized: false,
        checkServerIdentity: () => undefined
      }
    };

    this.connectionStatus.connectionDetails = {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user
    };

    this.pool = new Pool(config);
    
    const client = await this.pool.connect();
    console.log('✅ Raw PostgreSQL connection successful');
    client.release();
  }

  /**
   * Test database permissions
   */
  async testPermissions() {
    const client = await this.pool.connect();
    
    try {
      // Test CREATE permission
      await client.query('SELECT 1');
      console.log('✅ Basic SELECT permission confirmed');
      
      // Test if we can create tables (this will fail gracefully if no permission)
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS permission_test (
            id SERIAL PRIMARY KEY,
            test_field TEXT
          )
        `);
        console.log('✅ CREATE TABLE permission confirmed');
        
        // Clean up test table
        await client.query('DROP TABLE IF EXISTS permission_test');
        console.log('✅ DROP TABLE permission confirmed');
        
      } catch (permError) {
        console.warn('⚠️ Limited CREATE permissions detected:', permError.message);
        console.log('💡 This may cause issues with Prisma migrations');
      }
      
    } finally {
      client.release();
    }
  }

  /**
   * Log comprehensive database information
   */
  async logDatabaseInfo() {
    console.log('\n📊 ===== DATABASE CONNECTION DETAILS =====');
    
    try {
      const client = await this.pool.connect();
      
      try {
        // Get database name and version
        const dbInfo = await client.query(`
          SELECT 
            current_database() as database_name,
            version() as postgres_version,
            current_user as current_user,
            inet_server_addr() as server_address,
            inet_server_port() as server_port
        `);
        
        const info = dbInfo.rows[0];
        console.log(`🗄️  Database Name: ${info.database_name}`);
        console.log(`🔧 PostgreSQL Version: ${info.postgres_version.split(' ')[0]} ${info.postgres_version.split(' ')[1]}`);
        console.log(`👤 Current User: ${info.current_user}`);
        console.log(`🔑 User Type: ${info.current_user === 'doadmin' ? 'Digital Ocean Admin' : 'Standard User'}`);
        console.log(`🌐 Server Address: ${info.server_address || 'localhost'}`);
        console.log(`🔌 Server Port: ${info.server_port || '5432'}`);
        
        // Get all schemas
        const schemas = await client.query(`
          SELECT schema_name 
          FROM information_schema.schemata 
          WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
          ORDER BY schema_name
        `);
        
        console.log(`📁 Available Schemas: ${schemas.rows.map(r => r.schema_name).join(', ')}`);
        
        // Get tables in each schema
        for (const schema of schemas.rows) {
          const schemaName = schema.schema_name;
          const tables = await client.query(`
            SELECT table_name, table_type
            FROM information_schema.tables 
            WHERE table_schema = $1
            ORDER BY table_name
          `, [schemaName]);
          
          if (tables.rows.length > 0) {
            console.log(`\n📋 Tables in schema '${schemaName}':`);
            tables.rows.forEach(table => {
              console.log(`   • ${table.table_name} (${table.table_type})`);
            });
          }
        }
        
        // Check specifically for our application tables
        const appTables = await client.query(`
          SELECT table_schema, table_name
          FROM information_schema.tables 
          WHERE table_name IN (
            'users', 'daily_facts', 'courses', 'lessons', 'user_progress', 
            'fact_completions', 'lesson_completions', 'user_portfolios', 
            'portfolio_transactions', 'chat_messages', 'stock_data', 
            'watchlist', 'portfolio_snapshots', 'quizzes', 
            'quiz_attempts', 'units', 'unit_tests', 'unit_test_attempts'
          )
          ORDER BY table_schema, table_name
        `);
        
        console.log(`\n🎯 Application Tables Found:`);
        if (appTables.rows.length > 0) {
          appTables.rows.forEach(table => {
            console.log(`   ✅ ${table.table_schema}.${table.table_name}`);
          });
        } else {
          console.log(`   ❌ No application tables found!`);
          console.log(`   💡 This explains why the app can't access tables.`);
          console.log(`   💡 Tables should be in 'public' schema.`);
        }
        
        // Check current search path
        const searchPath = await client.query('SHOW search_path');
        console.log(`\n🔍 Current Search Path: ${searchPath.rows[0].search_path}`);
        
        // Display current user prominently
        console.log(`\n👤 DATABASE USER: ${info.current_user}`);
        if (info.current_user === 'doadmin') {
          console.log(`🔑 User Type: Digital Ocean Admin User`);
          console.log(`✅ This user has full database privileges`);
        } else {
          console.log(`🔑 User Type: Standard Database User`);
          console.log(`⚠️  This user may have limited privileges`);
        }
        
        // Check if we can access tables in the public schema
        console.log(`\n🔎 Testing table access in public schema:`);
        try {
          const testResult = await client.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'users'
          `);
          
          const hasUsersTable = parseInt(testResult.rows[0].count) > 0;
          console.log(`   ${hasUsersTable ? '✅' : '❌'} Schema 'public': ${hasUsersTable ? 'Has users table' : 'No users table'}`);
          
          if (hasUsersTable) {
            // Try to actually query the table
            try {
              await client.query(`SELECT COUNT(*) FROM public.users`);
              console.log(`      ✅ Can query public.users table`);
            } catch (queryError) {
              console.log(`      ❌ Cannot query public.users: ${queryError.message}`);
            }
          }
        } catch (error) {
          console.log(`   ❌ Schema 'public': Error - ${error.message}`);
        }
        
        console.log('\n📊 ===== END DATABASE DETAILS =====\n');
        
      } finally {
        client.release();
      }
      
    } catch (error) {
      console.error('❌ Failed to log database info:', error.message);
    }
  }

  /**
   * Create database tables manually if Prisma migrations fail
   */
  async createTablesManually() {
    console.log('🔧 Creating database tables manually...');
    
    // Check if we're on Digital Ocean and handle permissions
    const isDigitalOcean = process.env.DATABASE_URL?.includes('digitalocean') || 
                          process.env.NODE_ENV === 'production';
    
    if (isDigitalOcean) {
      console.log('🌊 Digital Ocean detected - checking table existence first...');
      
      // First, check if tables already exist
      const client = await this.pool.connect();
      try {
        const existingTables = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `);
        
        const tableNames = existingTables.rows.map(r => r.table_name);
        console.log('📋 Existing tables:', tableNames);
        
        // If we have the essential tables, consider it successful
        const essentialTables = ['users', 'daily_facts', 'user_progress', 'user_portfolios'];
        const hasEssentialTables = essentialTables.every(table => tableNames.includes(table));
        
        if (hasEssentialTables) {
          console.log('✅ Essential tables already exist - skipping creation');
          return { success: true, message: 'Essential tables already exist' };
        }
        
        // If we don't have essential tables, try to create them
        console.log('⚠️ Essential tables missing - attempting creation...');
        
      } catch (error) {
        console.warn('⚠️ Could not check existing tables:', error.message);
        // Continue with table creation attempt
      } finally {
        client.release();
      }
    }
    
    const client = await this.pool.connect();
    
    try {
      const createTablesSQL = `
        -- Create Users table
        CREATE TABLE IF NOT EXISTS "users" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "name" TEXT,
            "email" TEXT NOT NULL UNIQUE,
            "ageRange" TEXT,
            "financialGoal" TEXT,
            "learningMode" TEXT NOT NULL DEFAULT 'facts',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL
        );

        -- Create UserProgress table
        CREATE TABLE IF NOT EXISTS "user_progress" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "userId" TEXT NOT NULL UNIQUE,
            "level" INTEGER NOT NULL DEFAULT 1,
            "xp" INTEGER NOT NULL DEFAULT 0,
            "streak" INTEGER NOT NULL DEFAULT 0,
            "badges" JSONB NOT NULL DEFAULT '[]',
            "completedFacts" JSONB NOT NULL DEFAULT '[]',
            "completedLessons" JSONB NOT NULL DEFAULT '[]',
            "lastActiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL
        );

        -- Create DailyFacts table
        CREATE TABLE IF NOT EXISTS "daily_facts" (
            "id" SERIAL PRIMARY KEY,
            "title" TEXT NOT NULL,
            "content" TEXT NOT NULL,
            "category" TEXT NOT NULL,
            "xpValue" INTEGER NOT NULL DEFAULT 10,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL
        );

        -- Create FactCompletion table
        CREATE TABLE IF NOT EXISTS "fact_completions" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "userId" TEXT NOT NULL,
            "factId" INTEGER NOT NULL,
            "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        -- Create Courses table
        CREATE TABLE IF NOT EXISTS "courses" (
            "id" SERIAL PRIMARY KEY,
            "title" TEXT NOT NULL,
            "description" TEXT,
            "lessonsCount" INTEGER NOT NULL DEFAULT 0,
            "thumbnail" TEXT,
            "color" TEXT,
            "isLocked" BOOLEAN NOT NULL DEFAULT false,
            "order" INTEGER NOT NULL DEFAULT 0,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL
        );

        -- Create Lessons table
        CREATE TABLE IF NOT EXISTS "lessons" (
            "id" SERIAL PRIMARY KEY,
            "courseId" INTEGER NOT NULL,
            "title" TEXT NOT NULL,
            "content" TEXT NOT NULL,
            "order" INTEGER NOT NULL DEFAULT 0,
            "xpValue" INTEGER NOT NULL DEFAULT 20,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL
        );

        -- Create LessonCompletion table
        CREATE TABLE IF NOT EXISTS "lesson_completions" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "userId" TEXT NOT NULL,
            "lessonId" INTEGER NOT NULL,
            "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        -- Create UserPortfolio table
        CREATE TABLE IF NOT EXISTS "user_portfolios" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "userId" TEXT NOT NULL UNIQUE,
            "balance" DECIMAL(10,2) NOT NULL DEFAULT 10000.00,
            "totalValue" DECIMAL(10,2) NOT NULL DEFAULT 10000.00,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL
        );

        -- Create PortfolioTransaction table
        CREATE TABLE IF NOT EXISTS "portfolio_transactions" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "userId" TEXT NOT NULL,
            "symbol" TEXT NOT NULL,
            "shares" DECIMAL(10,4) NOT NULL,
            "price" DECIMAL(10,2) NOT NULL,
            "total" DECIMAL(10,2) NOT NULL,
            "type" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        -- Create PortfolioHoldings table
        CREATE TABLE IF NOT EXISTS "portfolio_holdings" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "userId" TEXT NOT NULL,
            "symbol" TEXT NOT NULL,
            "quantity" INTEGER NOT NULL,
            "averagePrice" DECIMAL(10,2) NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        -- Create ChatMessage table
        CREATE TABLE IF NOT EXISTS "chat_messages" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "userId" TEXT NOT NULL,
            "message" TEXT NOT NULL,
            "response" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        -- Create StockData table
        CREATE TABLE IF NOT EXISTS "stock_data" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "symbol" TEXT NOT NULL UNIQUE,
            "name" TEXT NOT NULL,
            "price" DECIMAL(10,2) NOT NULL,
            "change" DECIMAL(10,2) NOT NULL,
            "changePercent" DECIMAL(5,2) NOT NULL,
            "updatedAt" TIMESTAMP(3) NOT NULL
        );

        -- Add foreign key constraints
        ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        
        ALTER TABLE "fact_completions" ADD CONSTRAINT "fact_completions_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        
        ALTER TABLE "fact_completions" ADD CONSTRAINT "fact_completions_factId_fkey" 
            FOREIGN KEY ("factId") REFERENCES "daily_facts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        
        ALTER TABLE "lessons" ADD CONSTRAINT "lessons_courseId_fkey" 
            FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        
        ALTER TABLE "lesson_completions" ADD CONSTRAINT "lesson_completions_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        
        ALTER TABLE "lesson_completions" ADD CONSTRAINT "lesson_completions_lessonId_fkey" 
            FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        
        ALTER TABLE "user_portfolios" ADD CONSTRAINT "user_portfolios_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        
        ALTER TABLE "portfolio_transactions" ADD CONSTRAINT "portfolio_transactions_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        
        ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

        -- Add unique constraints
        ALTER TABLE "fact_completions" ADD CONSTRAINT "fact_completions_userId_factId_key" 
            UNIQUE ("userId", "factId");
        
        ALTER TABLE "lesson_completions" ADD CONSTRAINT "lesson_completions_userId_lessonId_key" 
            UNIQUE ("userId", "lessonId");
      `;

      await client.query(createTablesSQL);
      console.log('✅ Database tables created successfully');
      
      return { success: true, message: 'Tables created successfully' };
      
    } catch (error) {
      console.error('❌ Failed to create tables:', error.message);
      return { success: false, message: 'Failed to create tables', error: error.message };
    } finally {
      client.release();
    }
  }

  /**
   * Check if tables exist - handles Digital Ocean setup
   */
  async checkTablesExist() {
    const client = await this.pool.connect();
    
    try {
      // First, check what database we're actually connected to
      const dbInfo = await client.query(`
        SELECT current_database() as current_database, current_schema() as current_schema
      `);
      
      console.log(`🔍 Connected to database: ${dbInfo.rows[0].current_database}`);
      console.log(`🔍 Current schema: ${dbInfo.rows[0].current_schema}`);
      
      // Check tables in the current schema (usually 'public')
      const result = await client.query(`
        SELECT table_name, table_schema
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name IN ('users', 'daily_facts', 'courses', 'lessons', 'user_progress', 'fact_completions', 'lesson_completions', 'user_portfolios', 'portfolio_transactions', 'portfolio_holdings', 'chat_messages', 'stock_data', 'watchlist', 'portfolio_snapshots', 'quizzes', 'quiz_attempts', 'units', 'unit_tests', 'unit_test_attempts')
      `);
      
      const existingTables = result.rows.map(row => row.table_name);
      console.log('📋 Existing tables in public schema:', existingTables);
      
      // If no tables found in public, check all schemas
      if (existingTables.length === 0) {
        console.log('🔍 No tables in public schema, checking all schemas...');
        const allTablesResult = await client.query(`
          SELECT table_name, table_schema
          FROM information_schema.tables 
          WHERE table_name IN ('users', 'daily_facts', 'courses', 'lessons', 'user_progress', 'fact_completions', 'lesson_completions', 'user_portfolios', 'portfolio_transactions', 'portfolio_holdings', 'chat_messages', 'stock_data', 'watchlist', 'portfolio_snapshots', 'quizzes', 'quiz_attempts', 'units', 'unit_tests', 'unit_test_attempts')
          ORDER BY table_schema, table_name
        `);
        
        if (allTablesResult.rows.length > 0) {
          console.log('📋 Found tables in other schemas:');
          allTablesResult.rows.forEach(table => {
            console.log(`   ${table.table_schema}.${table.table_name}`);
          });
          
          // Return tables from any schema
          const allTables = allTablesResult.rows.map(row => row.table_name);
          return {
            success: true,
            tables: allTables,
            hasRequiredTables: allTables.length >= 4,
            hasAllTables: allTables.length >= 16,
            schema: allTablesResult.rows[0].table_schema
          };
        }
      }
      
      return {
        success: true,
        tables: existingTables,
        hasRequiredTables: existingTables.length >= 4,
        hasAllTables: existingTables.length >= 16,
        schema: 'public'
      };
      
    } catch (error) {
      console.error('❌ Failed to check tables:', error.message);
      return { success: false, error: error.message };
    } finally {
      client.release();
    }
  }

  /**
   * Comprehensive database setup with Prisma integration
   */
  async setupDatabase() {
    console.log('🚀 Starting comprehensive database setup...');
    
    // Step 1: Test connection
    const connectionTest = await this.testConnection();
    if (!connectionTest.success) {
      return {
        success: false,
        message: 'Database connection failed',
        error: connectionTest.error,
        suggestions: this.getConnectionSuggestions(connectionTest.error)
      };
    }

    // Check if we're on Digital Ocean with permission issues
    const isDigitalOcean = process.env.DATABASE_URL?.includes('digitalocean') || 
                          process.env.NODE_ENV === 'production';
    
    if (isDigitalOcean) {
      console.log('🌊 Digital Ocean detected - checking existing tables...');
      
      // For Digital Ocean, first check if tables already exist
      const tableCheck = await this.checkTablesExist();
      if (tableCheck.success && tableCheck.hasRequiredTables) {
        console.log('✅ Required tables already exist - database is ready');
        return { success: true, message: 'Database is ready - tables already exist' };
      }
      
      // Try to test if we can create tables
      console.log('🔍 Testing table creation permissions...');
      try {
        const testClient = await this.pool.connect();
        try {
          await testClient.query(`
            CREATE TABLE IF NOT EXISTS permission_test (
              id SERIAL PRIMARY KEY,
              test_field TEXT
            )
          `);
          await testClient.query('DROP TABLE IF EXISTS permission_test');
          console.log('✅ Table creation permissions confirmed');
          
          // If we have permissions, continue with normal setup
          console.log('🔄 Proceeding with normal database setup...');
          
        } catch (permError) {
          console.log('⚠️ No table creation permissions detected');
          console.log('💡 Digital Ocean troubleshooting:');
          console.log('   1. Tables must be created manually in Digital Ocean dashboard');
          console.log('   2. Or use a database user with CREATE permissions');
          console.log('   3. Or run the create-tables-digitalocean-fixed.js script manually');
          console.log('   4. Contact Digital Ocean support for permission issues');
          
          return {
            success: false,
            message: 'Tables missing but cannot create due to Digital Ocean permissions',
            suggestions: [
              'Create tables manually in Digital Ocean dashboard',
              'Use a database user with CREATE permissions',
              'Run create-tables-digitalocean-fixed.js script manually',
              'Contact Digital Ocean support for permission issues'
            ]
          };
        } finally {
          testClient.release();
        }
      } catch (error) {
        console.warn('⚠️ Could not test permissions:', error.message);
        // Continue with normal setup attempt
      }
    }

    if (this.usePrisma) {
      console.log('🔧 Using Prisma for database setup...');
      
      try {
        // Step 2: Check if Prisma client can connect
        await this.prisma.$connect();
        console.log('✅ Prisma client connected successfully');
        
        // Step 3: Try Prisma migration
        console.log('🔄 Attempting Prisma migration...');
        try {
          execSync('npx prisma db push', { stdio: 'pipe' });
          console.log('✅ Prisma migration successful');
          
          // Step 4: Verify tables exist
          const tableCheck = await this.checkTablesExist();
          if (tableCheck.success && tableCheck.hasRequiredTables) {
            console.log('✅ Database setup completed via Prisma');
            return { success: true, message: 'Database setup completed via Prisma' };
          } else {
            console.warn('⚠️ Prisma migration completed but tables not found');
            return { success: false, message: 'Prisma migration completed but tables not accessible' };
          }
        } catch (prismaError) {
          console.warn('⚠️ Prisma migration failed:', prismaError.message);
          
          // Step 5: Try Prisma generate and migrate
          try {
            console.log('🔄 Trying Prisma generate and migrate...');
            execSync('npx prisma generate', { stdio: 'pipe' });
            execSync('npx prisma migrate deploy', { stdio: 'pipe' });
            console.log('✅ Prisma generate and migrate successful');
            return { success: true, message: 'Database setup completed via Prisma migrate' };
          } catch (migrateError) {
            console.warn('⚠️ Prisma migrate failed:', migrateError.message);
            
            // Step 6: Fallback to manual table creation
            console.log('🔄 Falling back to manual table creation...');
            const manualResult = await this.createTablesManually();
            if (manualResult.success) {
              console.log('✅ Manual table creation successful');
              return { success: true, message: 'Database setup completed manually' };
            } else {
              return {
                success: false,
                message: 'All database setup methods failed',
                error: manualResult.error
              };
            }
          }
        }
      } catch (error) {
        console.error('❌ Prisma setup failed:', error.message);
        return {
          success: false,
          message: 'Prisma setup failed',
          error: error.message
        };
      }
    } else {
      // Production mode - assume database is ready
      console.log('📋 Production mode: Assuming database is ready (tables created manually)');
      console.log('✅ Database is ready for production use');
      return { success: true, message: 'Database is ready for production' };
    }
  }

  /**
   * Get connection troubleshooting suggestions
   */
  getConnectionSuggestions(error) {
    const suggestions = [];
    
    if (error.includes('ECONNREFUSED')) {
      suggestions.push('Check if PostgreSQL is running');
      suggestions.push('Verify the host and port in DATABASE_URL');
    }
    
    if (error.includes('authentication failed')) {
      suggestions.push('Check username and password in DATABASE_URL');
      suggestions.push('Verify the user exists in PostgreSQL');
    }
    
    if (error.includes('database') && error.includes('does not exist')) {
      suggestions.push('Create the database in pgAdmin first');
      suggestions.push('Check the database name in DATABASE_URL');
    }
    
    if (error.includes('permission denied')) {
      suggestions.push('Grant proper permissions to the database user');
      suggestions.push('Try using the postgres superuser account');
    }
    
    return suggestions;
  }

  /**
   * Clean up connections
   */
  async cleanup() {
    try {
      if (this.prisma) {
        await this.prisma.$disconnect();
      }
      if (this.pool) {
        await this.pool.end();
      }
    } catch (error) {
      console.error('Error during cleanup:', error.message);
    }
  }
}

module.exports = DatabaseSetup;
