const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Disable SSL certificate verification for DigitalOcean PostgreSQL
if (process.env.DATABASE_URL?.includes('digitalocean')) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

class DatabaseService {
  constructor() {
    // Reuse a single instance across the process to avoid exhausting DB connections
    if (DatabaseService.instance) {
      this.pool = DatabaseService.instance.pool;
      this.prisma = DatabaseService.instance.prisma;
      this.pgPool = DatabaseService.instance.pgPool;
      this.usePrisma = DatabaseService.instance.usePrisma;
      return;
    }

    this.pool = null;
    this.prisma = null;
    this.pgPool = null; // Separate pool for Prisma mode with parameterized queries
    // Default to Prisma unless explicitly disabled
    this.usePrisma = process.env.USE_PRISMA !== 'false';
    
    if (this.usePrisma) {
      // Digital Ocean specific Prisma configuration
      const prismaConfig = {
        log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
        datasources: {
          db: {
            url: process.env.DATABASE_URL
          }
        }
      };

      // Add connection pooling for Digital Ocean with conservative limits
      if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('digitalocean')) {
        // Reduce Prisma connection limit to avoid slot exhaustion on small DO plans
        prismaConfig.datasources.db.url = process.env.DATABASE_URL + '?connection_limit=2&pool_timeout=20';
      }

      this.prisma = new PrismaClient(prismaConfig);
      
      // Create a pg Pool for parameterized queries when using Prisma
      this.pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL?.includes('digitalocean') ? {
          rejectUnauthorized: false,
          checkServerIdentity: () => undefined,
          requestCert: false,
          agent: false,
          // Additional SSL options for DigitalOcean
          ca: undefined,
          cert: undefined,
          key: undefined
        } : {
          rejectUnauthorized: false
        },
        // Keep this small since Prisma also holds connections
        max: process.env.NODE_ENV === 'production' ? 2 : 3,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 20000
      });
    } else {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL?.includes('digitalocean') ? {
          rejectUnauthorized: false,
          checkServerIdentity: () => undefined,
          requestCert: false,
          agent: false,
          // Additional SSL options for DigitalOcean
          ca: undefined,
          cert: undefined,
          key: undefined
        } : {
          rejectUnauthorized: false
        },
        max: process.env.NODE_ENV === 'production' ? 5 : 10
      });
    }

    DatabaseService.instance = this;
  }

  async query(sql, params = []) {
    if (this.usePrisma) {
      // For Prisma, PostgreSQL parameterized queries ($1, $2) don't work with $queryRawUnsafe
      // So we'll use the pg Pool connection for parameterized queries
      if (!this.pgPool) {
        throw new Error('pgPool not initialized. Database service may not be properly configured.');
      }
      try {
        const client = await this.pgPool.connect();
        try {
          await client.query('SET search_path TO public, "$user"');
          const result = await client.query(sql, params);
          return result.rows;
        } finally {
          client.release();
        }
      } catch (error) {
        console.error('Database query error (Prisma mode):', error);
        console.error('SQL:', sql);
        console.error('Params:', params);
        throw error;
      }
    } else {
      // Use raw SQL for production with schema handling
      const client = await this.pool.connect();
      try {
        // Set search path to include public schema
        await client.query('SET search_path TO public, "$user"');
        
        const result = await client.query(sql, params);
        return result.rows;
      } catch (error) {
        console.error('Database query error:', error.message);
        console.error('SQL:', sql);
        console.error('Params:', params);
        throw error;
      } finally {
        client.release();
      }
    }
  }

  // Prisma-specific methods for better type safety and performance
  async findUser(email) {
    if (this.usePrisma) {
      return await this.prisma.user.findUnique({
        where: { email },
        include: {
          progress: true,
          portfolio: true
        }
      });
    } else {
      const result = await this.query('SELECT * FROM users WHERE email = $1', [email]);
      return result[0] || null;
    }
  }

  async createUser(userData) {
    if (this.usePrisma) {
      return await this.prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          ageRange: userData.ageRange,
          financialGoal: userData.financialGoal,
          learningMode: userData.learningMode || 'facts'
        }
      });
    } else {
      const { name, email, password, ageRange, financialGoal, learningMode } = userData;
      const now = new Date().toISOString();
      const result = await this.query(
        'INSERT INTO users (id, name, email, password, "ageRange", "financialGoal", "learningMode", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [this.generateId(), name, email, password, ageRange, financialGoal, learningMode, now, now]
      );
      return result[0];
    }
  }

  async findUserProgress(userId) {
    if (this.usePrisma) {
      return await this.prisma.userProgress.findUnique({
        where: { userId }
      });
    } else {
      const result = await this.query('SELECT * FROM user_progress WHERE "userId" = $1', [userId]);
      return result[0] || null;
    }
  }

  async createUserProgress(userId) {
    if (this.usePrisma) {
      return await this.prisma.userProgress.create({
        data: {
          userId,
          level: 1,
          xp: 0,
          streak: 0,
          badges: [],
          completedFacts: [],
          completedLessons: []
        }
      });
    } else {
      const result = await this.query(
        'INSERT INTO user_progress (id, "userId", level, xp, streak, badges, "completedFacts", "completedLessons", "createdAt", "updatedAt") VALUES ($1, $2, 1, 0, 0, $3::jsonb, $4::jsonb, $5::jsonb, $6, $7) RETURNING *',
        [this.generateId(), userId, '[]', '[]', '[]', new Date().toISOString(), new Date().toISOString()]
      );
      return result[0];
    }
  }

  async findUserById(id) {
    if (this.usePrisma) {
      return await this.prisma.user.findUnique({
        where: { id },
        include: {
          progress: true,
          portfolio: true,
          transactions: true,
          chatMessages: true,
          factCompletions: true,
          lessonCompletions: true,
          quizAttempts: true,
          unitTestAttempts: true,
          watchlist: true,
          snapshots: true
        }
      });
    } else {
      const result = await this.query('SELECT * FROM users WHERE id = $1', [id]);
      return result[0] || null;
    }
  }

  async updateUserProgress(userId, progressData) {
    if (this.usePrisma) {
      return await this.prisma.userProgress.upsert({
        where: { userId },
        update: progressData,
        create: {
          userId,
          level: 1,
          xp: 0,
          streak: 0,
          badges: [],
          completedFacts: [],
          completedLessons: [],
          ...progressData
        }
      });
    } else {
      const fields = Object.keys(progressData).map((key, index) => `"${key}" = $${index + 2}`).join(', ');
      const values = [userId, ...Object.values(progressData)];
      const result = await this.query(
        `UPDATE user_progress SET ${fields} WHERE "userId" = $1 RETURNING *`,
        values
      );
      return result[0];
    }
  }

  async getDailyFacts(limit = 10) {
    if (this.usePrisma) {
      return await this.prisma.dailyFact.findMany({
        where: { isActive: true },
        take: limit,
        orderBy: { createdAt: 'desc' }
      });
    } else {
      return await this.query('SELECT * FROM daily_facts WHERE "isActive" = true ORDER BY "createdAt" DESC LIMIT $1', [limit]);
    }
  }

  async createFactCompletion(userId, factId) {
    if (this.usePrisma) {
      return await this.prisma.factCompletion.create({
        data: {
          userId,
          factId
        }
      });
    } else {
      const result = await this.query(
        'INSERT INTO fact_completions (id, "userId", "factId", "completedAt") VALUES ($1, $2, $3, $4) RETURNING *',
        [this.generateId(), userId, factId, new Date().toISOString()]
      );
      return result[0];
    }
  }

  async getUserPortfolio(userId) {
    if (this.usePrisma) {
      return await this.prisma.userPortfolio.findUnique({
        where: { userId },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    } else {
      const result = await this.query('SELECT * FROM user_portfolios WHERE "userId" = $1', [userId]);
      return result[0] || null;
    }
  }

  async createUserPortfolio(userId) {
    if (this.usePrisma) {
      return await this.prisma.userPortfolio.create({
        data: {
          userId,
          balance: 10000.00,
          totalValue: 10000.00
        }
      });
    } else {
      const result = await this.query(
        'INSERT INTO user_portfolios (id, "userId", balance, "totalValue", "createdAt", "updatedAt") VALUES ($1, $2, 10000.00, 10000.00, $3, $4) RETURNING *',
        [this.generateId(), userId, new Date().toISOString(), new Date().toISOString()]
      );
      return result[0];
    }
  }

  async createPortfolioTransaction(transactionData) {
    if (this.usePrisma) {
      return await this.prisma.portfolioTransaction.create({
        data: transactionData
      });
    } else {
      const { userId, symbol, shares, price, total, type } = transactionData;
      const result = await this.query(
        'INSERT INTO portfolio_transactions (id, "userId", symbol, shares, price, total, type, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [this.generateId(), userId, symbol, shares, price, total, type, new Date().toISOString()]
      );
      return result[0];
    }
  }

  async createChatMessage(messageData) {
    if (this.usePrisma) {
      return await this.prisma.chatMessage.create({
        data: messageData
      });
    } else {
      const { userId, prompt, response, model, tokensUsed, responseTime } = messageData;
      const result = await this.query(
        'INSERT INTO chat_messages (id, "userId", prompt, response, model, "tokensUsed", "responseTime", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [this.generateId(), userId, prompt, response, model, tokensUsed, responseTime, new Date().toISOString(), new Date().toISOString()]
      );
      return result[0];
    }
  }

  async getChatMessages(userId, limit = 50) {
    if (this.usePrisma) {
      return await this.prisma.chatMessage.findMany({
        where: { userId },
        take: limit,
        orderBy: { createdAt: 'desc' }
      });
    } else {
      return await this.query('SELECT * FROM chat_messages WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT $2', [userId, limit]);
    }
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  async cleanup() {
    try {
      if (this.prisma) {
        await this.prisma.$disconnect();
      }
      if (this.pool) {
        await this.pool.end();
      }
      if (this.pgPool) {
        await this.pgPool.end();
      }
    } catch (error) {
      console.error('Error during database cleanup:', error.message);
    }
  }
}

module.exports = DatabaseService;
