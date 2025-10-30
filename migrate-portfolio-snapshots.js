#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('🚀 Starting database migration for Portfolio Snapshots...');
    
    // Check if the migration has already been run
    const existingSnapshots = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'portfolio_snapshots'
    `;
    
    if (existingSnapshots.length > 0) {
      console.log('✅ Portfolio snapshots table already exists');
      return;
    }
    
    console.log('📊 Creating portfolio_snapshots table...');
    
    // Create the portfolio_snapshots table
    await prisma.$executeRaw`
      CREATE TABLE "portfolio_snapshots" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "date" DATE NOT NULL,
        "totalValue" DECIMAL(12,2) NOT NULL,
        "balance" DECIMAL(12,2) NOT NULL,
        "totalInvested" DECIMAL(12,2) NOT NULL,
        "totalSold" DECIMAL(12,2) NOT NULL,
        "dailyChange" DECIMAL(12,2) NOT NULL,
        "dailyChangePercent" DECIMAL(8,4) NOT NULL,
        "holdings" JSONB NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "portfolio_snapshots_pkey" PRIMARY KEY ("id")
      )
    `;
    
    console.log('🔗 Creating foreign key constraint...');
    
    // Add foreign key constraint
    await prisma.$executeRaw`
      ALTER TABLE "portfolio_snapshots" 
      ADD CONSTRAINT "portfolio_snapshots_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") 
      ON DELETE CASCADE ON UPDATE CASCADE
    `;
    
    console.log('🔑 Creating unique constraint...');
    
    // Add unique constraint for userId and date
    await prisma.$executeRaw`
      ALTER TABLE "portfolio_snapshots" 
      ADD CONSTRAINT "portfolio_snapshots_userId_date_key" 
      UNIQUE ("userId", "date")
    `;
    
    console.log('📈 Creating indexes for better performance...');
    
    // Create indexes for better query performance
    await prisma.$executeRaw`
      CREATE INDEX "portfolio_snapshots_userId_idx" ON "portfolio_snapshots"("userId")
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX "portfolio_snapshots_date_idx" ON "portfolio_snapshots"("date")
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX "portfolio_snapshots_userId_date_idx" ON "portfolio_snapshots"("userId", "date")
    `;
    
    console.log('✅ Database migration completed successfully!');
    console.log('📊 Portfolio snapshots table created with:');
    console.log('   • Foreign key to users table');
    console.log('   • Unique constraint on userId + date');
    console.log('   • Performance indexes');
    console.log('   • JSON storage for holdings data');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
