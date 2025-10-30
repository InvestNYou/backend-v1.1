const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixFactsSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing facts schema...');
    
    // Check if daily_facts table exists and its structure
    const tableCheck = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'daily_facts' 
      ORDER BY ordinal_position
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('📋 Creating daily_facts table...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS "daily_facts" (
          "id" SERIAL PRIMARY KEY,
          "title" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "category" TEXT NOT NULL,
          "xpValue" INTEGER NOT NULL DEFAULT 25,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Daily facts table created');
    } else {
      console.log('📋 Daily facts table exists, checking structure...');
      console.log('Columns:', tableCheck.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
      
      // Check if id column is VARCHAR instead of SERIAL
      const idColumn = tableCheck.rows.find(r => r.column_name === 'id');
      if (idColumn && idColumn.data_type === 'character varying') {
        console.log('⚠️  ID column is VARCHAR, needs to be SERIAL');
        console.log('💡 This requires recreating the table. Please backup data first.');
      }
    }
    
    // Check if fact_completions table exists
    const factCompletionsCheck = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'fact_completions' 
      ORDER BY ordinal_position
    `);
    
    if (factCompletionsCheck.rows.length === 0) {
      console.log('📋 Creating fact_completions table...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS "fact_completions" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "factId" INTEGER NOT NULL,
          "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Fact completions table created');
      
      // Add foreign key constraints
      await client.query(`
        ALTER TABLE "fact_completions" 
        ADD CONSTRAINT "fact_completions_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `);
      
      await client.query(`
        ALTER TABLE "fact_completions" 
        ADD CONSTRAINT "fact_completions_factId_fkey" 
        FOREIGN KEY ("factId") REFERENCES "daily_facts"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `);
      
      // Add unique constraint
      await client.query(`
        ALTER TABLE "fact_completions" 
        ADD CONSTRAINT "fact_completions_userId_factId_key" 
        UNIQUE ("userId", "factId")
      `);
      
      console.log('✅ Foreign key constraints added');
    } else {
      console.log('📋 Fact completions table exists');
    }
    
    // Check if there are any facts in the database
    const factsCount = await client.query('SELECT COUNT(*) as count FROM daily_facts');
    console.log(`📊 Found ${factsCount.rows[0].count} facts in database`);
    
    if (factsCount.rows[0].count === 0) {
      console.log('🌱 Seeding sample facts...');
      const sampleFacts = [
        {
          title: "The Power of Compound Interest",
          content: "Albert Einstein called compound interest the 'eighth wonder of the world.' When you invest money, you earn returns not just on your original investment, but also on the returns you've already earned. This creates exponential growth over time!",
          category: "Investing Basics",
          xpValue: 30
        },
        {
          title: "Emergency Fund Essentials",
          content: "Financial experts recommend having 3-6 months of living expenses saved in an emergency fund. This safety net helps you avoid debt when unexpected expenses arise, like medical bills or job loss.",
          category: "Budgeting",
          xpValue: 12
        },
        {
          title: "Diversification Strategy",
          content: "Don't put all your eggs in one basket! Diversification means spreading your investments across different asset classes, industries, and geographic regions to reduce risk and potentially increase returns.",
          category: "Investment Strategy",
          xpValue: 18
        },
        {
          title: "The 50/30/20 Rule",
          content: "A simple budgeting rule: allocate 50% of income to needs (rent, groceries), 30% to wants (entertainment, dining), and 20% to savings and debt repayment. This creates a balanced financial foundation.",
          category: "Budgeting",
          xpValue: 14
        },
        {
          title: "Time Value of Money",
          content: "Money today is worth more than the same amount in the future due to its potential earning capacity. This is why starting to invest early, even with small amounts, can lead to significant wealth over time.",
          category: "Financial Concepts",
          xpValue: 16
        }
      ];
      
      for (const fact of sampleFacts) {
        await client.query(`
          INSERT INTO daily_facts (title, content, category, "xpValue", "isActive", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [fact.title, fact.content, fact.category, fact.xpValue]);
      }
      
      console.log('✅ Sample facts seeded');
    }
    
    console.log('🎉 Facts schema fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing facts schema:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the fix
fixFactsSchema()
  .then(() => {
    console.log('✅ Schema fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Schema fix failed:', error);
    process.exit(1);
  });




