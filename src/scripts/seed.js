const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Seed daily facts
  const dailyFacts = [
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
    },
    {
      title: "Credit Score Fundamentals",
      content: "Your credit score (300-850) affects loan rates, insurance premiums, and even job opportunities. Pay bills on time, keep credit utilization below 30%, and maintain a long credit history to build a strong score.",
      category: "Credit & Debt",
      xpValue: 13
    },
    {
      title: "The Rule of 72",
      content: "Divide 72 by your annual interest rate to estimate how long it takes to double your money. At 6% interest, your money doubles in about 12 years. This simple rule helps you understand the power of compound growth!",
      category: "Investment Math",
      xpValue: 17
    },
    {
      title: "Tax-Advantaged Accounts",
      content: "401(k)s, IRAs, and HSAs offer tax benefits that can significantly boost your wealth. Traditional accounts reduce taxes now, while Roth accounts provide tax-free growth for retirement. Maximize these opportunities!",
      category: "Retirement Planning",
      xpValue: 19
    },
    {
      title: "Asset Allocation by Age",
      content: "A common rule: subtract your age from 110 to determine your stock allocation percentage. A 30-year-old might hold 80% stocks, while a 60-year-old might hold 50% stocks, with the rest in bonds for stability.",
      category: "Investment Strategy",
      xpValue: 16
    },
    {
      title: "The Latte Factor",
      content: "Small daily expenses add up! A $5 daily coffee costs $1,825 per year. Invested at 7% annual return, that's over $200,000 in 30 years. Track your spending to identify opportunities to save and invest more.",
      category: "Spending Habits",
      xpValue: 14
    },
    {
      title: "Inflation Impact",
      content: "Inflation erodes purchasing power over time. At 3% annual inflation, $100 today will only buy $74 worth of goods in 10 years. This is why investing in assets that outpace inflation is crucial for long-term wealth.",
      category: "Economic Concepts",
      xpValue: 15
    },
    {
      title: "Dollar-Cost Averaging",
      content: "Investing a fixed amount regularly (like monthly) regardless of market conditions reduces the impact of volatility. You buy more shares when prices are low and fewer when prices are high, smoothing out your average cost.",
      category: "Investment Strategy",
      xpValue: 18
    },
    {
      title: "The 4% Withdrawal Rule",
      content: "In retirement, withdrawing 4% of your portfolio annually (adjusted for inflation) has historically provided income for 30+ years. A $1 million portfolio could provide $40,000 annually using this rule.",
      category: "Retirement Planning",
      xpValue: 20
    },
    {
      title: "High-Yield Savings vs CDs",
      content: "High-yield savings accounts offer flexibility with competitive rates, while CDs lock in rates for specific terms. Use savings for emergency funds and short-term goals, CDs for guaranteed returns on money you won't need soon.",
      category: "Banking & Savings",
      xpValue: 12
    },
    {
      title: "Index Fund Advantages",
      content: "Index funds track market indices (like S&P 500) with low fees and broad diversification. They often outperform actively managed funds over time while providing exposure to hundreds or thousands of companies.",
      category: "Investment Vehicles",
      xpValue: 17
    },
    {
      title: "Debt Snowball vs Avalanche",
      content: "Debt snowball: pay minimums on all debts, then extra on the smallest balance first. Debt avalanche: pay extra on the highest interest rate debt first. Both work - choose the method that motivates you most!",
      category: "Debt Management",
      xpValue: 16
    },
    {
      title: "Real Estate Investment Basics",
      content: "Real estate can provide rental income, tax benefits, and appreciation. Consider REITs (Real Estate Investment Trusts) for easier entry, or direct ownership for more control. Location and cash flow are key factors.",
      category: "Alternative Investments",
      xpValue: 19
    },
    {
      title: "The FIRE Movement",
      content: "Financial Independence, Retire Early (FIRE) involves extreme saving (50-70% of income) to retire decades early. The math: save 25x your annual expenses. While extreme, the principles of high savings rates benefit everyone.",
      category: "Financial Independence",
      xpValue: 21
    },
    {
      title: "Behavioral Finance Insights",
      content: "Emotions drive financial decisions. Fear causes panic selling, greed leads to FOMO buying. Create rules-based investing strategies and stick to them. The best investment plan is one you can follow consistently.",
      category: "Psychology of Money",
      xpValue: 18
    },
    {
      title: "Cryptocurrency Considerations",
      content: "Crypto is highly volatile and speculative. If you invest, treat it as a small portion of your portfolio (5-10% max) and only with money you can afford to lose. Never invest more than you can afford to lose completely.",
      category: "Alternative Investments",
      xpValue: 16
    }
  ];

  console.log('📚 Seeding daily facts...');
  for (const fact of dailyFacts) {
    await prisma.dailyFact.upsert({
      where: { id: fact.id || 0 },
      update: fact,
      create: fact
    });
  }

  // Seed courses
  const courses = [
    {
      title: "Investing 101",
      description: "Learn the basics of investing and building wealth",
      lessonsCount: 5,
      thumbnail: "📈",
      color: "blue",
      isLocked: false,
      order: 1
    },
    {
      title: "Budgeting & Taxes",
      description: "Master budgeting and understand tax basics",
      lessonsCount: 4,
      thumbnail: "💰",
      color: "green",
      isLocked: false,
      order: 2
    },
    {
      title: "Retirement Basics",
      description: "Plan for your future with retirement accounts",
      lessonsCount: 3,
      thumbnail: "🏖️",
      color: "purple",
      isLocked: false,
      order: 3
    },
    {
      title: "Insurance Essentials",
      description: "Protect yourself with the right insurance",
      lessonsCount: 3,
      thumbnail: "🛡️",
      color: "orange",
      isLocked: true,
      order: 4
    },
    {
      title: "AP Microeconomics",
      description: "Master microeconomic principles and analysis",
      lessonsCount: 30,
      thumbnail: "📊",
      color: "indigo",
      isLocked: false,
      order: 5
    }
  ];

  // Seed units for AP Microeconomics
  const apMicroUnits = [
    {
      title: "Unit 1: Basic Economic Concepts",
      description: "Foundation concepts of economics including scarcity, opportunity cost, and economic systems",
      order: 1
    },
    {
      title: "Unit 2: Supply and Demand",
      description: "Understanding market forces, equilibrium, and price controls",
      order: 2
    },
    {
      title: "Unit 3: Production, Cost, and Perfect Competition",
      description: "Production decisions, cost analysis, and competitive markets",
      order: 3
    },
    {
      title: "Unit 4: Imperfect Competition",
      description: "Monopoly, monopolistic competition, and oligopoly markets",
      order: 4
    },
    {
      title: "Unit 5: Factor Markets",
      description: "Labor and capital markets, wage determination, and interest rates",
      order: 5
    },
    {
      title: "Unit 6: Market Failure and Government Role",
      description: "Externalities, public goods, and government intervention",
      order: 6
    }
  ];

  console.log('🎓 Seeding courses...');
  for (const course of courses) {
    const createdCourse = await prisma.course.upsert({
      where: { title: course.title },
      update: course,
      create: course
    });

    // Create units for this course first
    console.log(`📖 Creating units for course: ${course.title}`);
    const units = course.title === "AP Microeconomics" ? apMicroUnits : [];
    
    for (const unit of units) {
      const createdUnit = await prisma.unit.upsert({
        where: { 
          courseId_title: {
            courseId: createdCourse.id,
            title: unit.title
          }
        },
        update: unit,
        create: {
          ...unit,
          courseId: createdCourse.id
        }
      });

      // Create lessons for this unit
      const lessons = generateLessonsForUnit(unit.title, course.title);
      for (const lesson of lessons) {
        const lessonData = { 
          ...lesson, 
          unitId: createdUnit.id 
        };
        
        // Try to find existing lesson by title and unitId
        const existingLesson = await prisma.lesson.findFirst({
          where: {
            title: lesson.title,
            unitId: createdUnit.id
          }
        });
        
        if (existingLesson) {
          // Update existing lesson
          await prisma.lesson.update({
            where: { id: existingLesson.id },
            data: lessonData
          });
          console.log(`📚 Updated lesson: ${lessonData.title}`);
        } else {
          // Create new lesson
          const createdLesson = await prisma.lesson.create({
            data: lessonData
          });
          console.log(`📚 Created lesson: ${lessonData.title}`);
          
          // Create quiz for new lesson
          let quizData = generateQuizzesForLesson(createdLesson.id, lessonData.title);
          
          // If no specific template exists, use default template
          if (!quizData) {
            quizData = generateDefaultQuiz(createdLesson.id, lessonData.title);
          }
          
          if (quizData) {
            await prisma.quiz.create({
              data: {
                lessonId: createdLesson.id,
                title: quizData.title,
                description: quizData.description,
                type: quizData.type,
                questions: quizData.questions,
                timeLimit: 10,
                passingScore: 70,
                xpValue: 25,
                isActive: true
              }
            });
            console.log(`📝 Created quiz for lesson: ${lessonData.title}`);
          }
        }
      }
    }

    // Update course lesson count
    const lessonCount = await prisma.lesson.count({
      where: { 
        unit: {
          courseId: createdCourse.id
        }
      }
    });

    await prisma.course.update({
      where: { id: createdCourse.id },
      data: { lessonsCount: lessonCount }
    });
    
    // Create unit test for this course
    const unitTestData = generateUnitTestsForCourse(createdCourse.id, course.title);
    if (unitTestData) {
      // Check if unit test already exists
      const existingUnitTest = await prisma.unitTest.findFirst({
        where: { courseId: createdCourse.id }
      });
      
      if (!existingUnitTest) {
        await prisma.unitTest.create({
          data: {
            courseId: createdCourse.id,
            title: unitTestData.title,
            description: unitTestData.description,
            questions: unitTestData.questions,
            timeLimit: 30, // 30 minutes
            passingScore: 80,
            xpValue: 100,
            isActive: true,
            order: 1
          }
        });
        console.log(`📋 Created unit test for course: ${course.title}`);
      }
    }
  }



  console.log('✅ Database seeding completed!');
}

function generateLessonsForCourse(courseId, courseTitle) {
  const lessonTemplates = {
    "Investing 101": [
      {
        title: "What is Investing?",
        content: `# What is Investing?

Investing is putting your money to work to earn more money over time. Instead of just saving money in a bank account, you're buying assets that can grow in value.

## Why Invest?

- Beat Inflation: Your money loses value over time due to inflation. Investing helps it grow faster than prices rise.
- Build Wealth: Over time, compound returns can turn small amounts into significant wealth.
- Reach Goals: Whether it's retirement, a house, or education, investing helps you reach financial goals.

## Key Concepts

### Assets vs Liabilities
- Assets: Things that put money in your pocket (stocks, bonds, real estate)
- Liabilities: Things that take money out of your pocket (credit card debt, car loans)

### Time Value of Money
Money today is worth more than the same amount in the future because it can earn returns. This is why starting early is so powerful!

## The Power of Compound Interest
Albert Einstein called compound interest "the eighth wonder of the world." Here's why:

- Year 1: $1,000 invested at 7% = $1,070
- Year 10: $1,000 becomes $1,967
- Year 30: $1,000 becomes $7,612

The longer you invest, the more powerful compound interest becomes!`,
        order: 1,
        xpValue: 25
      },
      {
        title: "Stocks vs Bonds",
        content: `# Stocks vs Bonds: Understanding the Basics

## What are Stocks?

Stocks represent ownership shares in a company. When you buy a stock, you become a partial owner of that company.

### How Stocks Work
- Share Price: The current market value of one share
- Dividends: Some companies pay shareholders a portion of profits
- Capital Gains: Profit when you sell shares for more than you paid

### Types of Stocks
- Common Stock: Voting rights, potential dividends
- Preferred Stock: Fixed dividends, no voting rights
- Growth Stocks: Companies expected to grow rapidly
- Value Stocks: Undervalued companies with potential

## What are Bonds?

Bonds are loans you make to companies or governments. You're essentially lending money and earning interest.

### How Bonds Work
- Face Value: The amount you'll receive when the bond matures
- Coupon Rate: The interest rate the bond pays
- Maturity Date: When the bond issuer pays back the principal

### Types of Bonds
- Government Bonds: Backed by the government (safest)
- Corporate Bonds: Issued by companies (higher risk/reward)
- Municipal Bonds: Issued by local governments (tax advantages)

## Key Differences

| Feature | Stocks | Bonds |
|---------|--------|-------|
| Risk Level | Higher | Lower |
| Potential Return | Higher | Lower |
| Volatility | More volatile | More stable |
| Income | Dividends (optional) | Fixed interest |
| Ownership | Partial ownership | Creditor relationship |

## Which Should You Choose?

- Young Investors: More stocks for long-term growth
- Near Retirement: More bonds for stability
- Balanced Approach: Mix of both based on your risk tolerance`,
        order: 2,
        xpValue: 25
      },
      {
        title: "Risk and Return",
        content: `# Risk and Return: The Fundamental Trade-off

## Understanding Risk

Risk in investing refers to the possibility of losing money or not achieving expected returns.

### Types of Investment Risk

#### 1. Market Risk
- Definition: Risk that the entire market will decline
- Example: 2008 financial crisis affected most investments
- Mitigation: Diversification across different asset classes

#### 2. Company-Specific Risk
- Definition: Risk that a specific company will perform poorly
- Example: A company's stock drops due to bad earnings
- Mitigation: Diversify across many companies

#### 3. Interest Rate Risk
- Definition: Risk that rising interest rates will hurt bond prices
- Example: When rates rise, existing bonds become less valuable
- Mitigation: Shorter-term bonds or floating-rate bonds

#### 4. Inflation Risk
- Definition: Risk that inflation will erode purchasing power
- Example: 3% inflation means your money buys 3% less each year
- Mitigation: Invest in assets that typically outpace inflation

## Understanding Return

Return is the profit or loss you make on an investment, usually expressed as a percentage.

### Types of Returns

#### 1. Capital Gains
- Definition: Profit from selling an investment for more than you paid
- Example: Buy stock at $100, sell at $120 = 20% capital gain

#### 2. Dividends/Interest
- Definition: Regular payments from investments
- Example: Stock pays $2 dividend per year on $100 investment = 2% yield

#### 3. Total Return
- Definition: Capital gains + dividends/interest
- Example: 20% capital gain + 2% dividend = 22% total return

## The Risk-Return Relationship

Generally, higher potential returns come with higher risk. Here's the typical hierarchy:

### Low Risk, Low Return
- Savings Accounts: ~0.5-2% annually
- Government Bonds: ~2-4% annually
- High-Quality Corporate Bonds: ~3-5% annually

### Medium Risk, Medium Return
- Blue-Chip Stocks: ~7-10% annually (long-term average)
- REITs: ~8-12% annually
- Balanced Mutual Funds: ~6-9% annually

### High Risk, High Return
- Small-Cap Stocks: ~10-15% annually (with high volatility)
- Emerging Market Stocks: ~8-15% annually
- Cryptocurrency: Highly volatile, unpredictable returns

## Assessing Your Risk Tolerance

### Questions to Ask Yourself:
1. Time Horizon: How long can you invest?
2. Financial Situation: Can you afford to lose money?
3. Emotional Comfort: How will you feel during market downturns?
4. Goals: What are you investing for?

### Risk Tolerance Levels

#### Conservative
- Profile: Prefer safety over growth
- Allocation: 70% bonds, 30% stocks
- Timeframe: Short to medium term

#### Moderate
- Profile: Balance of safety and growth
- Allocation: 50% bonds, 50% stocks
- Timeframe: Medium to long term

#### Aggressive
- Profile: Willing to take risks for higher returns
- Allocation: 20% bonds, 80% stocks
- Timeframe: Long term (10+ years)

## Managing Risk

### 1. Diversification
Don't put all your eggs in one basket. Spread investments across:
- Different companies
- Different industries
- Different countries
- Different asset classes

### 2. Dollar-Cost Averaging
Invest the same amount regularly, regardless of market conditions. This helps smooth out market volatility.

### 3. Asset Allocation
Divide your investments among different asset classes based on your risk tolerance and time horizon.

### 4. Rebalancing
Periodically adjust your portfolio to maintain your desired asset allocation.

## Remember: Risk is Personal

Your risk tolerance should match your:
- Age: Younger investors can typically take more risk
- Income: Stable income allows for more risk
- Goals: Retirement goals may require different risk levels than short-term goals
- Personality: Some people are naturally more risk-averse than others

The key is finding the right balance between risk and return that lets you sleep well at night while working toward your financial goals.`,
        order: 3,
        xpValue: 25
      },
      {
        title: "Diversification",
        content: `# Diversification: Don't Put All Your Eggs in One Basket

## What is Diversification?

Diversification is the practice of spreading your investments across different assets to reduce risk. The idea is that if one investment performs poorly, others may perform well, helping to balance your overall portfolio.

## Why Diversify?

### The Problem with Concentration
- Single Stock Risk: If you own only one stock and it crashes, you lose everything
- Sector Risk: If you only invest in tech stocks and tech crashes, you're in trouble
- Geographic Risk: If you only invest in your home country and it has economic problems, your portfolio suffers

### The Benefits of Diversification
- Reduces Risk: Spreads risk across many investments
- Smooths Returns: Reduces the impact of any single investment's poor performance
- Captures Growth: Allows you to benefit from different sectors and regions
- Peace of Mind: Less stress when individual investments fluctuate

## Types of Diversification

### 1. Asset Class Diversification
Spread your money across different types of investments:

#### Stocks (Equities)
- Large-Cap: Well-established companies (Apple, Microsoft)
- Mid-Cap: Medium-sized companies
- Small-Cap: Smaller, growth-oriented companies
- International: Companies outside your home country
- Emerging Markets: Developing countries

#### Bonds (Fixed Income)
- Government Bonds: Backed by governments (safest)
- Corporate Bonds: Issued by companies
- Municipal Bonds: Local government bonds (tax advantages)
- International Bonds: Bonds from other countries

#### Alternative Investments
- Real Estate: REITs or direct property ownership
- Commodities: Gold, oil, agricultural products
- Cash Equivalents: Money market funds, CDs

### 2. Geographic Diversification
Invest in different countries and regions:

#### Domestic (Your Home Country)
- Advantages: Familiar companies, no currency risk
- Disadvantages: Limited growth opportunities

#### International Developed Markets
- Examples: Europe, Japan, Australia
- Advantages: Mature markets, stable economies
- Disadvantages: Slower growth potential

#### Emerging Markets
- Examples: China, India, Brazil
- Advantages: Higher growth potential
- Disadvantages: Higher risk and volatility

### 3. Sector Diversification
Invest across different industries:

#### Defensive Sectors
- Healthcare: Essential services, stable demand
- Utilities: Regulated, consistent dividends
- Consumer Staples: Food, household products

#### Cyclical Sectors
- Technology: Growth potential, higher volatility
- Financials: Banks, insurance companies
- Industrials: Manufacturing, infrastructure

#### Growth Sectors
- Technology: Innovation and disruption
- Biotechnology: Medical advances
- Clean Energy: Environmental solutions

## How to Diversify

### 1. The 60/40 Rule (Traditional)
- 60% Stocks: For growth potential
- 40% Bonds: For stability and income
- Adjust based on age: Younger = more stocks, older = more bonds

### 2. Age-Based Allocation
- Rule of Thumb: 100 - your age = % in stocks
- Example: 30 years old = 70% stocks, 30% bonds
- Example: 60 years old = 40% stocks, 60% bonds

### 3. Target-Date Funds
- Automatic: Fund managers adjust allocation over time
- Convenient: One fund handles diversification
- Age-Appropriate: Automatically becomes more conservative as you approach retirement

## Diversification Strategies

### 1. Index Funds and ETFs
- Low Cost: Minimal fees
- Broad Exposure: Automatically diversified
- Examples: S&P 500 index fund, Total Stock Market ETF

### 2. Mutual Funds
- Professional Management: Experts choose investments
- Diversification: Built-in diversification
- Active Management: Fund managers try to beat the market

### 3. Individual Stock Selection
- More Control: Choose specific companies
- Higher Risk: Requires more research and monitoring
- Potential Rewards: Can outperform the market

## Common Diversification Mistakes

### 1. Over-Diversification
- Problem: Too many investments to track effectively
- Solution: Focus on 20-30 well-chosen investments

### 2. Under-Diversification
- Problem: Too much money in too few investments
- Solution: Spread risk across more assets

### 3. Correlation Confusion
- Problem: Thinking similar investments provide diversification
- Example: Owning 10 different tech stocks isn't true diversification
- Solution: Choose investments that don't move together

### 4. Home Bias
- Problem: Investing only in your home country
- Solution: Include international investments

## Monitoring and Rebalancing

### Regular Review
- Quarterly: Check your portfolio allocation
- Annually: Rebalance if needed
- Life Changes: Adjust when your situation changes

### Rebalancing Methods
- Threshold-Based: Rebalance when allocation drifts 5% from target
- Time-Based: Rebalance quarterly or annually
- Hybrid: Combine both approaches

## The Limits of Diversification

### What Diversification Can't Do
- Eliminate All Risk: Market-wide crashes affect everything
- Guarantee Returns: No investment strategy is foolproof
- Beat the Market: Diversification often means average returns

### What Diversification Can Do
- Reduce Risk: Lower the impact of individual investment losses
- Smooth Returns: Less dramatic ups and downs
- Improve Risk-Adjusted Returns: Better returns for the risk taken

## Practical Diversification Example

### Conservative Portfolio (30 years old)
- 40% Large-Cap Stocks: S&P 500 index fund
- 20% International Stocks: International index fund
- 30% Bonds: Total bond market fund
- 10% Cash: Emergency fund

### Aggressive Portfolio (25 years old)
- 50% Large-Cap Stocks: S&P 500 index fund
- 20% Small-Cap Stocks: Small-cap index fund
- 20% International Stocks: International index fund
- 10% Bonds: Total bond market fund

## Key Takeaways

1. Diversification reduces risk without necessarily reducing returns
2. Spread investments across different asset classes, sectors, and regions
3. Regular rebalancing maintains your desired allocation
4. Start simple with index funds, then add complexity as you learn
5. Consider your risk tolerance and time horizon when diversifying

Remember: Diversification is about managing risk, not eliminating it. The goal is to create a portfolio that can weather market storms while still providing the growth you need to reach your financial goals.`,
        order: 4,
        xpValue: 25
      },
      {
        title: "Getting Started",
        content: `# Getting Started with Investing

## Your First Investment Strategy

Starting your investment journey can feel overwhelming, but it doesn't have to be. Here's a step-by-step approach to get you started on the right foot.

### 1. Start with Index Funds

Index funds are perfect for beginners because they:
• Automatically diversify your money across many companies
• Have low fees (typically 0.1-0.5% annually)
• Require minimal knowledge to get started
• Perform well over the long term

### 2. The Power of Small Amounts

You don't need thousands of dollars to start investing. Even $25/month can make a significant difference over time:

• $25/month for 30 years at 7% annual return = $30,000
• $100/month for 30 years at 7% annual return = $120,000
• $500/month for 30 years at 7% annual return = $600,000

### 3. Choose Your Investment Account

#### For Retirement:
• 401(k): If your employer offers one, especially with matching
• IRA: Individual Retirement Account (Traditional or Roth)

#### For General Investing:
• Taxable Brokerage Account: For any investment goals
• High-Yield Savings: For emergency fund (3-6 months expenses)

### 4. Popular Beginner Index Funds

#### Total Stock Market Index Funds:
• VTSAX (Vanguard Total Stock Market)
• SWTSX (Schwab Total Stock Market)
• FZROX (Fidelity Zero Total Market)

#### S&P 500 Index Funds:
• VFIAX (Vanguard S&P 500)
• SWPPX (Schwab S&P 500)
• FXAIX (Fidelity 500 Index)

### 5. Dollar-Cost Averaging

Dollar-cost averaging means investing the same amount regularly, regardless of market conditions. This strategy:
• Reduces risk by spreading purchases over time
• Eliminates timing the market
• Builds discipline and consistency
• Smooths out market volatility

### 6. Setting Up Automatic Investing

Most brokerages offer automatic investing:
1. Set up automatic transfers from your bank account
2. Choose your investment amount (start small)
3. Select your target date (weekly, monthly, etc.)
4. Let it run and check periodically

### 7. Common Beginner Mistakes to Avoid

#### ❌ Don't Do This:
- Trying to time the market - Nobody can predict short-term movements
- Investing money you need soon - Keep emergency fund separate
- Following hot tips - Stick to your plan
- Checking daily - Long-term investing requires patience
- Panic selling - Market downturns are normal

#### ✅ Do This Instead:
- Invest regularly regardless of market conditions
- Keep 3-6 months expenses in emergency fund
- Focus on low-cost index funds
- Check quarterly or annually
- Stay the course during market volatility

### 8. Building Your Investment Plan

#### Step 1: Determine Your Goals
- Retirement: How much do you need and when?
- House: Down payment target and timeline?
- Education: College savings for kids?
- Emergency: 3-6 months of expenses?

#### Step 2: Calculate Your Timeline
- Short-term (1-3 years): High-yield savings, CDs
- Medium-term (3-10 years): Mix of stocks and bonds
- Long-term (10+ years): Primarily stocks/index funds

#### Step 3: Choose Your Asset Allocation
- Age-based rule: 100 - your age = % in stocks
- Conservative: 60% bonds, 40% stocks
- Moderate: 50% bonds, 50% stocks
- Aggressive: 20% bonds, 80% stocks

### 9. Monitoring Your Progress

#### What to Track:
- Monthly contributions - Are you staying consistent?
- Account balance - Is it growing over time?
- Asset allocation - Does it match your target?
- Fees - Are you keeping costs low?

#### What NOT to Track:
- Daily fluctuations - Short-term noise
- Individual stock performance - Focus on overall portfolio
- Market predictions - Stick to your plan
- Other people's returns - Everyone's situation is different

### 10. When to Rebalance

Rebalancing means adjusting your portfolio to maintain your target allocation:

#### When to Rebalance:
- Annually - Set a calendar reminder
- When allocation drifts 5% from target
- After major life changes - Marriage, kids, job change

#### How to Rebalance:
1. Calculate current allocation
2. Compare to target allocation
3. Sell overweight assets
4. Buy underweight assets
5. Use new contributions to rebalance

### 11. Tax Considerations

#### Tax-Advantaged Accounts:
- 401(k): Pre-tax contributions, tax-deferred growth
- Traditional IRA: Pre-tax contributions, tax-deferred growth
- Roth IRA: After-tax contributions, tax-free growth
- Roth 401(k): After-tax contributions, tax-free growth

#### Taxable Accounts:
- Capital gains tax on profits when you sell
- Dividend tax on distributions
- Tax-loss harvesting opportunities

### 12. Getting Help When You Need It

#### DIY Approach:
- Books: "The Bogleheads' Guide to Investing"
- Websites: Bogleheads.org, Investopedia.com
- Podcasts: "The Money Guy Show", "ChooseFI"
- YouTube: Ben Felix, Two Cents

#### Professional Help:
- Fee-only financial advisors (fiduciary duty)
- Robo-advisors (Betterment, Wealthfront)
- Target-date funds (automatic rebalancing)

### 13. Your Next Steps

1. Open an investment account with a reputable broker
2. Start with $25-100/month in a total stock market index fund
3. Set up automatic investing for consistency
4. Read one investing book per quarter
5. Join online communities for support and learning
6. Review and adjust your plan annually

### 14. Remember: Time is Your Greatest Asset

The earlier you start, the more time your money has to grow. Even small amounts invested regularly can become substantial wealth over decades. The key is to start now, stay consistent, and let compound interest work its magic.

Start today, even if it's just $25. Your future self will thank you!`,
        order: 5,
        xpValue: 25
      },
      {
        title: "Building Your Portfolio",
        content: `# Building Your Investment Portfolio

## Creating a Balanced Investment Strategy

A well-constructed portfolio is the foundation of successful long-term investing. This lesson will guide you through building a diversified portfolio that matches your risk tolerance and financial goals.

### 1. Understanding Portfolio Construction

#### What is a Portfolio?
A portfolio is your collection of investments working together to achieve your financial goals. Think of it as a team where each investment plays a specific role.

#### Key Principles:
- Diversification: Don't put all your eggs in one basket
- Asset Allocation: Mix of stocks, bonds, and other investments
- Risk Management: Balance risk with potential returns
- Cost Control: Keep fees low to maximize returns

### 2. Asset Classes Explained

#### Stocks (Equities)
- What they are: Ownership shares in companies
- Risk level: Higher risk, higher potential return
- Time horizon: 5+ years recommended
- Examples: Apple stock, S&P 500 index fund

#### Bonds (Fixed Income)
- What they are: Loans to companies or governments
- Risk level: Lower risk, lower potential return
- Time horizon: 1-10 years
- Examples: Treasury bonds, corporate bonds

#### Cash Equivalents
- What they are: Very safe, liquid investments
- Risk level: Very low risk, very low return
- Time horizon: Immediate access needed
- Examples: Savings accounts, money market funds

#### Alternative Investments
- What they are: Real estate, commodities, etc.
- Risk level: Varies by type
- Time horizon: Varies by type
- Examples: REITs, gold, cryptocurrency

### 3. The Three-Fund Portfolio

This simple, effective strategy uses just three index funds:

#### Fund 1: Total Stock Market Index
- Purpose: Broad U.S. stock market exposure
- Allocation: 60-80% of portfolio
- Examples: VTSAX, SWTSX, FZROX

#### Fund 2: Total International Stock Index
- Purpose: International stock market exposure
- Allocation: 20-40% of portfolio
- Examples: VTIAX, SWISX, FTIHX

#### Fund 3: Total Bond Market Index
- Purpose: Bond market exposure for stability
- Allocation: 0-40% of portfolio
- Examples: VBTLX, SWAGX, FXNAX

### 4. Age-Based Asset Allocation

#### The 100-Age Rule
- Formula: 100 - your age = % in stocks
- Example: 30 years old = 70% stocks, 30% bonds
- Example: 60 years old = 40% stocks, 60% bonds

#### Conservative Approach (100-Age-10)
- Formula: 100 - your age - 10 = % in stocks
- Example: 30 years old = 60% stocks, 40% bonds

#### Aggressive Approach (100-Age+10)
- Formula: 100 - your age + 10 = % in stocks
- Example: 30 years old = 80% stocks, 20% bonds

### 5. Risk Tolerance Assessment

#### Conservative Investor
- Profile: Prefers safety over growth
- Allocation: 70% bonds, 30% stocks
- Timeframe: Short to medium term
- Emotional comfort: Low volatility preferred

#### Moderate Investor
- Profile: Balance of safety and growth
- Allocation: 50% bonds, 50% stocks
- Timeframe: Medium to long term
- Emotional comfort: Some volatility acceptable

#### Aggressive Investor
- Profile: Willing to take risks for higher returns
- Allocation: 20% bonds, 80% stocks
- Timeframe: Long term (10+ years)
- Emotional comfort: High volatility acceptable

### 6. Geographic Diversification

#### Domestic vs International
- U.S. Stocks: 60-80% of stock allocation
- International Stocks: 20-40% of stock allocation
- Emerging Markets: 5-15% of international allocation

#### Why International Diversification?
- Different economic cycles - Not all countries decline together
- Currency diversification - Reduces currency risk
- Growth opportunities - Some countries grow faster
- Sector exposure - Different industries dominate globally

### 7. Sector Diversification

#### Major Sectors:
- Technology: Innovation and growth
- Healthcare: Essential services, stable demand
- Financials: Banks, insurance, real estate
- Consumer Staples: Food, household products
- Energy: Oil, gas, renewable energy
- Industrials: Manufacturing, infrastructure

#### Sector Rotation Strategy:
- Cyclical sectors perform well during economic growth
- Defensive sectors perform well during economic downturns
- Growth sectors perform well during innovation periods

### 8. Portfolio Rebalancing

#### What is Rebalancing?
Rebalancing is the process of adjusting your portfolio to maintain your target asset allocation.

#### When to Rebalance:
- Annually: Set a calendar reminder
- When allocation drifts 5%: From your target
- After major life changes: Marriage, kids, job change
- Market volatility: After significant market movements

#### How to Rebalance:
1. Calculate current allocation
2. Compare to target allocation
3. Identify over/under-weighted assets
4. Sell overweight assets
5. Buy underweight assets
6. Use new contributions to rebalance

### 9. Tax-Efficient Portfolio Placement

#### Tax-Advantaged Accounts (401k, IRA):
- Bonds: Tax-deferred growth
- REITs: Tax-deferred distributions
- High-dividend stocks: Tax-deferred dividends
- Actively managed funds: Tax-deferred trading

#### Taxable Accounts:
- Index funds: Low turnover, tax-efficient
- Growth stocks: Lower dividends, capital gains
- Municipal bonds: Tax-free interest
- Tax-loss harvesting: Offset gains with losses

### 10. Portfolio Monitoring and Maintenance

#### What to Monitor:
- Asset allocation: Does it match your target?
- Performance: Are you meeting your goals?
- Fees: Are costs staying low?
- Rebalancing needs: When to adjust?

#### What NOT to Monitor:
- Daily fluctuations: Short-term noise
- Individual stock performance: Focus on overall portfolio
- Market predictions: Stick to your plan
- Other people's returns: Everyone's situation differs

### 11. Common Portfolio Mistakes

#### ❌ Avoid These Mistakes:
- Over-diversification: Too many investments to track
- Under-diversification: Too much in one investment
- Chasing performance: Buying what's hot
- Panic selling: Selling during market downturns
- Ignoring fees: High fees eat into returns
- No rebalancing: Letting allocation drift

#### ✅ Best Practices:
- Start simple: Three-fund portfolio
- Stay diversified: Across asset classes and regions
- Keep costs low: Index funds and ETFs
- Rebalance regularly: Maintain target allocation
- Stay the course: Don't react to short-term noise
- Review annually: Adjust for life changes

### 12. Building Your Portfolio Step-by-Step

#### Step 1: Determine Your Goals
- Time horizon: When do you need the money?
- Risk tolerance: How much volatility can you handle?
- Return expectations: What returns do you need?
- Income needs: Do you need regular income?

#### Step 2: Choose Your Asset Allocation
- Use age-based rules as starting point
- Adjust for risk tolerance
- Consider time horizon
- Factor in income needs

#### Step 3: Select Your Investments
- Start with index funds for simplicity
- Choose low-cost options
- Ensure diversification
- Consider tax implications

#### Step 4: Implement Your Plan
- Open appropriate accounts
- Set up automatic investing
- Make initial investments
- Schedule regular reviews

### 13. Advanced Portfolio Strategies

#### Core-Satellite Approach:
- Core (80%): Broad market index funds
- Satellite (20%): Individual stocks, sector funds

#### Factor Investing:
- Value stocks: Undervalued companies
- Growth stocks: High-growth companies
- Small-cap stocks: Smaller companies
- Dividend stocks: High-dividend companies

#### Alternative Investments:
- REITs: Real estate investment trusts
- Commodities: Gold, oil, agricultural products
- International bonds: Global bond exposure
- Emerging markets: Developing country stocks

### 14. Portfolio Performance Evaluation

#### Key Metrics to Track:
- Total return: Overall portfolio performance
- Risk-adjusted return: Return per unit of risk
- Volatility: How much your portfolio fluctuates
- Sharpe ratio: Risk-adjusted performance measure
- Maximum drawdown: Largest peak-to-trough decline

#### Benchmark Comparison:
- Compare to appropriate benchmarks
- S&P 500: For U.S. stock allocation
- Total Bond Market: For bond allocation
- Balanced funds: For mixed portfolios

### 15. Your Portfolio Action Plan

1. Assess your current situation: Goals, timeline, risk tolerance
2. Choose your asset allocation: Use age-based rules as starting point
3. Select your investments: Start with three-fund portfolio
4. Open appropriate accounts: 401k, IRA, taxable brokerage
5. Make your first investments: Start with small amounts
6. Set up automatic investing: For consistency
7. Schedule regular reviews: Quarterly or annually
8. Rebalance when needed: Maintain target allocation
9. Adjust for life changes: Marriage, kids, job changes
10. Stay the course: Don't react to short-term market movements

Remember: A well-constructed portfolio is your roadmap to financial success. Start simple, stay disciplined, and let time and compound interest work their magic!`,
        order: 6,
        xpValue: 25
      }
    ],
    "Budgeting & Taxes": [
      {
        title: "Creating Your First Budget",
        content: `# Creating Your First Budget

## Track Your Income and Expenses

Track your income and expenses for one month. Use the 50/30/20 rule:

- 50% - Needs (rent, groceries, utilities)
- 30% - Wants (entertainment, dining out)
- 20% - Savings and debt repayment

This creates a balanced financial foundation that helps you understand where your money goes and how to allocate it effectively.`,
        order: 1,
        xpValue: 20
      },
      {
        title: "Understanding Taxes",
        content: `# Understanding Taxes

## How the Tax System Works

Taxes are mandatory payments to the government. The US uses a progressive system - higher earners pay higher rates.

## Key Tax Concepts

- Tax Brackets - Different income ranges are taxed at different rates
- Deductions - Expenses that reduce your taxable income
- Credits - Direct reductions in the amount of tax you owe
- Withholding - Money taken from your paycheck for taxes

Understanding these concepts helps you make better financial decisions and potentially reduce your tax burden legally.`,
        order: 2,
        xpValue: 20
      },
      {
        title: "Tax-Advantaged Accounts",
        content: `# Tax-Advantaged Accounts

## Types of Tax-Advantaged Accounts

401(k)s and IRAs offer significant tax benefits that can boost your wealth over time.

## Traditional vs Roth Accounts

### Traditional Accounts
- Tax breaks now - Reduce your current year's taxes
- Taxed later - Pay taxes when you withdraw in retirement
- Best for - High earners who expect lower taxes in retirement

### Roth Accounts
- Tax-free growth - No taxes on withdrawals in retirement
- Pay taxes now - No current year tax deduction
- Best for - Young earners or those expecting higher taxes later

## Key Benefits
- Compound growth - Tax-free or tax-deferred growth
- Automatic savings - Money is set aside before you see it
- Employer matching - Many employers match 401(k) contributions

Maximizing these accounts is one of the most powerful wealth-building strategies available.`,
        order: 3,
        xpValue: 20
      },
      {
        title: "Filing Your Taxes",
        content: `# Filing Your Taxes

## Annual Tax Filing Process

File your taxes annually by April 15th. You might get a refund if you overpaid, or owe money if you underpaid.

## What You Need

- W-2 forms - From your employer showing wages and taxes withheld
- 1099 forms - For freelance work, interest, dividends, etc.
- Receipts - For deductible expenses
- Previous year's return - For reference

## Understanding Refunds vs Payments

### Tax Refund
- You overpaid during the year
- Getting money back from the government
- Consider adjusting withholding to get more money in each paycheck

### Tax Payment Due
- You underpaid during the year
- Owe additional money to the government
- Consider increasing withholding or making estimated payments

## Tips for Success
- File on time to avoid penalties
- Keep records for at least 3 years
- Consider professional help for complex situations
- Use tax software for simple returns`,
        order: 4,
        xpValue: 20
      }
    ],
    "Retirement Basics": [
      {
        title: "Why Start Early?",
        content: `# Starting Early: The Power of Time

## Time is Your Greatest Asset

Time is your greatest asset in retirement planning. Starting at 25 vs 35 can mean hundreds of thousands more in retirement.

## The Compound Effect

### Starting at Age 25
- 40 years of compound growth
- Smaller monthly contributions needed
- Massive final balance due to time

### Starting at Age 35
- 30 years of compound growth
- Larger monthly contributions required
- Significantly less final balance

## Real Example

If you invest $200/month at 7% annual return:

- Starting at 25: $1.2 million at age 65
- Starting at 35: $600,000 at age 65

The 10-year difference results in double the retirement savings!

## Key Takeaway

Start now, even with small amounts. Time and compound interest will do the heavy lifting for you.`,
        order: 1,
        xpValue: 20
      },
      {
        title: "401(k) Basics",
        content: `# 401(k) Basics: Your Employer's Retirement Gift

## What is a 401(k)?

A 401(k) is an employer-sponsored retirement account that offers significant tax advantages and often includes employer matching.

## Key Features

### Tax Benefits
- Traditional 401(k) - Contributions reduce current taxes
- Roth 401(k) - Tax-free withdrawals in retirement
- Tax-deferred growth - No taxes on investment gains until withdrawal

### Employer Matching
- Free money - Many employers match your contributions
- Common match - 50% of first 6% of salary
- Vesting schedule - You may need to stay employed to keep the match

## Contribution Limits (2024)
- Under 50: $23,000 per year
- 50 and over: $30,500 per year (catch-up contribution)
- Employer match - Additional to your limit

## Getting Started
1. Enroll through your employer's HR system
2. Choose contribution percentage - Start with enough to get full match
3. Select investments - Usually target-date funds for simplicity
4. Increase over time - Aim for 10-15% of salary eventually

## Pro Tip
Always contribute enough to get the full employer match - it's free money that doubles your investment!`,
        order: 2,
        xpValue: 20
      },
      {
        title: "IRAs Explained",
        content: `# IRAs Explained: Individual Retirement Accounts

## What are IRAs?

Individual Retirement Accounts (IRAs) let you save for retirement with tax advantages, even if you don't have access to a 401(k).

## Types of IRAs

### Traditional IRA
- Tax deduction now - Reduce current year's taxes
- Tax-deferred growth - No taxes on investment gains
- Taxed in retirement - Pay taxes when you withdraw
- Best for - High earners expecting lower taxes later

### Roth IRA
- No tax deduction - Pay taxes on contributions now
- Tax-free growth - No taxes on investment gains
- Tax-free withdrawals - No taxes in retirement
- Best for - Young earners or those expecting higher taxes later

## Contribution Limits (2024)
- Under 50: $7,000 per year
- 50 and over: $8,000 per year (catch-up contribution)
- Income limits - Roth IRA has income restrictions

## Getting Started
1. Choose a provider - Brokerage firm or robo-advisor
2. Open account - Traditional, Roth, or both
3. Set up automatic contributions - Monthly or annual
4. Select investments - Index funds for simplicity

## Pro Tip
Consider both types - Traditional for tax breaks now, Roth for tax-free growth later!`,
        order: 3,
        xpValue: 20
      }
    ],
    "Insurance Essentials": [
      {
        title: "Types of Insurance",
        content: `# Types of Insurance: Protecting What Matters

## Essential Insurance Coverage

Insurance protects you from financial disasters. Here are the most important types:

## Health Insurance
- Covers medical expenses - Doctor visits, hospital stays, prescriptions
- Required by law - Avoid penalties for being uninsured
- Employer-sponsored - Often the most affordable option
- Marketplace plans - Available through healthcare.gov

## Auto Insurance
- Required by law - Most states mandate coverage
- Liability coverage - Protects others if you cause an accident
- Comprehensive coverage - Protects your vehicle from damage
- Collision coverage - Covers damage from accidents

## Homeowners/Renters Insurance
- Homeowners - Protects your home and belongings
- Renters - Protects your belongings in a rental
- Liability protection - Covers accidents on your property
- Replacement cost - Ensures you can rebuild/replace items

## Life Insurance
- Term life - Affordable coverage for a specific period
- Whole life - Permanent coverage with cash value
- Beneficiaries - Provides for loved ones after your death
- Amount needed - Typically 10-12x your annual income

## Disability Insurance
- Income replacement - Covers lost wages if you can't work
- Short-term - Covers temporary disabilities
- Long-term - Covers permanent disabilities
- Employer-provided - Often available through work

## Pro Tip
Start with the basics - Health, auto, and renters/homeowners insurance are essential for everyone!`,
        order: 1,
        xpValue: 20
      },
      {
        title: "Understanding Premiums",
        content: `# Understanding Premiums: The Cost of Protection

## What are Premiums?

Premiums are what you pay for insurance coverage. Understanding how they work helps you make better insurance decisions.

## Premium vs Deductible Trade-off

### Higher Deductibles
- Lower premiums - Pay less each month
- Higher out-of-pocket - Pay more when you need coverage
- Best for - People who rarely make claims

### Lower Deductibles
- Higher premiums - Pay more each month
- Lower out-of-pocket - Pay less when you need coverage
- Best for - People who frequently use insurance

## Factors That Affect Premiums

### Personal Factors
- Age - Younger drivers pay more for auto insurance
- Health - Pre-existing conditions affect health insurance
- Credit score - Better credit often means lower premiums
- Location - High-crime areas increase home/auto premiums

### Coverage Factors
- Coverage amount - More coverage = higher premiums
- Policy limits - Higher limits cost more
- Add-ons - Optional coverage increases costs
- Claims history - Past claims can increase premiums

## Ways to Lower Premiums
- Bundle policies - Combine home and auto with same company
- Increase deductibles - If you can afford higher out-of-pocket costs
- Maintain good credit - Many insurers use credit scores
- Shop around - Compare quotes from multiple companies
- Ask about discounts - Good driver, student, multi-policy discounts

## Pro Tip
Balance cost and coverage - Don't sacrifice essential protection just to save money!`,
        order: 2,
        xpValue: 20
      },
      {
        title: "Shopping for Insurance",
        content: `# Shopping for Insurance: Getting the Best Deal

## Compare Quotes from Multiple Companies

Compare quotes from multiple companies. Look at coverage, not just price. Read the fine print!

## What to Compare

### Coverage Details
- Policy limits - Maximum amount the insurer will pay
- Deductibles - Amount you pay before coverage kicks in
- Exclusions - What's NOT covered by the policy
- Add-ons - Optional coverage you might need

### Company Factors
- Financial strength - Can they pay claims?
- Customer service - How easy is it to file claims?
- Claims process - How quickly do they process claims?
- Online tools - Can you manage your policy easily?

## Shopping Strategy

### Step 1: Determine Your Needs
- Assess risks - What do you need to protect?
- Calculate coverage - How much insurance do you need?
- Set budget - What can you afford to pay?

### Step 2: Get Multiple Quotes
- At least 3 quotes - Compare different companies
- Same coverage - Make sure you're comparing apples to apples
- Ask questions - Don't assume anything is covered

### Step 3: Read the Fine Print
- Policy documents - Understand what's covered
- Exclusions - Know what's NOT covered
- Terms and conditions - Understand your obligations

## Red Flags to Avoid
- Too cheap - If it seems too good to be true, it probably is
- High-pressure sales - Good insurance doesn't need pressure
- Unclear coverage - If you don't understand it, ask questions
- Poor reviews - Check customer satisfaction ratings

## Pro Tip
Review annually - Your needs change, so should your insurance coverage!`,
        order: 3,
        xpValue: 20
      }
    ],
    "AP Microeconomics": [
      {
        title: "Scarcity and Opportunity Cost",
        content: `# Scarcity and Opportunity Cost

## The Foundation of Economics

Economics is the study of how people make choices to satisfy unlimited wants with limited resources. Every economy faces the fundamental problem of **scarcity** — there are not enough resources (land, labor, capital, and entrepreneurship) to produce everything people desire. Because of scarcity, individuals, businesses, and governments must make choices.

## Understanding Opportunity Cost

Whenever a choice is made, there is an **opportunity cost** — the value of the next best alternative that must be given up. For example, if you spend your evening studying economics instead of working a part-time job, your opportunity cost is the money you could have earned. Understanding opportunity cost helps economists analyze trade-offs and make rational decisions.

## Branches of Economics

Economics divides into:
- **Microeconomics**: Focuses on individual decisions (like firms and households)
- **Macroeconomics**: Studies the economy as a whole (like inflation and unemployment)

## The Four Factors of Production

1. **Land**: Natural resources (minerals, water, forests)
2. **Labor**: Human effort and skills
3. **Capital**: Tools, machinery, and buildings used in production
4. **Entrepreneurship**: The ability to organize and take risks

## Key Economic Principles

### Scarcity Forces Choices
Scarcity forces all agents to prioritize how resources are used most efficiently. This fundamental constraint shapes every economic decision.

### Trade-offs Are Everywhere
Every decision involves giving up something to get something else. Understanding these trade-offs is crucial for making informed choices.

### Efficiency Matters
Economics seeks to understand how societies can use their limited resources most efficiently to maximize satisfaction and well-being.

## Real-World Applications

Understanding scarcity and opportunity cost helps you:
- Make better personal financial decisions
- Evaluate government policies
- Understand business strategies
- Analyze international trade

Remember: Economics is not about money — it's about choices and the consequences of those choices in a world of limited resources.`,
        order: 1,
        xpValue: 25
      },
      {
        title: "The Production Possibilities Curve (PPC)",
        content: `# The Production Possibilities Curve (PPC)

## Visualizing Economic Choices

The Production Possibilities Curve (PPC) illustrates the trade-offs that an economy faces when deciding how to allocate limited resources between two goods. Each point on the PPC represents a combination of goods that can be produced using all resources efficiently.

## Understanding the PPC

### Points on the Curve
- **Efficient Production**: Points on the curve represent efficient use of all available resources
- **Maximum Output**: These combinations show the maximum possible production given current resources

### Points Inside the Curve
- **Underutilization**: Indicates inefficient resource use
- **Unemployment**: Some resources are not being fully employed
- **Inefficiency**: The economy is not reaching its potential

### Points Outside the Curve
- **Unattainable**: Cannot be produced with current resources
- **Future Possibility**: May become attainable with economic growth

## The Law of Increasing Opportunity Cost

As more of one good is produced, the opportunity cost of producing additional units increases. This occurs because:

1. **Resource Specialization**: Resources are not equally adaptable for all uses
2. **Diminishing Returns**: Less suitable resources must be used
3. **Trade-off Magnification**: Each additional unit requires giving up more of the other good

## Economic Growth and the PPC

### Outward Shifts
An outward shift of the PPC shows economic growth, caused by:
- **Increased Resources**: More land, labor, or capital
- **Technological Progress**: Better methods of production
- **Improved Education**: More skilled workforce
- **Better Infrastructure**: Improved transportation and communication

### Inward Shifts
An inward shift indicates:
- **Resource Loss**: Natural disasters, war, or depletion
- **Economic Decline**: Recession or depression
- **Population Decrease**: Fewer workers available

## Types of PPC Shapes

### Straight Line PPC
- **Constant Opportunity Cost**: Resources are perfectly adaptable
- **Rare in Reality**: Most resources have some specialization

### Bowed-Out PPC
- **Increasing Opportunity Cost**: More realistic representation
- **Resource Specialization**: Resources are better suited for certain uses

## Practical Applications

The PPC helps visualize:
- **Scarcity**: Limited resources constrain production
- **Efficiency**: Points on the curve show efficient resource use
- **Opportunity Cost**: The slope shows trade-offs between goods
- **Economic Growth**: Shifts show changes in productive capacity

## Key Takeaways

1. The PPC shows the maximum possible combinations of two goods
2. Points on the curve represent efficient production
3. Opportunity cost increases as production of one good increases
4. Economic growth shifts the curve outward
5. The PPC is a powerful tool for understanding economic trade-offs

Understanding the PPC provides a foundation for analyzing economic choices, efficiency, and growth in any economy.`,
        order: 2,
        xpValue: 25
      },
      {
        title: "Comparative Advantage and Trade",
        content: `# Comparative Advantage and Trade

## The Foundation of International Trade

The concept of **comparative advantage** explains how individuals, firms, or nations can benefit from specialization and trade. A country has a comparative advantage in producing a good if it can produce that good at a lower opportunity cost than another country.

## Comparative vs. Absolute Advantage

### Absolute Advantage
- **Definition**: Being able to produce more of a good using the same resources
- **Focus**: Productivity and efficiency
- **Example**: Country A can produce 100 cars with 100 workers, while Country B can only produce 50 cars with 100 workers

### Comparative Advantage
- **Definition**: Being able to produce a good at a lower opportunity cost
- **Focus**: Opportunity cost, not productivity
- **Key Insight**: Even if one country is more efficient in all goods, both can still benefit from trade

## How Comparative Advantage Works

### The Principle
By specializing in goods where they have comparative advantage, countries can trade to achieve outcomes beyond their individual production possibilities curves. This means **total world output increases**.

### Example Scenario
- **Country A**: Can produce wine at lower opportunity cost
- **Country B**: Can produce cloth more efficiently
- **Result**: Both benefit by trading wine for cloth rather than producing both domestically

## Benefits of Specialization and Trade

### Increased Efficiency
- Countries focus on what they do best
- Resources are used more efficiently
- Total world production increases

### Expanded Consumption Possibilities
- Trade allows consumption beyond domestic PPC
- Access to goods not produced domestically
- Greater variety of products available

### Lower Costs
- Specialization reduces average costs
- Economies of scale in production
- More efficient resource allocation

## The Gains from Trade

### Production Efficiency
- Each country produces more of their specialty good
- Resources are allocated to most productive uses
- World output increases

### Consumption Efficiency
- Countries can consume combinations of goods they couldn't produce alone
- Access to goods at lower opportunity costs
- Improved standard of living

## Trade Patterns

### What Determines Trade
- **Comparative Advantage**: Based on opportunity costs
- **Resource Endowments**: Natural resources, labor, capital
- **Technology**: Production methods and efficiency
- **Preferences**: Consumer tastes and demands

### Trade Benefits Both Parties
- Even if one country is more efficient in all goods
- Both countries can still gain from specialization
- The key is differences in opportunity costs

## Real-World Applications

### International Trade
- Countries specialize in goods where they have comparative advantage
- Global supply chains and specialization
- Trade agreements and economic integration

### Individual Specialization
- People specialize in careers where they have comparative advantage
- Division of labor in organizations
- Professional services and expertise

### Business Strategy
- Companies focus on core competencies
- Outsourcing non-core activities
- Strategic partnerships and alliances

## Common Misconceptions

### Myth: Trade is Zero-Sum
- **Reality**: Trade creates wealth for both parties
- **Truth**: Voluntary trade benefits all participants

### Myth: Absolute Advantage Determines Trade
- **Reality**: Comparative advantage drives trade patterns
- **Truth**: Opportunity costs matter more than productivity

### Myth: Trade Harms Domestic Industries
- **Reality**: Trade creates new opportunities
- **Truth**: Resources shift to more productive uses

## Key Takeaways

1. **Comparative advantage** is based on opportunity costs, not productivity
2. **Specialization** allows countries to focus on what they do best
3. **Trade** enables consumption beyond domestic production possibilities
4. **Both parties gain** from voluntary trade
5. **World output increases** through specialization and trade

Understanding comparative advantage is essential for analyzing international trade, business strategy, and economic policy. It explains why trade benefits all participants and drives global economic growth.`,
        order: 3,
        xpValue: 25
      },
      {
        title: "Economic Systems",
        content: `# Economic Systems

## The Three Fundamental Questions

Every society must answer three key economic questions that define how resources are allocated:

### 1. What goods and services will be produced?
- Which products should be made?
- How much of each good should be produced?
- What new products should be developed?

### 2. How will they be produced?
- What production methods should be used?
- Which resources should be employed?
- What technology should be adopted?

### 3. For whom will they be produced?
- Who gets the goods and services?
- How should income be distributed?
- What determines access to products?

## Types of Economic Systems

### Command Economy (Planned Economy)
- **Decision Making**: Government makes all production decisions
- **Resource Allocation**: Central planners decide what, how, and for whom
- **Price Setting**: Government sets prices and production targets
- **Examples**: Former Soviet Union, North Korea
- **Advantages**: Can focus on specific goals, reduce inequality
- **Disadvantages**: Lack of incentives, inefficiency, limited choice

### Market Economy (Free Market)
- **Decision Making**: Individual consumers and producers make decisions
- **Resource Allocation**: Guided by self-interest and the price system
- **Price Setting**: Determined by supply and demand
- **Examples**: Hong Kong, Singapore
- **Advantages**: Efficiency, innovation, consumer choice
- **Disadvantages**: Inequality, market failures, instability

### Traditional Economy
- **Decision Making**: Based on customs, traditions, and beliefs
- **Resource Allocation**: Determined by historical practices
- **Examples**: Some indigenous communities, rural areas
- **Advantages**: Stability, cultural preservation
- **Disadvantages**: Limited growth, resistance to change

### Mixed Economy
- **Decision Making**: Combines market freedom with government intervention
- **Resource Allocation**: Market forces with government oversight
- **Examples**: United States, Canada, most modern nations
- **Advantages**: Balance of efficiency and equity
- **Disadvantages**: Complexity, potential conflicts

## How Different Systems Work

### Market Economy Mechanisms
- **Prices as Signals**: Prices coordinate decisions of consumers and producers
- **Competition**: Drives efficiency and innovation
- **Private Property**: Encourages investment and improvement
- **Voluntary Exchange**: Both parties benefit from trade

### Command Economy Mechanisms
- **Central Planning**: Government decides resource allocation
- **Production Targets**: Specific goals for each industry
- **Price Controls**: Government sets prices
- **Resource Allocation**: Bureaucratic decision-making

## Property Rights and Incentives

### Private Property Rights
- **Encourage Investment**: People invest in what they own
- **Promote Innovation**: Rewards for improvement and efficiency
- **Enable Trade**: Clear ownership facilitates exchange
- **Reduce Conflict**: Clear rules about resource use

### Public Property
- **Government Control**: Resources owned by the state
- **Collective Decision Making**: Society decides resource use
- **Potential for Abuse**: May be used for political purposes

## The Role of Government

### Market Failures
- **Externalities**: Costs or benefits not reflected in prices
- **Public Goods**: Goods that benefit everyone
- **Monopolies**: Lack of competition
- **Information Asymmetry**: Unequal access to information

### Government Interventions
- **Regulation**: Rules to correct market failures
- **Taxation**: Redistribute income and fund public goods
- **Public Services**: Provide goods markets won't supply
- **Stabilization**: Smooth economic cycles

## Modern Economic Systems

### Characteristics of Mixed Economies
- **Market-Based**: Most decisions made by individuals and firms
- **Government Role**: Regulation, public goods, social safety nets
- **Private Sector**: Dominant in most industries
- **Public Sector**: Education, healthcare, infrastructure

### Examples of Mixed Economies
- **United States**: Market-oriented with government regulation
- **Sweden**: Market economy with extensive welfare state
- **China**: Market economy with significant government control
- **Germany**: Social market economy

## Trade-offs in Economic Systems

### Efficiency vs. Equity
- **Market Systems**: Tend to be more efficient but less equal
- **Command Systems**: May be more equal but less efficient
- **Mixed Systems**: Attempt to balance both goals

### Freedom vs. Control
- **Market Systems**: More individual freedom
- **Command Systems**: More collective control
- **Mixed Systems**: Balance individual and collective interests

### Stability vs. Growth
- **Traditional Systems**: Stable but slow growth
- **Market Systems**: Dynamic but potentially unstable
- **Mixed Systems**: Moderate growth with stability

## Key Takeaways

1. **Three Questions**: Every society must decide what, how, and for whom to produce
2. **System Types**: Command, market, traditional, and mixed economies
3. **Market Mechanisms**: Prices, competition, and private property drive efficiency
4. **Government Role**: Corrects market failures and provides public goods
5. **Trade-offs**: All systems involve balancing efficiency, equity, freedom, and stability

Understanding economic systems helps explain how different countries organize their economies and why they make different policy choices. Most modern economies are mixed systems that combine market mechanisms with government intervention to achieve both efficiency and equity.`,
        order: 4,
        xpValue: 25
      },
      {
        title: "The Law of Demand",
        content: `# The Law of Demand

## Understanding Consumer Behavior

The **Law of Demand** states that as the price of a good falls, the quantity demanded rises, and as the price rises, the quantity demanded falls — holding all else constant. This fundamental economic principle explains how consumers respond to price changes.

## Why the Inverse Relationship Exists

### The Substitution Effect
When the price of a good falls, consumers switch to this cheaper alternative from more expensive substitutes. For example, if the price of coffee falls, people may buy more coffee and less tea.

### The Income Effect
A lower price increases consumers' purchasing power, effectively giving them more income to spend. This allows them to buy more of the good or other goods.

## The Demand Curve

### Visual Representation
- **Downward Slope**: The demand curve slopes downward to the right
- **Price on Y-axis**: Vertical axis shows price
- **Quantity on X-axis**: Horizontal axis shows quantity demanded
- **Inverse Relationship**: Higher prices correspond to lower quantities

### Key Points on the Curve
- Each point represents a specific price-quantity combination
- The curve shows all possible combinations consumers are willing to buy
- Lower prices mean higher quantities demanded

## Changes in Quantity Demanded vs. Changes in Demand

### Movement Along the Curve (Change in Quantity Demanded)
- **Cause**: Changes in the good's own price
- **Effect**: Movement along the existing demand curve
- **Example**: If pizza price rises from $10 to $12, quantity demanded falls

### Shifts of the Curve (Change in Demand)
- **Cause**: Changes in factors other than the good's own price
- **Effect**: Entire curve shifts left or right
- **Example**: If income increases, demand for normal goods shifts right

## Factors That Shift Demand

### 1. Consumer Income
- **Normal Goods**: Demand increases with income (restaurants, cars)
- **Inferior Goods**: Demand decreases with income (generic brands, public transit)

### 2. Consumer Tastes and Preferences
- **Advertising**: Can increase demand for products
- **Trends**: Fashion trends affect clothing demand
- **Health Concerns**: Can decrease demand for unhealthy foods

### 3. Number of Consumers
- **Population Growth**: More consumers increase demand
- **Demographics**: Age distribution affects demand patterns
- **Market Size**: Larger markets have higher demand

### 4. Prices of Related Goods
- **Substitute Goods**: Goods that can replace each other
  - Example: Coffee and tea, butter and margarine
  - If coffee price rises, tea demand increases
- **Complementary Goods**: Goods consumed together
  - Example: Cars and gasoline, computers and software
  - If car price rises, gasoline demand decreases

### 5. Consumer Expectations
- **Future Prices**: If consumers expect prices to rise, current demand increases
- **Future Income**: If consumers expect higher income, current demand may increase
- **Availability**: If consumers expect shortages, current demand increases

## Real-World Applications

### Understanding Market Behavior
- **Price Sensitivity**: How much quantity changes with price
- **Consumer Preferences**: What drives purchasing decisions
- **Market Trends**: How external factors affect demand

### Business Strategy
- **Pricing Decisions**: Understanding how price affects sales
- **Marketing**: How to influence consumer preferences
- **Product Development**: Meeting changing consumer demands

### Policy Analysis
- **Tax Effects**: How taxes affect consumer behavior
- **Subsidy Impact**: How government support affects demand
- **Regulation Effects**: How rules affect market demand

## Exceptions to the Law of Demand

### Giffen Goods
- **Definition**: Inferior goods where demand increases with price
- **Example**: Very basic food items in extreme poverty
- **Rarity**: Extremely rare in real markets

### Veblen Goods
- **Definition**: Luxury goods where higher prices increase demand
- **Example**: Designer handbags, luxury cars
- **Reason**: Status and prestige associated with high prices

## Key Takeaways

1. **Inverse Relationship**: Price and quantity demanded move in opposite directions
2. **Two Effects**: Substitution and income effects explain the relationship
3. **Curve Movements**: Price changes cause movements along the curve
4. **Curve Shifts**: Other factors cause the entire curve to shift
5. **Multiple Factors**: Many factors influence consumer demand
6. **Market Understanding**: Essential for analyzing consumer behavior

Understanding the Law of Demand is crucial for analyzing markets, making business decisions, and evaluating economic policies. It provides the foundation for understanding how prices are determined and how markets function.`,
        order: 5,
        xpValue: 25
      },
      {
        title: "The Law of Supply",
        content: `# The Law of Supply

## Understanding Producer Behavior

The **Law of Supply** states that as the price of a good increases, producers are willing and able to supply more of it, and as the price decreases, they supply less — assuming all other factors remain constant. This fundamental principle explains how producers respond to price changes.

## Why the Direct Relationship Exists

### Profit Motivation
Higher prices make production more profitable, encouraging firms to:
- Increase output from existing facilities
- Expand production capacity
- Enter the market with new production

### Opportunity Cost
As prices rise, the opportunity cost of not producing increases, making production more attractive compared to alternative uses of resources.

## The Supply Curve

### Visual Representation
- **Upward Slope**: The supply curve slopes upward to the right
- **Price on Y-axis**: Vertical axis shows price
- **Quantity on X-axis**: Horizontal axis shows quantity supplied
- **Direct Relationship**: Higher prices correspond to higher quantities

### Key Points on the Curve
- Each point represents a specific price-quantity combination
- The curve shows all possible combinations producers are willing to supply
- Higher prices mean higher quantities supplied

## Changes in Quantity Supplied vs. Changes in Supply

### Movement Along the Curve (Change in Quantity Supplied)
- **Cause**: Changes in the good's own price
- **Effect**: Movement along the existing supply curve
- **Example**: If wheat price rises from $5 to $7, quantity supplied increases

### Shifts of the Curve (Change in Supply)
- **Cause**: Changes in factors other than the good's own price
- **Effect**: Entire curve shifts left or right
- **Example**: If fertilizer costs decrease, supply of crops shifts right

## Factors That Shift Supply

### 1. Input Prices (Cost of Production)
- **Raw Materials**: Higher material costs decrease supply
- **Labor Costs**: Higher wages decrease supply
- **Energy Costs**: Higher fuel costs decrease supply
- **Example**: If steel prices rise, car supply decreases

### 2. Technology
- **Improved Technology**: Increases productivity and supply
- **New Production Methods**: Can lower costs and increase supply
- **Automation**: Can increase output with same resources
- **Example**: Better farming equipment increases crop supply

### 3. Number of Sellers
- **Market Entry**: New firms increase total supply
- **Market Exit**: Firms leaving decrease total supply
- **Industry Growth**: More producers mean more supply
- **Example**: New restaurants entering increase food supply

### 4. Government Policies
- **Taxes**: Higher taxes decrease supply
- **Subsidies**: Government payments increase supply
- **Regulations**: Can increase costs and decrease supply
- **Example**: Farm subsidies increase agricultural supply

### 5. Producer Expectations
- **Future Prices**: If producers expect higher prices, current supply may decrease
- **Future Costs**: If producers expect higher costs, current supply may increase
- **Market Conditions**: Expectations about demand affect supply decisions

### 6. Natural Conditions
- **Weather**: Affects agricultural supply
- **Natural Disasters**: Can destroy production capacity
- **Seasonal Factors**: Can cause supply fluctuations
- **Example**: Drought decreases crop supply

## Time Horizons and Supply

### Short Run
- **Limited Adjustments**: Producers can only adjust some inputs
- **Fixed Capacity**: Cannot easily change production facilities
- **Less Elastic**: Supply responds less to price changes

### Long Run
- **Full Adjustments**: Producers can adjust all inputs
- **Capacity Changes**: Can build new facilities or exit market
- **More Elastic**: Supply responds more to price changes

## Market Structure and Supply

### Perfect Competition
- **Many Sellers**: No single firm affects market price
- **Price Takers**: Firms accept market price
- **Easy Entry/Exit**: Firms can enter or leave easily

### Monopoly
- **Single Seller**: One firm controls entire market
- **Price Maker**: Firm sets its own price
- **Barriers to Entry**: Difficult for new firms to enter

## Real-World Applications

### Understanding Market Behavior
- **Price Sensitivity**: How much quantity changes with price
- **Producer Responses**: How firms react to market conditions
- **Industry Dynamics**: How supply affects market outcomes

### Business Strategy
- **Production Decisions**: How much to produce at different prices
- **Cost Management**: How to reduce costs to increase supply
- **Market Entry**: When to enter or exit markets

### Policy Analysis
- **Tax Effects**: How taxes affect producer behavior
- **Subsidy Impact**: How government support affects supply
- **Regulation Effects**: How rules affect production decisions

## Supply Elasticity

### Elastic Supply
- **Responsive**: Quantity supplied changes significantly with price
- **Easy to Adjust**: Producers can easily increase or decrease output
- **Example**: Manufactured goods with flexible production

### Inelastic Supply
- **Less Responsive**: Quantity supplied changes little with price
- **Difficult to Adjust**: Producers cannot easily change output
- **Example**: Agricultural products with fixed growing seasons

## Key Takeaways

1. **Direct Relationship**: Price and quantity supplied move in same direction
2. **Profit Motivation**: Higher prices make production more profitable
3. **Curve Movements**: Price changes cause movements along the curve
4. **Curve Shifts**: Other factors cause the entire curve to shift
5. **Multiple Factors**: Many factors influence producer supply decisions
6. **Time Matters**: Supply responsiveness varies with time horizon

Understanding the Law of Supply is essential for analyzing markets, making production decisions, and evaluating economic policies. It provides the foundation for understanding how prices are determined and how markets reach equilibrium.`,
        order: 6,
        xpValue: 25
      },
      {
        title: "Market Equilibrium",
        content: `# Market Equilibrium

## The Balance Point of Markets

**Market equilibrium** occurs where quantity demanded equals quantity supplied — this determines the equilibrium price and quantity. At this point, there's no tendency for price or quantity to change, creating a stable market outcome.

## Understanding Equilibrium

### The Equilibrium Point
- **Price**: The market-clearing price where supply equals demand
- **Quantity**: The amount bought and sold at equilibrium price
- **Stability**: No excess supply or excess demand
- **Efficiency**: Optimal allocation of resources

### How Equilibrium is Reached
Markets naturally move toward equilibrium through the interaction of buyers and sellers responding to market signals and incentives.

## Market Disequilibrium

### Surplus (Excess Supply)
- **Definition**: Quantity supplied exceeds quantity demanded
- **Cause**: Price is above equilibrium level
- **Result**: Downward pressure on price
- **Example**: If pizza price is $15 but equilibrium is $12, there's a surplus

### Shortage (Excess Demand)
- **Definition**: Quantity demanded exceeds quantity supplied
- **Cause**: Price is below equilibrium level
- **Result**: Upward pressure on price
- **Example**: If concert tickets are $50 but equilibrium is $100, there's a shortage

## Market Adjustment Process

### When Price is Too High (Surplus)
1. **Excess Supply**: Producers have unsold goods
2. **Price Competition**: Sellers compete to sell their products
3. **Price Falls**: Competition drives price down
4. **Quantity Adjusts**: Lower price increases quantity demanded, decreases quantity supplied
5. **Equilibrium Restored**: Market reaches balance

### When Price is Too Low (Shortage)
1. **Excess Demand**: Consumers want more than available
2. **Price Competition**: Buyers compete for limited goods
3. **Price Rises**: Competition drives price up
4. **Quantity Adjusts**: Higher price decreases quantity demanded, increases quantity supplied
5. **Equilibrium Restored**: Market reaches balance

## Changes in Equilibrium

### Demand Shifts
When demand increases (shifts right):
- **New Equilibrium**: Higher price and higher quantity
- **Example**: Summer increases demand for ice cream

When demand decreases (shifts left):
- **New Equilibrium**: Lower price and lower quantity
- **Example**: Health concerns decrease demand for cigarettes

### Supply Shifts
When supply increases (shifts right):
- **New Equilibrium**: Lower price and higher quantity
- **Example**: Technology improvement increases supply of computers

When supply decreases (shifts left):
- **New Equilibrium**: Higher price and lower quantity
- **Example**: Drought decreases supply of wheat

### Simultaneous Shifts
When both curves shift:
- **Price Effect**: Depends on which curve shifts more
- **Quantity Effect**: Usually moves in same direction as dominant shift
- **Example**: If both demand and supply increase, quantity increases but price effect is uncertain

## Market Efficiency

### Allocative Efficiency
- **Definition**: Resources are allocated to their highest-valued uses
- **Achievement**: Equilibrium maximizes total welfare
- **Consumer Surplus**: Benefits consumers receive
- **Producer Surplus**: Benefits producers receive

### Productive Efficiency
- **Definition**: Goods are produced at lowest possible cost
- **Achievement**: Competitive markets achieve this
- **Cost Minimization**: Firms produce at minimum average cost

## Real-World Applications

### Understanding Market Behavior
- **Price Determination**: How market prices are set
- **Quantity Determination**: How market quantities are determined
- **Market Stability**: Why markets tend toward equilibrium

### Business Strategy
- **Pricing Decisions**: Understanding market-clearing prices
- **Production Planning**: Anticipating market demand
- **Market Entry**: Evaluating market opportunities

### Policy Analysis
- **Market Interventions**: How government policies affect equilibrium
- **Tax Effects**: How taxes shift supply or demand
- **Regulation Impact**: How rules affect market outcomes

## Market Failures

### When Markets Don't Reach Equilibrium
- **Externalities**: Costs or benefits not reflected in prices
- **Public Goods**: Goods that markets don't provide efficiently
- **Monopolies**: Single sellers can manipulate prices
- **Information Asymmetry**: Unequal information between buyers and sellers

### Government Intervention
- **Correcting Failures**: Policies to address market failures
- **Price Controls**: Ceilings and floors that prevent equilibrium
- **Regulation**: Rules to improve market outcomes

## Dynamic Equilibrium

### Continuous Adjustment
- **Changing Conditions**: Markets constantly adjust to new information
- **New Equilibrium**: Each change creates a new balance point
- **Market Signals**: Prices provide information about scarcity and value

### Long-Run Adjustments
- **Entry and Exit**: Firms enter profitable markets, exit unprofitable ones
- **Capacity Changes**: Firms adjust production capacity over time
- **Technology**: Innovation shifts supply curves

## Key Takeaways

1. **Balance Point**: Equilibrium occurs where supply equals demand
2. **Market Forces**: Surpluses and shortages create pressure for change
3. **Automatic Adjustment**: Markets naturally move toward equilibrium
4. **Efficiency**: Equilibrium maximizes total welfare
5. **Dynamic Process**: Markets continuously adjust to changing conditions
6. **Policy Implications**: Understanding equilibrium helps evaluate government interventions

Market equilibrium is the foundation of microeconomic analysis. Understanding how markets reach and maintain equilibrium is crucial for analyzing economic behavior, making business decisions, and evaluating public policies.`,
        order: 7,
        xpValue: 25
      },
      {
        title: "Price Controls (Ceilings and Floors)",
        content: `# Price Controls: Ceilings and Floors

## Government Intervention in Markets

Governments sometimes impose **price controls** to influence market outcomes and achieve social or economic goals. These policies set legal limits on prices, preventing markets from reaching their natural equilibrium.

## Price Ceilings

### Definition and Purpose
- **Definition**: A maximum legal price that sellers can charge
- **Purpose**: Often intended to help consumers by keeping prices low
- **Common Examples**: Rent control, price caps on utilities, maximum prices for essential goods

### How Price Ceilings Work
- **Below Equilibrium**: Effective ceilings are set below the market equilibrium price
- **Binding Constraint**: Prevents prices from rising to market-clearing levels
- **Result**: Creates excess demand (shortage)

### Effects of Price Ceilings

#### Shortages
- **Excess Demand**: More people want the good than is available
- **Rationing**: Non-price methods determine who gets the good
- **Examples**: Long waiting lists for rent-controlled apartments

#### Quality Degradation
- **Reduced Incentives**: Sellers have less incentive to maintain quality
- **Cost Cutting**: Producers may reduce quality to maintain profits
- **Examples**: Poor maintenance in rent-controlled buildings

#### Black Markets
- **Illegal Trading**: Goods sold above the legal price
- **Underground Economy**: Unregulated transactions
- **Examples**: Scalping tickets, illegal rent increases

### Real-World Examples

#### Rent Control
- **Goal**: Make housing affordable for low-income residents
- **Reality**: Reduces housing supply, creates shortages
- **Long-term Effects**: Discourages new construction, reduces maintenance

#### Price Caps on Utilities
- **Goal**: Keep essential services affordable
- **Reality**: May lead to underinvestment in infrastructure
- **Examples**: Electricity price caps during energy crises

## Price Floors

### Definition and Purpose
- **Definition**: A minimum legal price that sellers can receive
- **Purpose**: Often intended to help producers by ensuring adequate income
- **Common Examples**: Minimum wage, agricultural price supports

### How Price Floors Work
- **Above Equilibrium**: Effective floors are set above the market equilibrium price
- **Binding Constraint**: Prevents prices from falling to market-clearing levels
- **Result**: Creates excess supply (surplus)

### Effects of Price Floors

#### Surpluses
- **Excess Supply**: More goods are produced than consumers want to buy
- **Storage Costs**: Government or producers must store excess goods
- **Examples**: Agricultural surpluses from price supports

#### Inefficient Allocation
- **Overproduction**: Resources used for goods consumers don't want
- **Waste**: Goods may be destroyed or stored indefinitely
- **Examples**: "Butter mountains" and "wine lakes" in Europe

#### Reduced Competition
- **Market Distortion**: Prevents efficient price competition
- **Barrier to Entry**: May protect inefficient producers
- **Examples**: Minimum wage may reduce job opportunities for low-skilled workers

### Real-World Examples

#### Minimum Wage
- **Goal**: Ensure workers earn a living wage
- **Reality**: May reduce employment opportunities for low-skilled workers
- **Trade-offs**: Higher wages for some, unemployment for others

#### Agricultural Price Supports
- **Goal**: Support farmers' incomes
- **Reality**: Creates surpluses, requires government purchases
- **Examples**: U.S. dairy price supports, EU Common Agricultural Policy

## Comparing Price Controls

### Price Ceilings vs. Price Floors
- **Ceilings**: Help consumers, hurt producers, create shortages
- **Floors**: Help producers, hurt consumers, create surpluses
- **Both**: Create inefficiencies and unintended consequences

### Effectiveness Depends On
- **Elasticity**: How responsive supply and demand are to price changes
- **Market Structure**: Competitive vs. monopolistic markets
- **Enforcement**: How well the controls are monitored and enforced

## Unintended Consequences

### Market Distortions
- **Resource Misallocation**: Resources not used efficiently
- **Deadweight Loss**: Lost economic welfare
- **Reduced Innovation**: Less incentive to improve products or processes

### Secondary Effects
- **Black Markets**: Illegal trading at market prices
- **Quality Issues**: Reduced incentives for quality maintenance
- **Long-term Problems**: Persistent shortages or surpluses

## Alternatives to Price Controls

### Market-Based Solutions
- **Subsidies**: Direct payments to consumers or producers
- **Tax Credits**: Reduce costs for targeted groups
- **Vouchers**: Give consumers purchasing power without price controls

### Non-Price Policies
- **Regulation**: Quality standards, safety requirements
- **Information**: Consumer education, labeling requirements
- **Infrastructure**: Public investment in essential services

## Evaluating Price Controls

### When They Might Work
- **Temporary Crises**: Short-term measures during emergencies
- **Market Failures**: When markets don't work efficiently
- **Social Goals**: When society values equity over efficiency

### When They Usually Fail
- **Long-term Use**: Controls become permanent and create persistent problems
- **Competitive Markets**: When markets work efficiently without intervention
- **Poor Design**: When controls don't address root causes

## Key Takeaways

1. **Government Intervention**: Price controls prevent markets from reaching equilibrium
2. **Ceilings Create Shortages**: Maximum prices lead to excess demand
3. **Floors Create Surpluses**: Minimum prices lead to excess supply
4. **Unintended Consequences**: Controls often create problems they were meant to solve
5. **Trade-offs**: Help some groups while hurting others
6. **Alternatives Exist**: Market-based solutions may be more effective

Understanding price controls is crucial for evaluating government policies and their effects on markets. While they may achieve short-term goals, they often create long-term inefficiencies and unintended consequences that can be worse than the problems they were meant to solve.`,
        order: 8,
        xpValue: 25
      },
      {
        title: "Elasticity",
        content: `# Elasticity: Measuring Responsiveness

## Understanding Market Sensitivity

**Elasticity** measures how much quantity demanded or supplied changes in response to a change in price, income, or other factors. It's a crucial concept for understanding market behavior and making economic decisions.

## Price Elasticity of Demand (PED)

### Definition and Formula
- **Definition**: Measures how responsive quantity demanded is to price changes
- **Formula**: PED = % change in quantity demanded ÷ % change in price
- **Always Negative**: Due to the inverse relationship between price and quantity demanded

### Types of Price Elasticity

#### Elastic Demand (PED > 1)
- **Definition**: Quantity demanded changes more than price
- **Characteristics**: Consumers are very responsive to price changes
- **Examples**: Luxury goods, non-essential items
- **Revenue Effect**: Price increase decreases total revenue

#### Inelastic Demand (PED < 1)
- **Definition**: Quantity demanded changes less than price
- **Characteristics**: Consumers are not very responsive to price changes
- **Examples**: Essential goods, medications, gasoline
- **Revenue Effect**: Price increase increases total revenue

#### Unit Elastic Demand (PED = 1)
- **Definition**: Quantity demanded changes exactly as much as price
- **Characteristics**: Percentage changes are equal
- **Revenue Effect**: Total revenue remains constant

#### Perfectly Elastic Demand (PED = ∞)
- **Definition**: Consumers will buy any quantity at a specific price
- **Characteristics**: Horizontal demand curve
- **Examples**: Perfectly competitive markets

#### Perfectly Inelastic Demand (PED = 0)
- **Definition**: Quantity demanded doesn't change regardless of price
- **Characteristics**: Vertical demand curve
- **Examples**: Life-saving medications

### Factors Affecting Price Elasticity

#### Availability of Substitutes
- **More Substitutes**: More elastic demand
- **Fewer Substitutes**: More inelastic demand
- **Example**: Generic drugs vs. brand-name drugs

#### Necessity vs. Luxury
- **Necessities**: More inelastic demand
- **Luxuries**: More elastic demand
- **Example**: Food vs. jewelry

#### Time Horizon
- **Short Run**: More inelastic demand
- **Long Run**: More elastic demand
- **Example**: Gasoline consumption

#### Proportion of Income
- **Large Proportion**: More elastic demand
- **Small Proportion**: More inelastic demand
- **Example**: Cars vs. salt

## Price Elasticity of Supply (PES)

### Definition and Formula
- **Definition**: Measures how responsive quantity supplied is to price changes
- **Formula**: PES = % change in quantity supplied ÷ % change in price
- **Always Positive**: Due to the direct relationship between price and quantity supplied

### Factors Affecting Supply Elasticity

#### Time Horizon
- **Short Run**: More inelastic supply
- **Long Run**: More elastic supply
- **Example**: Agricultural products

#### Production Flexibility
- **Easy to Adjust**: More elastic supply
- **Difficult to Adjust**: More inelastic supply
- **Example**: Manufactured goods vs. agricultural products

#### Resource Availability
- **Abundant Resources**: More elastic supply
- **Limited Resources**: More inelastic supply
- **Example**: Common materials vs. rare materials

## Cross-Price Elasticity of Demand

### Definition and Formula
- **Definition**: Measures how demand for one good changes when another good's price changes
- **Formula**: Cross-PED = % change in quantity demanded of Good A ÷ % change in price of Good B

### Types of Relationships

#### Substitute Goods
- **Definition**: Goods that can replace each other
- **Cross-Price Elasticity**: Positive (price of one increases demand for the other)
- **Examples**: Coffee and tea, butter and margarine

#### Complementary Goods
- **Definition**: Goods consumed together
- **Cross-Price Elasticity**: Negative (price of one decreases demand for the other)
- **Examples**: Cars and gasoline, computers and software

#### Independent Goods
- **Definition**: Goods with no relationship
- **Cross-Price Elasticity**: Zero
- **Examples**: Coffee and shoes

## Income Elasticity of Demand

### Definition and Formula
- **Definition**: Measures how demand changes when consumer income changes
- **Formula**: Income Elasticity = % change in quantity demanded ÷ % change in income

### Types of Goods

#### Normal Goods
- **Definition**: Demand increases with income
- **Income Elasticity**: Positive
- **Examples**: Restaurants, cars, vacations

#### Inferior Goods
- **Definition**: Demand decreases with income
- **Income Elasticity**: Negative
- **Examples**: Generic brands, public transit

#### Luxury Goods
- **Definition**: Demand increases more than proportionally with income
- **Income Elasticity**: Greater than 1
- **Examples**: High-end cars, designer clothing

#### Necessities
- **Definition**: Demand increases less than proportionally with income
- **Income Elasticity**: Between 0 and 1
- **Examples**: Food, housing, utilities

## Applications of Elasticity

### Business Strategy
- **Pricing Decisions**: Understanding how price changes affect revenue
- **Product Development**: Knowing which products are price-sensitive
- **Market Analysis**: Understanding consumer behavior

### Government Policy
- **Tax Policy**: Understanding how taxes affect different goods
- **Subsidy Design**: Targeting subsidies effectively
- **Regulation**: Understanding market responses to rules

### Market Analysis
- **Revenue Optimization**: Finding the price that maximizes revenue
- **Market Power**: Understanding competitive dynamics
- **Consumer Welfare**: Measuring the impact of price changes

## Calculating Elasticity

### Midpoint Formula
- **Purpose**: More accurate calculation using average values
- **Formula**: Elasticity = [(Q2-Q1)/(Q2+Q1)/2] ÷ [(P2-P1)/(P2+P1)/2]
- **Advantage**: Same result regardless of direction of change

### Point Elasticity
- **Purpose**: Elasticity at a specific point on the curve
- **Formula**: Elasticity = (dQ/dP) × (P/Q)
- **Use**: For precise calculations at specific prices

## Key Takeaways

1. **Responsiveness**: Elasticity measures how much quantity responds to changes
2. **Price Elasticity**: Determines how price changes affect revenue
3. **Cross-Price**: Shows relationships between different goods
4. **Income Elasticity**: Categorizes goods as normal, inferior, or luxury
5. **Time Matters**: Elasticity often increases with time
6. **Policy Tool**: Essential for understanding market responses to policies

Understanding elasticity is crucial for making informed economic decisions, whether in business, government policy, or personal finance. It provides the tools to predict how markets will respond to changes and to design more effective policies and strategies.`,
        order: 9,
        xpValue: 25
      },
      {
        title: "Consumer and Producer Surplus",
        content: `# Consumer and Producer Surplus

## Measuring Market Welfare

**Consumer surplus** and **producer surplus** are measures of the benefits that buyers and sellers receive from participating in markets. Together, they represent the total welfare generated by market transactions.

## Consumer Surplus

### Definition
- **Consumer Surplus**: The difference between what consumers are willing to pay and what they actually pay
- **Willingness to Pay**: The maximum price a consumer would pay for a good
- **Market Price**: The actual price paid in the market
- **Benefit**: The extra value consumers receive from the transaction

### How Consumer Surplus Works
- **Above Market Price**: Consumers willing to pay more than market price benefit
- **Below Market Price**: Consumers unwilling to pay market price don't buy
- **Total Surplus**: Sum of all individual consumer surpluses

### Visual Representation
- **Demand Curve**: Shows willingness to pay at each quantity
- **Market Price**: Horizontal line at equilibrium price
- **Consumer Surplus**: Area below demand curve, above price line
- **Triangle Shape**: Consumer surplus forms a triangle

### Example
- **Willing to Pay**: $20 for a concert ticket
- **Market Price**: $15
- **Consumer Surplus**: $5 per ticket
- **Total Benefit**: $5 × number of tickets purchased

## Producer Surplus

### Definition
- **Producer Surplus**: The difference between the price received and the minimum price a producer would accept
- **Minimum Acceptable Price**: The lowest price a producer would sell for (marginal cost)
- **Market Price**: The actual price received in the market
- **Benefit**: The extra profit producers receive from the transaction

### How Producer Surplus Works
- **Below Market Price**: Producers willing to sell for less than market price benefit
- **Above Market Price**: Producers requiring more than market price don't sell
- **Total Surplus**: Sum of all individual producer surpluses

### Visual Representation
- **Supply Curve**: Shows minimum acceptable price at each quantity
- **Market Price**: Horizontal line at equilibrium price
- **Producer Surplus**: Area above supply curve, below price line
- **Triangle Shape**: Producer surplus forms a triangle

### Example
- **Minimum Acceptable Price**: $10 to produce a widget
- **Market Price**: $15
- **Producer Surplus**: $5 per widget
- **Total Benefit**: $5 × number of widgets sold

## Total Surplus (Social Welfare)

### Definition
- **Total Surplus**: Consumer surplus + Producer surplus
- **Social Welfare**: Total benefits from market transactions
- **Efficiency Measure**: Higher total surplus means more efficient allocation

### Market Equilibrium Maximizes Total Surplus
- **Efficient Allocation**: Resources go to highest-valued uses
- **Maximum Welfare**: No other allocation can make everyone better off
- **Pareto Efficiency**: Cannot improve one person's welfare without hurting another

## Changes in Surplus

### When Demand Increases
- **Consumer Surplus**: May increase or decrease depending on price change
- **Producer Surplus**: Usually increases due to higher price
- **Total Surplus**: Usually increases due to more transactions

### When Supply Increases
- **Consumer Surplus**: Usually increases due to lower price
- **Producer Surplus**: May increase or decrease depending on price change
- **Total Surplus**: Usually increases due to more transactions

### When Both Change
- **Complex Effects**: Depends on relative magnitudes of shifts
- **Price Effect**: Determines how surplus is redistributed
- **Quantity Effect**: More transactions usually increase total surplus

## Market Interventions and Surplus

### Price Ceilings
- **Consumer Surplus**: May increase for those who can buy
- **Producer Surplus**: Usually decreases
- **Total Surplus**: Usually decreases (deadweight loss)
- **Deadweight Loss**: Lost surplus due to market distortion

### Price Floors
- **Consumer Surplus**: Usually decreases
- **Producer Surplus**: May increase for those who can sell
- **Total Surplus**: Usually decreases (deadweight loss)

### Taxes
- **Consumer Surplus**: Decreases due to higher effective price
- **Producer Surplus**: Decreases due to lower effective price
- **Tax Revenue**: Government gains revenue
- **Deadweight Loss**: Lost surplus due to reduced transactions

### Subsidies
- **Consumer Surplus**: Increases due to lower effective price
- **Producer Surplus**: Increases due to higher effective price
- **Government Cost**: Taxpayers pay for subsidy
- **Deadweight Loss**: Lost surplus due to overproduction

## Deadweight Loss

### Definition
- **Deadweight Loss**: Lost economic welfare due to market distortions
- **Inefficiency**: Resources not allocated to highest-valued uses
- **Lost Trades**: Mutually beneficial transactions that don't occur

### Causes of Deadweight Loss
- **Price Controls**: Prevent market from reaching equilibrium
- **Taxes**: Create wedge between what buyers pay and sellers receive
- **Monopolies**: Restrict output below efficient level
- **Externalities**: Costs or benefits not reflected in prices

### Measuring Deadweight Loss
- **Triangle Method**: Area of triangle between supply and demand curves
- **Lost Surplus**: Difference between total surplus with and without intervention
- **Efficiency Cost**: Measure of economic inefficiency

## Applications

### Policy Analysis
- **Cost-Benefit Analysis**: Comparing costs and benefits of policies
- **Welfare Effects**: Understanding who gains and who loses
- **Efficiency Trade-offs**: Balancing equity and efficiency goals

### Business Strategy
- **Pricing Strategy**: Understanding consumer willingness to pay
- **Market Analysis**: Measuring market efficiency
- **Competitive Advantage**: Creating value for consumers

### Market Design
- **Auction Design**: Maximizing total surplus
- **Regulation**: Minimizing deadweight loss
- **Public Policy**: Balancing competing objectives

## Key Takeaways

1. **Consumer Surplus**: Benefits consumers receive from market transactions
2. **Producer Surplus**: Benefits producers receive from market transactions
3. **Total Surplus**: Combined welfare from market activity
4. **Efficiency**: Market equilibrium maximizes total surplus
5. **Interventions**: Government policies often reduce total surplus
6. **Deadweight Loss**: Measure of economic inefficiency

Understanding consumer and producer surplus is essential for evaluating market efficiency, analyzing government policies, and making informed economic decisions. These concepts provide the foundation for understanding how markets create value and how interventions affect that value.`,
        order: 10,
        xpValue: 25
      },
      {
        title: "Short-Run vs Long-Run Production",
        content: `# Short-Run vs Long-Run Production

## Understanding Time Horizons

The distinction between **short-run** and **long-run** production is fundamental to understanding how firms make decisions and how markets adjust to changing conditions.

### Short-Run Production

#### Definition
- **Fixed Inputs**: At least one factor of production cannot be changed
- **Variable Inputs**: Other factors can be adjusted
- **Time Period**: Typically weeks to months
- **Decision Making**: Limited by existing resources

#### Characteristics
- **Capital Fixed**: Factory size, machinery, equipment cannot change
- **Labor Variable**: Can hire or fire workers
- **Materials Variable**: Can adjust raw material purchases
- **Output Adjustments**: Limited by fixed capacity

#### Examples
- **Restaurant**: Kitchen size fixed, can hire more servers
- **Manufacturing**: Factory size fixed, can add shifts
- **Farm**: Land fixed, can vary fertilizer and labor

### Long-Run Production

#### Definition
- **All Inputs Variable**: Every factor of production can be adjusted
- **No Fixed Costs**: All costs become variable
- **Time Period**: Typically months to years
- **Strategic Planning**: Full flexibility in resource allocation

#### Characteristics
- **Plant Size**: Can expand or contract facilities
- **Technology**: Can adopt new production methods
- **Market Entry/Exit**: Can enter or leave markets
- **Complete Flexibility**: No constraints on adjustments

#### Examples
- **New Factory**: Building additional production facilities
- **Technology Upgrade**: Installing new equipment
- **Market Expansion**: Entering new geographic markets

## Key Differences

### Decision Making
- **Short-Run**: Marginal analysis with fixed constraints
- **Long-Run**: Strategic planning with full flexibility

### Cost Structure
- **Short-Run**: Fixed costs + Variable costs
- **Long-Run**: All costs are variable

### Market Behavior
- **Short-Run**: Firms may operate at loss
- **Long-Run**: Firms enter/exit based on profitability

### Efficiency
- **Short-Run**: May not achieve optimal scale
- **Long-Run**: Can achieve economies of scale

## Production Decisions

### Short-Run Decisions
- **Output Level**: How much to produce with existing capacity
- **Labor Input**: How many workers to hire
- **Materials**: How much raw material to purchase
- **Pricing**: How to price given fixed costs

### Long-Run Decisions
- **Capacity**: What size facility to build
- **Technology**: What production methods to use
- **Location**: Where to locate facilities
- **Market Strategy**: Which markets to serve

## Economic Implications

### Market Adjustment
- **Short-Run**: Limited response to demand changes
- **Long-Run**: Full adjustment through entry/exit

### Cost Behavior
- **Short-Run**: Rising marginal costs due to fixed inputs
- **Long-Run**: Potential for economies of scale

### Competition
- **Short-Run**: Existing firms compete with current capacity
- **Long-Run**: New firms can enter, existing firms can expand

## Real-World Applications

### Business Planning
- **Short-Run**: Operational decisions and capacity utilization
- **Long-Run**: Strategic planning and investment decisions

### Policy Analysis
- **Short-Run**: Immediate effects of policy changes
- **Long-Run**: Long-term structural adjustments

### Market Analysis
- **Short-Run**: Price and output responses
- **Long-Run**: Industry structure and competition

## Key Takeaways

1. **Time Matters**: Short-run and long-run decisions differ fundamentally
2. **Flexibility**: Long-run allows complete adjustment of all inputs
3. **Constraints**: Short-run limited by fixed factors
4. **Planning**: Long-run involves strategic investment decisions
5. **Market Dynamics**: Entry and exit occur only in the long run
6. **Efficiency**: Long-run allows achievement of optimal scale

Understanding the short-run vs long-run distinction is crucial for analyzing firm behavior, market dynamics, and economic policy effects. It provides the foundation for understanding how markets adjust to changing conditions over different time horizons.`,
        order: 11,
        xpValue: 25
      },
      {
        title: "Law of Diminishing Marginal Returns",
        content: `# Law of Diminishing Marginal Returns

## Understanding Production Efficiency

The **Law of Diminishing Marginal Returns** is a fundamental principle that explains how adding more of a variable input to fixed inputs affects production output. This law is crucial for understanding production decisions and cost behavior.

### Definition

The law states that as more of a variable input (like labor) is added to fixed inputs (like capital), the additional output from each new unit of the variable input will eventually decrease.

### Key Concepts

#### Marginal Product
- **Definition**: Additional output from one more unit of input
- **Formula**: Change in Total Product ÷ Change in Input
- **Measurement**: Output per additional worker, machine, etc.

#### Total Product
- **Definition**: Total output produced with given inputs
- **Relationship**: Sum of all marginal products
- **Pattern**: Increases initially, then may decrease

#### Average Product
- **Definition**: Output per unit of input
- **Formula**: Total Product ÷ Quantity of Input
- **Use**: Measures productivity per worker

## The Three Stages

### Stage I: Increasing Marginal Returns
- **Characteristic**: Each additional input adds more output than the previous one
- **Cause**: Specialization and division of labor
- **Example**: First few workers can specialize in different tasks
- **Efficiency**: Very efficient use of inputs

### Stage II: Diminishing Marginal Returns
- **Characteristic**: Each additional input adds less output than the previous one
- **Cause**: Fixed inputs become limiting factors
- **Example**: Too many workers for available machines
- **Efficiency**: Still efficient, but less so than Stage I

### Stage III: Negative Marginal Returns
- **Characteristic**: Additional inputs actually reduce total output
- **Cause**: Overcrowding and inefficiency
- **Example**: Too many workers interfering with each other
- **Efficiency**: Inefficient use of inputs

## Why Diminishing Returns Occur

### Fixed Input Constraints
- **Limited Capital**: Not enough machines for all workers
- **Space Limitations**: Crowded working conditions
- **Management Capacity**: Supervisors can't oversee unlimited workers

### Specialization Limits
- **Task Division**: Eventually all tasks are optimally divided
- **Coordination Problems**: More workers create coordination issues
- **Communication Breakdown**: Information flow becomes inefficient

### Physical Constraints
- **Workspace**: Limited physical space for production
- **Equipment**: Fixed number of machines or tools
- **Raw Materials**: Limited access to inputs

## Mathematical Representation

### Production Function
- **Formula**: Q = f(L, K)
- **Q**: Output quantity
- **L**: Labor (variable input)
- **K**: Capital (fixed input)

### Marginal Product Curve
- **Shape**: Initially upward sloping, then downward sloping
- **Peak**: Maximum marginal product
- **Zero Point**: Where marginal product becomes zero
- **Negative**: Where marginal product becomes negative

## Cost Implications

### Marginal Cost Relationship
- **Inverse Relationship**: As marginal product falls, marginal cost rises
- **Reason**: Same cost for less additional output
- **Implication**: Production becomes more expensive per unit

### Average Cost Impact
- **Initially Falling**: Due to increasing marginal returns
- **Eventually Rising**: Due to diminishing marginal returns
- **Minimum Point**: Where marginal cost equals average cost

## Real-World Examples

### Agriculture
- **Fixed Input**: Land area
- **Variable Input**: Labor, fertilizer, seeds
- **Result**: Eventually, adding more fertilizer yields less additional crop

### Manufacturing
- **Fixed Input**: Factory size, machinery
- **Variable Input**: Workers
- **Result**: Too many workers reduces efficiency

### Service Industries
- **Fixed Input**: Office space, computers
- **Variable Input**: Employees
- **Result**: Overcrowding reduces productivity

## Business Applications

### Optimal Input Levels
- **Decision Rule**: Hire workers until marginal product equals marginal cost
- **Efficiency**: Operate in Stage II for maximum efficiency
- **Avoid**: Stage III where additional inputs reduce output

### Cost Management
- **Understanding**: Why costs rise as production increases
- **Planning**: Anticipate cost increases with expansion
- **Strategy**: Consider capacity expansion before hiring more workers

### Production Planning
- **Capacity**: Match labor to available capital
- **Efficiency**: Avoid overcrowding and inefficiency
- **Growth**: Plan for capital expansion with labor increases

## Policy Implications

### Labor Market Policies
- **Minimum Wage**: May encourage over-hiring if not considered
- **Training Programs**: Can improve worker productivity
- **Workplace Regulations**: May affect optimal input combinations

### Economic Development
- **Infrastructure**: Investment in capital can increase productivity
- **Education**: Training can improve worker efficiency
- **Technology**: Innovation can shift the production function

## Key Takeaways

1. **Universal Principle**: Applies to all production processes
2. **Three Stages**: Increasing, diminishing, and negative returns
3. **Fixed Inputs**: The constraint that causes diminishing returns
4. **Cost Impact**: Rising marginal costs as marginal product falls
5. **Business Planning**: Essential for optimal input decisions
6. **Policy Tool**: Important for understanding economic behavior

Understanding the Law of Diminishing Marginal Returns is crucial for making efficient production decisions, analyzing cost behavior, and designing effective economic policies. It provides the foundation for understanding why production costs rise and how firms can optimize their operations.`,
        order: 12,
        xpValue: 25
      }
    ]
  };

  const lessons = lessonTemplates[courseTitle] || [];
  return lessons.map(lesson => ({
    ...lesson,
    courseId,
    isActive: true
  }));
}

function generateLessonsForUnit(unitTitle, courseTitle) {
  // Map lessons to specific units for AP Microeconomics
  const unitLessonMap = {
    "AP Microeconomics": {
      "Unit 1: Basic Economic Concepts": [
        {
          title: "Scarcity and Opportunity Cost",
          content: `# Scarcity and Opportunity Cost

## Understanding Scarcity

**Scarcity** is the fundamental economic problem where resources are limited but human wants are unlimited. This means we can't have everything we want, so we must make choices about how to use our limited resources.

### Key Points:
- Resources are finite (limited)
- Wants are infinite (unlimited)
- Forces us to make choices
- Basis for all economic decisions

## Understanding Opportunity Cost

Whenever a choice is made, there is an **opportunity cost** — the value of the next best alternative that must be given up. For example, if you spend your evening studying economics instead of working a part-time job, your opportunity cost is the money you could have earned. Understanding opportunity cost helps economists analyze trade-offs and make rational decisions.

### Examples:
- **Time**: Studying vs. working vs. sleeping
- **Money**: Buying a car vs. investing in stocks
- **Resources**: Using land for farming vs. building houses

## Why This Matters

Understanding scarcity and opportunity cost helps you:
- Make better personal decisions
- Understand why trade-offs exist
- Evaluate the true cost of choices
- Think like an economist

## The Law of Increasing Opportunity Cost

As more of one good is produced, the opportunity cost of producing additional units increases. This occurs because:

1. **Resource Specialization**: Some resources are better suited for certain goods
2. **Diminishing Returns**: Less efficient resources must be used
3. **Trade-off Magnification**: Each additional unit requires giving up more of the other good

### Production Possibilities Curve (PPC)

The PPC illustrates opportunity cost:
- **Straight Line**: Constant opportunity cost
- **Bowed Outward**: Increasing opportunity cost (more realistic)

#### Key Features:
- **Efficiency**: Points on the curve are efficient
- **Opportunity Cost**: The slope shows trade-offs between goods
- **Economic Growth**: Shifts the curve outward

#### Important Concepts:
1. Points inside the curve represent inefficient production
2. Points outside the curve are unattainable with current resources
3. Opportunity cost increases as production of one good increases

## Comparative Advantage

The concept of **comparative advantage** explains how individuals, firms, or nations can benefit from specialization and trade. A country has a comparative advantage in producing a good if it can produce that good at a lower opportunity cost than another country.

### Key Terms:
- **Absolute Advantage**: Being able to produce more with the same resources
- **Comparative Advantage**: Having a lower opportunity cost
- **Specialization**: Focusing on what you do best
- **Trade**: Exchanging goods and services

### Example:
- **Country A**: Can produce wine at lower opportunity cost
- **Country B**: Can produce cheese at lower opportunity cost
- **Result**: Both countries benefit by specializing and trading

## Benefits of Trade

Trade allows countries to:
- Consume beyond their production possibilities
- Access goods at lower opportunity costs
- Focus on their strengths (comparative advantage)
- Increase overall welfare

### Key Differences:
- **Absolute Advantage**: Based on productivity
- **Comparative Advantage**: Based on opportunity costs
- **Trade Benefits**: Come from comparative advantage, not absolute advantage

## Common Misconceptions

❌ **Myth**: "If one country is better at everything, trade won't benefit them"
✅ **Truth**: Opportunity costs matter more than productivity

❌ **Myth**: "Trade always hurts domestic workers"
✅ **Reality**: Trade creates new opportunities

## Key Takeaways

1. **Comparative advantage** is based on opportunity costs, not productivity
2. **Specialization** and trade benefit all parties
3. **Opportunity cost** is the key to understanding trade
4. The key is differences in opportunity costs

Remember: Even if one country is more efficient in all goods, both countries can still benefit from trade if they have different opportunity costs!`,
          order: 1,
          xpValue: 50
        }
      ],
      "Unit 2: Supply and Demand": [
        {
          title: "Introduction to Supply and Demand",
          content: `# Introduction to Supply and Demand

Supply and demand is the foundation of market economics. It explains how prices are determined and how markets allocate resources efficiently.

## What is Demand?

**Demand** represents the quantity of a good or service that consumers are willing and able to buy at various prices during a specific time period.

### Law of Demand
As price increases, quantity demanded decreases (and vice versa), all else being equal.

### Demand Curve
- **Downward sloping**: Higher prices = lower quantity demanded
- **Individual vs. Market**: Market demand is the sum of all individual demands

## What is Supply?

**Supply** represents the quantity of a good or service that producers are willing and able to sell at various prices during a specific time period.

### Law of Supply
As price increases, quantity supplied increases (and vice versa), all else being equal.

### Supply Curve
- **Upward sloping**: Higher prices = higher quantity supplied
- **Individual vs. Market**: Market supply is the sum of all individual supplies

## Market Equilibrium

**Equilibrium** occurs where supply and demand curves intersect:
- **Equilibrium Price**: Price where quantity supplied = quantity demanded
- **Equilibrium Quantity**: Quantity where supply and demand are equal
- **Market Clearing**: All goods produced are sold, all demand is satisfied

## Factors Affecting Demand

### Price of Related Goods
- **Substitutes**: Goods that can replace each other (Coke vs. Pepsi)
- **Complements**: Goods used together (cars and gasoline)

### Income
- **Normal Goods**: Demand increases with income
- **Inferior Goods**: Demand decreases with income

### Other Factors
- **Tastes and Preferences**: Consumer preferences change
- **Population**: More people = more demand
- **Expectations**: Future price expectations affect current demand

## Factors Affecting Supply

### Input Prices
- **Labor Costs**: Higher wages increase production costs
- **Raw Materials**: More expensive inputs reduce supply

### Technology
- **Productivity**: Better technology increases supply
- **Efficiency**: More efficient production methods

### Other Factors
- **Number of Sellers**: More producers increase supply
- **Expectations**: Future price expectations affect current supply
- **Government Policies**: Taxes, subsidies, regulations

## Shifts vs. Movements

### Movement Along the Curve
- **Cause**: Change in price of the good itself
- **Result**: Movement along the existing curve
- **Example**: Price of pizza increases → quantity demanded decreases

### Shift of the Curve
- **Cause**: Change in non-price factors
- **Result**: Entire curve shifts left or right
- **Example**: Income increases → demand curve shifts right

## Market Efficiency

### Consumer Surplus
- **Definition**: Difference between what consumers are willing to pay and what they actually pay
- **Calculation**: Area below demand curve, above price line

### Producer Surplus
- **Definition**: Difference between what producers receive and what they're willing to accept
- **Calculation**: Area above supply curve, below price line

### Total Surplus
- **Definition**: Consumer surplus + Producer surplus
- **Maximum**: Achieved at market equilibrium

## Price Elasticity

### Price Elasticity of Demand
- **Elastic**: Quantity demanded changes significantly with price changes
- **Inelastic**: Quantity demanded changes little with price changes
- **Factors**: Substitutes, necessity, time horizon, proportion of income

### Price Elasticity of Supply
- **Elastic**: Quantity supplied changes significantly with price changes
- **Inelastic**: Quantity supplied changes little with price changes
- **Factors**: Production time, availability of inputs, technology

## Government Intervention

### Price Controls
- **Price Ceiling**: Maximum legal price (rent control)
- **Price Floor**: Minimum legal price (minimum wage)
- **Effects**: Can create shortages or surpluses

### Taxes and Subsidies
- **Taxes**: Increase costs, reduce supply
- **Subsidies**: Decrease costs, increase supply
- **Incidence**: Who actually pays depends on elasticities

## Key Takeaways

1. **Supply and demand** determine market prices and quantities
2. **Equilibrium** occurs where supply equals demand
3. **Shifts** in curves change equilibrium, **movements** along curves don't
4. **Elasticity** measures responsiveness to price changes
5. **Government intervention** can affect market outcomes

Understanding supply and demand is essential for analyzing any market situation!`,
          order: 1,
          xpValue: 50
        }
      ]
    }
  };

  const courseUnits = unitLessonMap[courseTitle];
  if (!courseUnits) {
    return [];
  }

  const unitLessons = courseUnits[unitTitle];
  return unitLessons || [];
}

// Quiz templates for each lesson
function generateQuizzesForLesson(lessonId, lessonTitle) {
  const quizTemplates = {
    "What is Investing?": {
      title: "Investing Fundamentals Quiz",
      description: "Test your understanding of basic investing concepts",
      type: "mixed",
      questions: [
        {
          id: 1,
          question: "What is the primary purpose of investing?",
          type: "multiple_choice",
          options: [
            "To save money in a bank account",
            "To put money to work to earn more money over time",
            "To spend money on luxury items",
            "To avoid paying taxes"
          ],
          correctAnswer: 1,
          explanation: "Investing is about putting your money to work to earn more money over time, not just saving it."
        },
        {
          id: 2,
          question: "What is compound interest?",
          type: "multiple_choice",
          options: [
            "Interest that decreases over time",
            "Interest earned on both principal and previously earned interest",
            "Interest that only applies to savings accounts",
            "Interest that is taxed at a higher rate"
          ],
          correctAnswer: 1,
          explanation: "Compound interest is interest earned on both the original principal and the interest that has been added to it."
        },
        {
          id: 3,
          question: "Which of the following is an example of an asset?",
          type: "multiple_choice",
          options: [
            "Credit card debt",
            "Car loan",
            "Stock in a company",
            "Monthly rent payment"
          ],
          correctAnswer: 2,
          explanation: "Stock in a company is an asset because it represents ownership that can grow in value."
        },
        {
          id: 4,
          question: "Explain in your own words what compound interest means and why it's important for investors.",
          type: "free_response",
          correctAnswer: "Compound interest is interest earned on both the original principal and previously earned interest. It's important because it allows money to grow exponentially over time, making early investing very powerful.",
          explanation: "Compound interest is the key to building wealth over time - the earlier you start, the more powerful it becomes."
        },
        {
          id: 5,
          question: "What is the time value of money?",
          type: "short_answer",
          correctAnswer: "Money today is worth more than the same amount in the future because it can earn returns.",
          explanation: "The time value of money means that money today is worth more than the same amount in the future because it can earn returns."
        },
        {
          id: 6,
          question: "Describe the difference between an asset and a liability, and give one example of each.",
          type: "free_response",
          correctAnswer: "An asset puts money in your pocket (like stocks or real estate), while a liability takes money out of your pocket (like credit card debt or car loans).",
          explanation: "Understanding assets vs liabilities is fundamental to building wealth - focus on acquiring assets and minimizing liabilities."
        },
        {
          id: 7,
          question: "What is the Rule of 72?",
          type: "short_answer",
          correctAnswer: "A rule that estimates how long it takes to double your money by dividing 72 by the annual interest rate",
          explanation: "The Rule of 72 is a simple formula to estimate the time needed to double an investment at a given annual rate of return."
        },
        {
          id: 8,
          question: "Why is starting to invest early so important for building wealth?",
          type: "free_response",
          correctAnswer: "Starting early is important because it gives your money more time to compound, allowing small amounts to grow into significant wealth over decades.",
          explanation: "Time is the most powerful factor in investing - the earlier you start, the more time compound interest has to work its magic."
        }
      ]
    },
    "Stocks vs Bonds": {
      title: "Stocks and Bonds Knowledge Check",
      description: "Test your understanding of stocks and bonds",
      type: "mixed",
      questions: [
        {
          id: 1,
          question: "What do stocks represent?",
          type: "multiple_choice",
          options: [
            "A loan to a company",
            "Ownership shares in a company",
            "A government bond",
            "A savings account"
          ],
          correctAnswer: 1,
          explanation: "Stocks represent ownership shares in a company, making you a partial owner."
        },
        {
          id: 2,
          question: "What are bonds?",
          type: "multiple_choice",
          options: [
            "Ownership in a company",
            "Loans you make to companies or governments",
            "Savings accounts with high interest",
            "Insurance policies"
          ],
          correctAnswer: 1,
          explanation: "Bonds are loans you make to companies or governments, and you earn interest on them."
        },
        {
          id: 3,
          question: "Which investment typically has higher risk?",
          type: "multiple_choice",
          options: [
            "Government bonds",
            "Stocks",
            "Savings accounts",
            "Certificates of deposit"
          ],
          correctAnswer: 1,
          explanation: "Stocks typically have higher risk than bonds, savings accounts, or CDs, but also higher potential returns."
        },
        {
          id: 4,
          question: "What is a dividend?",
          type: "short_answer",
          correctAnswer: "A portion of company profits paid to shareholders",
          explanation: "A dividend is a portion of company profits that some companies pay to their shareholders."
        },
        {
          id: 5,
          question: "Which type of bond is generally considered the safest?",
          type: "short_answer",
          correctAnswer: "Government bonds",
          explanation: "Government bonds are generally considered the safest because they are backed by the government."
        },
        {
          id: 6,
          question: "Explain the main difference between how you make money from stocks versus bonds.",
          type: "free_response",
          correctAnswer: "With stocks, you make money through capital gains (selling for more than you paid) and dividends (company profit sharing). With bonds, you make money through fixed interest payments.",
          explanation: "Understanding how different investments generate returns helps you choose the right mix for your portfolio."
        },
        {
          id: 7,
          question: "What does it mean when a company pays dividends?",
          type: "short_answer",
          correctAnswer: "Dividends are payments made by companies to shareholders from their profits.",
          explanation: "Dividends provide regular income to stockholders and are a sign of a company's financial health."
        },
        {
          id: 8,
          question: "What is the main difference between common stock and preferred stock?",
          type: "short_answer",
          correctAnswer: "Common stock has voting rights and variable dividends, while preferred stock has fixed dividends but no voting rights.",
          explanation: "Common stockholders can vote on company decisions but dividends vary, while preferred stockholders get fixed dividends but can't vote."
        },
        {
          id: 9,
          question: "Explain why bonds are generally considered safer than stocks.",
          type: "free_response",
          correctAnswer: "Bonds are generally safer because they provide fixed interest payments and return the principal at maturity, while stocks have no guaranteed returns and can lose value.",
          explanation: "Bonds offer more predictable returns and lower risk compared to stocks, making them suitable for conservative investors."
        }
      ]
    },
    "Risk and Return": {
      title: "Risk and Return Assessment",
      description: "Evaluate your understanding of investment risk and return",
      type: "mixed",
      questions: [
        {
          id: 1,
          question: "What is the general relationship between risk and return?",
          type: "multiple_choice",
          options: [
            "Higher risk always means higher returns",
            "Lower risk always means lower returns",
            "Higher potential returns generally come with higher risk",
            "Risk and return are unrelated"
          ],
          correctAnswer: 2,
          explanation: "Generally, higher potential returns come with higher risk, though this is not guaranteed."
        },
        {
          id: 2,
          question: "What is market risk?",
          type: "free_response",
          correctAnswer: "Market risk is the risk that the entire market will decline, affecting most investments.",
          explanation: "Market risk affects all investments when the overall market experiences a downturn."
        },
        {
          id: 3,
          question: "What is inflation risk?",
          type: "multiple_choice",
          options: [
            "The risk that stocks will go up",
            "The risk that inflation will erode purchasing power",
            "The risk that bonds will default",
            "The risk that you'll lose money"
          ],
          correctAnswer: 1,
          explanation: "Inflation risk is the risk that inflation will erode the purchasing power of your money over time."
        },
        {
          id: 4,
          question: "What is a conservative investor's typical allocation?",
          type: "free_response",
          correctAnswer: "A conservative investor typically allocates 70% bonds and 30% stocks.",
          explanation: "Conservative investors prefer safety over growth, so they allocate more to bonds than stocks."
        },
        {
          id: 5,
          question: "What is dollar-cost averaging?",
          type: "short_answer",
          correctAnswer: "Investing the same amount regularly regardless of market conditions",
          explanation: "Dollar-cost averaging is investing the same amount regularly, which helps smooth out market volatility."
        },
        {
          id: 6,
          question: "Describe what happens to your portfolio during a market downturn and why you shouldn't panic sell.",
          type: "free_response",
          correctAnswer: "During market downturns, portfolio values decrease temporarily. You shouldn't panic sell because markets historically recover over time, and selling locks in losses while missing potential recovery.",
          explanation: "Market downturns are normal and temporary - staying invested allows you to participate in the eventual recovery."
        },
        {
          id: 7,
          question: "What is the difference between systematic risk and unsystematic risk?",
          type: "short_answer",
          correctAnswer: "Systematic risk affects the entire market and cannot be diversified away, while unsystematic risk affects individual companies and can be reduced through diversification.",
          explanation: "Understanding these risk types helps you build a more resilient portfolio through proper diversification."
        },
        {
          id: 8,
          question: "What is volatility in investing?",
          type: "short_answer",
          correctAnswer: "Volatility is the degree of variation in investment returns over time, measured by how much prices fluctuate.",
          explanation: "Volatility indicates how much an investment's price moves up and down - higher volatility means more price swings."
        },
        {
          id: 9,
          question: "Explain why younger investors can typically afford to take more risk than older investors.",
          type: "free_response",
          correctAnswer: "Younger investors can take more risk because they have more time to recover from losses and benefit from compound growth, while older investors need to preserve capital for retirement.",
          explanation: "Time horizon is crucial in risk tolerance - younger investors have decades to recover from market downturns."
        }
      ]
    },
    "Diversification": {
      title: "Diversification Mastery Test",
      description: "Test your knowledge of diversification strategies",
      type: "mixed",
      questions: [
        {
          id: 1,
          question: "What is diversification?",
          type: "multiple_choice",
          options: [
            "Putting all your money in one investment",
            "Spreading investments across different assets to reduce risk",
            "Only investing in stocks",
            "Avoiding all investments"
          ],
          correctAnswer: 1,
          explanation: "Diversification is spreading your investments across different assets to reduce risk."
        },
        {
          id: 2,
          question: "What is the 60/40 rule?",
          type: "multiple_choice",
          options: [
            "60% stocks, 40% bonds",
            "60% bonds, 40% stocks",
            "60% cash, 40% investments",
            "60% real estate, 40% stocks"
          ],
          correctAnswer: 0,
          explanation: "The 60/40 rule is a traditional allocation of 60% stocks for growth and 40% bonds for stability."
        },
        {
          id: 3,
          question: "What is the main benefit of diversification?",
          type: "multiple_choice",
          options: [
            "Guaranteed higher returns",
            "Reduced risk without necessarily reducing returns",
            "Elimination of all investment risk",
            "Higher fees"
          ],
          correctAnswer: 1,
          explanation: "Diversification reduces risk without necessarily reducing returns, helping to smooth out portfolio performance."
        },
        {
          id: 4,
          question: "What is over-diversification?",
          type: "short_answer",
          correctAnswer: "Having too many investments to track effectively",
          explanation: "Over-diversification occurs when you have too many investments to track and manage effectively."
        },
        {
          id: 5,
          question: "What is the age-based allocation rule?",
          type: "short_answer",
          correctAnswer: "100 - your age = % in stocks",
          explanation: "The rule of thumb is 100 minus your age equals the percentage you should have in stocks."
        },
        {
          id: 6,
          question: "Explain why owning 10 different tech stocks is not true diversification.",
          type: "free_response",
          correctAnswer: "Owning 10 different tech stocks is not true diversification because they're all in the same sector and will likely move together during market changes, providing little risk reduction.",
          explanation: "True diversification requires spreading investments across different sectors, asset classes, and geographic regions."
        },
        {
          id: 7,
          question: "What is rebalancing and why is it important?",
          type: "short_answer",
          correctAnswer: "Rebalancing is adjusting your portfolio to maintain your target asset allocation. It's important because it keeps your risk level consistent and forces you to buy low and sell high.",
          explanation: "Regular rebalancing helps maintain your desired risk level and can improve long-term returns."
        },
        {
          id: 8,
          question: "What is correlation in portfolio diversification?",
          type: "short_answer",
          correctAnswer: "Correlation measures how investments move together - low correlation means investments move independently, providing better diversification.",
          explanation: "Low correlation between investments means they don't move in the same direction, reducing overall portfolio risk."
        },
        {
          id: 9,
          question: "Explain the benefits of international diversification in your investment portfolio.",
          type: "free_response",
          correctAnswer: "International diversification reduces risk by spreading investments across different countries and economies, potentially providing better returns and reducing dependence on any single market.",
          explanation: "International diversification helps reduce country-specific risks and can provide access to faster-growing economies."
        }
      ]
    },
    "Building Your Portfolio": {
      title: "Building Your Portfolio Mastery Test",
      description: "Test your understanding of portfolio construction and management",
      type: "mixed",
      questions: [
        {
          id: 1,
          question: "What is the primary goal of portfolio construction?",
          type: "multiple_choice",
          options: [
            "To maximize short-term gains",
            "To achieve your financial goals while managing risk",
            "To beat the market every year",
            "To invest only in the highest-performing stocks"
          ],
          correctAnswer: 1,
          explanation: "Portfolio construction aims to balance risk and return to achieve your specific financial goals over time."
        },
        {
          id: 2,
          question: "What is asset allocation?",
          type: "short_answer",
          correctAnswer: "The process of dividing your investment portfolio among different asset categories like stocks, bonds, and cash",
          explanation: "Asset allocation is the fundamental strategy of spreading investments across different asset classes to manage risk and return."
        },
        {
          id: 3,
          question: "What is the age-based rule for stock allocation?",
          type: "multiple_choice",
          options: [
            "Your age should equal the percentage in stocks",
            "100 minus your age equals the percentage in stocks",
            "Your age plus 20 equals the percentage in stocks",
            "Your age divided by 2 equals the percentage in stocks"
          ],
          correctAnswer: 1,
          explanation: "The age-based rule suggests putting (100 - your age)% in stocks, with the rest in bonds and cash."
        },
        {
          id: 4,
          question: "Explain the difference between strategic and tactical asset allocation.",
          type: "free_response",
          correctAnswer: "Strategic allocation is the long-term target allocation based on your goals and risk tolerance, while tactical allocation involves short-term adjustments based on market conditions.",
          explanation: "Strategic allocation provides the foundation, while tactical allocation allows for temporary adjustments."
        },
        {
          id: 5,
          question: "What is rebalancing and why is it important?",
          type: "short_answer",
          correctAnswer: "Rebalancing is the process of adjusting your portfolio back to your target asset allocation to maintain your desired risk level",
          explanation: "Rebalancing ensures your portfolio stays aligned with your risk tolerance and investment goals."
        },
        {
          id: 6,
          question: "When should you rebalance your portfolio?",
          type: "multiple_choice",
          options: [
            "Daily to catch every market movement",
            "When your allocation drifts 5% or more from target, or annually",
            "Only when you lose money",
            "Never, set it and forget it"
          ],
          correctAnswer: 1,
          explanation: "Rebalancing should be done when allocations drift significantly from targets or on a regular schedule like annually."
        },
        {
          id: 7,
          question: "What are the benefits of using index funds in portfolio construction?",
          type: "free_response",
          correctAnswer: "Index funds provide broad diversification, low costs, consistent performance, and eliminate the need to pick individual stocks while tracking market performance.",
          explanation: "Index funds offer simplicity, low costs, and market-matching performance for portfolio construction."
        },
        {
          id: 8,
          question: "What is the 60/40 rule in portfolio allocation?",
          type: "short_answer",
          correctAnswer: "A traditional balanced portfolio allocation of 60% stocks and 40% bonds",
          explanation: "The 60/40 rule provides a balanced approach between growth (stocks) and stability (bonds)."
        },
        {
          id: 9,
          question: "How should you adjust your portfolio as you approach retirement?",
          type: "free_response",
          correctAnswer: "Gradually shift from growth-oriented (more stocks) to income-oriented (more bonds) allocation to reduce volatility and provide stable income.",
          explanation: "As you near retirement, reducing stock allocation helps protect your accumulated wealth."
        }
      ]
    },
    "Scarcity and Opportunity Cost": {
      title: "Scarcity and Opportunity Cost Quiz",
      description: "Test your understanding of fundamental economic concepts",
      type: "mixed",
      questions: [
        {
          id: 1,
          question: "What is the fundamental problem of economics?",
          type: "multiple_choice",
          options: [
            "Inflation",
            "Scarcity",
            "Surplus",
            "Productivity"
          ],
          correctAnswer: 1,
          explanation: "Scarcity exists because resources are limited while human wants are unlimited, forcing choices about resource use."
        },
        {
          id: 2,
          question: "Opportunity cost refers to:",
          type: "multiple_choice",
          options: [
            "All costs involved in a decision",
            "The next best alternative forgone",
            "The total amount of money spent",
            "The benefit of a choice"
          ],
          correctAnswer: 1,
          explanation: "Opportunity cost measures what you give up when choosing one option over another — not all costs, just the next best one."
        },
        {
          id: 3,
          question: "Which of the following is NOT considered a factor of production?",
          type: "multiple_choice",
          options: [
            "Land",
            "Labor",
            "Money",
            "Capital"
          ],
          correctAnswer: 2,
          explanation: "Money is not a productive resource; it's a medium of exchange used to acquire resources."
        },
        {
          id: 4,
          question: "When a student chooses to attend college instead of working full time, their opportunity cost is:",
          type: "multiple_choice",
          options: [
            "Tuition costs",
            "The income they could have earned working",
            "Free time during school",
            "The books purchased"
          ],
          correctAnswer: 1,
          explanation: "The forgone earnings represent the next best alternative the student sacrifices by choosing education."
        },
        {
          id: 5,
          question: "Economics primarily studies:",
          type: "multiple_choice",
          options: [
            "How to eliminate scarcity",
            "How societies manage limited resources",
            "How to increase government spending",
            "How to produce infinite goods"
          ],
          correctAnswer: 1,
          explanation: "Economics is about allocation of scarce resources to maximize satisfaction or efficiency."
        },
        {
          id: 6,
          question: "Microeconomics focuses on:",
          type: "multiple_choice",
          options: [
            "The global economy",
            "National unemployment rates",
            "Individual firms and households",
            "Fiscal policy"
          ],
          correctAnswer: 2,
          explanation: "Microeconomics studies small-scale decision-making, unlike macroeconomics, which studies the overall economy."
        },
        {
          id: 7,
          question: "Explain the difference between scarcity and shortage.",
          type: "free_response",
          correctAnswer: "Scarcity is a permanent condition where resources are limited relative to wants, while shortage is a temporary condition where quantity demanded exceeds quantity supplied at current prices.",
          explanation: "Understanding this distinction is crucial for economic analysis - scarcity is fundamental, while shortages can be resolved through price adjustments."
        },
        {
          id: 8,
          question: "What are the four factors of production and give an example of each?",
          type: "free_response",
          correctAnswer: "Land (natural resources like oil), Labor (human effort like workers), Capital (tools and machinery), Entrepreneurship (organizing and risk-taking like starting a business).",
          explanation: "All four factors are needed to produce goods and services, and understanding them helps analyze production decisions."
        }
      ]
    },
    "The Production Possibilities Curve (PPC)": {
      title: "Production Possibilities Curve Quiz",
      description: "Test your understanding of PPC concepts and economic trade-offs",
      type: "mixed",
      questions: [
        {
          id: 1,
          question: "What does a point on the PPC represent?",
          type: "multiple_choice",
          options: [
            "Inefficient production",
            "Unattainable production",
            "Efficient use of resources",
            "Overproduction"
          ],
          correctAnswer: 2,
          explanation: "Points on the curve use all resources fully and efficiently."
        },
        {
          id: 2,
          question: "What can cause the PPC to shift outward?",
          type: "multiple_choice",
          options: [
            "Natural disaster",
            "Decrease in population",
            "Technological improvement",
            "Fewer workers"
          ],
          correctAnswer: 2,
          explanation: "Technology increases productivity, enabling greater output with the same resources."
        },
        {
          id: 3,
          question: "Points inside the PPC represent:",
          type: "multiple_choice",
          options: [
            "Efficiency",
            "Underutilization",
            "Unattainability",
            "Overproduction"
          ],
          correctAnswer: 1,
          explanation: "Inside points show that some resources are not being fully employed."
        },
        {
          id: 4,
          question: "The law of increasing opportunity cost means:",
          type: "multiple_choice",
          options: [
            "Costs stay constant",
            "Costs fall with specialization",
            "Producing more of one good raises the opportunity cost",
            "All resources are equally efficient"
          ],
          correctAnswer: 2,
          explanation: "Resources are not perfectly adaptable; shifting them increases trade-offs."
        },
        {
          id: 5,
          question: "What does an outward shift of the PPC indicate?",
          type: "multiple_choice",
          options: [
            "Economic decline",
            "Inflation",
            "Economic growth",
            "Efficiency loss"
          ],
          correctAnswer: 2,
          explanation: "Growth occurs when more resources or better technology expand production capacity."
        },
        {
          id: 6,
          question: "Which statement about opportunity cost is true?",
          type: "multiple_choice",
          options: [
            "It never changes",
            "It is constant for all goods",
            "It rises as production of a good increases",
            "It only applies to individuals"
          ],
          correctAnswer: 2,
          explanation: "Because resources differ in efficiency, more production of one good raises opportunity cost."
        },
        {
          id: 7,
          question: "Explain why the PPC is typically bowed outward rather than a straight line.",
          type: "free_response",
          correctAnswer: "The PPC is bowed outward because of increasing opportunity costs - resources are not equally efficient for all uses, so shifting production requires giving up increasing amounts of the other good.",
          explanation: "This bowed shape reflects the reality that resources have different efficiencies in different uses."
        },
        {
          id: 8,
          question: "What factors could cause the PPC to shift inward, and what would this indicate about the economy?",
          type: "free_response",
          correctAnswer: "Factors include natural disasters, war, resource depletion, or population decrease. An inward shift indicates economic decline or reduced productive capacity.",
          explanation: "Understanding what causes PPC shifts helps analyze economic conditions and policy impacts."
        }
      ]
    },
    "Comparative Advantage and Trade": {
      title: "Comparative Advantage and Trade Quiz",
      description: "Test your understanding of trade theory and specialization benefits",
      type: "mixed",
      questions: [
        {
          id: 1,
          question: "Comparative advantage is based on differences in:",
          type: "multiple_choice",
          options: [
            "Resource quantity",
            "Opportunity cost",
            "Population",
            "Technology"
          ],
          correctAnswer: 1,
          explanation: "Comparative advantage depends on which producer gives up less of one good to make another."
        },
        {
          id: 2,
          question: "Absolute advantage refers to:",
          type: "multiple_choice",
          options: [
            "Lower opportunity cost",
            "Higher efficiency using fewer resources",
            "Producing more with the same inputs",
            "Producing goods with lower wages"
          ],
          correctAnswer: 2,
          explanation: "Absolute advantage measures productivity, not opportunity cost."
        },
        {
          id: 3,
          question: "When countries specialize in their comparative advantage:",
          type: "multiple_choice",
          options: [
            "Total world output decreases",
            "Both countries can gain from trade",
            "One country always loses",
            "Prices become unstable"
          ],
          correctAnswer: 1,
          explanation: "Specialization allows each to focus on what they do best, increasing global efficiency."
        },
        {
          id: 4,
          question: "Trade allows countries to:",
          type: "multiple_choice",
          options: [
            "Consume beyond their PPC",
            "Produce below their PPC",
            "Decrease total output",
            "Use fewer resources"
          ],
          correctAnswer: 0,
          explanation: "Trade expands consumption possibilities beyond domestic limits."
        },
        {
          id: 5,
          question: "A country with an absolute advantage in all goods should:",
          type: "multiple_choice",
          options: [
            "Avoid trade",
            "Specialize based on comparative advantage",
            "Produce everything",
            "Import everything"
          ],
          correctAnswer: 1,
          explanation: "Even if one country is more efficient in all goods, both still gain from trade if opportunity costs differ."
        },
        {
          id: 6,
          question: "The main benefit of trade is:",
          type: "multiple_choice",
          options: [
            "Equal wealth among nations",
            "Access to a larger variety of goods and higher efficiency",
            "Higher unemployment",
            "Reduced output"
          ],
          correctAnswer: 1,
          explanation: "Trade improves efficiency and variety through specialization."
        },
        {
          id: 7,
          question: "Explain why a country can have a comparative advantage even if it has an absolute disadvantage in producing a good.",
          type: "free_response",
          correctAnswer: "A country can have a comparative advantage if it has a lower opportunity cost for producing that good, even if it's less efficient overall. The key is opportunity cost, not absolute productivity.",
          explanation: "This is a key insight of trade theory - comparative advantage, not absolute advantage, determines trade patterns."
        },
        {
          id: 8,
          question: "How does specialization and trade increase total world output?",
          type: "free_response",
          correctAnswer: "Specialization allows countries to focus on what they do best, using resources more efficiently. Trade enables each country to consume more than they could produce alone, increasing total world welfare.",
          explanation: "Understanding this principle explains why free trade generally benefits all participating countries."
        }
      ]
    },
    "Economic Systems": {
      title: "Economic Systems Quiz",
      description: "Test your understanding of different economic systems and their characteristics",
      type: "mixed",
      questions: [
        {
          id: 1,
          question: "In a market economy, decisions are primarily made by:",
          type: "multiple_choice",
          options: [
            "The government",
            "Individual consumers and producers",
            "The military",
            "Central banks"
          ],
          correctAnswer: 1,
          explanation: "Market economies rely on voluntary exchange guided by prices."
        },
        {
          id: 2,
          question: "The three basic economic questions involve:",
          type: "multiple_choice",
          options: [
            "Production, consumption, and trade",
            "What, how, and for whom to produce",
            "Wages, prices, and profits",
            "Demand, supply, and scarcity"
          ],
          correctAnswer: 1,
          explanation: "These determine how resources are allocated in any system."
        },
        {
          id: 3,
          question: "Which system gives the most freedom to individuals?",
          type: "multiple_choice",
          options: [
            "Command economy",
            "Traditional economy",
            "Market economy",
            "Mixed economy"
          ],
          correctAnswer: 2,
          explanation: "Market economies allow private ownership and voluntary choice."
        },
        {
          id: 4,
          question: "Property rights encourage:",
          type: "multiple_choice",
          options: [
            "Government control",
            "Investment and innovation",
            "Central planning",
            "Equal outcomes"
          ],
          correctAnswer: 1,
          explanation: "Ownership motivates people to improve and produce efficiently."
        },
        {
          id: 5,
          question: "In a command economy, prices are determined by:",
          type: "multiple_choice",
          options: [
            "Market supply and demand",
            "Central planners",
            "Private firms",
            "Competition"
          ],
          correctAnswer: 1,
          explanation: "The government sets production targets and prices."
        },
        {
          id: 6,
          question: "Most modern economies are:",
          type: "multiple_choice",
          options: [
            "Pure market",
            "Pure command",
            "Mixed",
            "Traditional only"
          ],
          correctAnswer: 2,
          explanation: "Almost all economies combine markets with regulation and welfare systems."
        },
        {
          id: 7,
          question: "Explain the trade-offs between efficiency and equity in different economic systems.",
          type: "free_response",
          correctAnswer: "Market systems tend to be more efficient but less equal, while command systems may be more equal but less efficient. Mixed systems attempt to balance both goals through market mechanisms with government intervention.",
          explanation: "Understanding these trade-offs helps explain why countries choose different economic policies."
        },
        {
          id: 8,
          question: "What role does government play in a mixed economy, and why is this necessary?",
          type: "free_response",
          correctAnswer: "Government provides public goods, corrects market failures, regulates markets, and provides social safety nets. This is necessary because markets alone cannot address all societal needs like externalities, public goods, and income inequality.",
          explanation: "Mixed economies combine the efficiency of markets with government intervention to address market failures and social goals."
        }
      ]
    },
    "The Law of Demand": {
      title: "Law of Demand Quiz",
      description: "Test your understanding of consumer behavior and demand principles",
      type: "mixed",
      questions: [
        {
          id: 1,
          question: "The Law of Demand shows:",
          type: "multiple_choice",
          options: [
            "A direct relationship between price and demand",
            "An inverse relationship between price and quantity demanded",
            "That demand never changes",
            "Only applies to luxury goods"
          ],
          correctAnswer: 1,
          explanation: "As price rises, quantity demanded falls, all else constant."
        },
        {
          id: 2,
          question: "A movement along the demand curve occurs when:",
          type: "multiple_choice",
          options: [
            "Income changes",
            "Price of the good changes",
            "Population increases",
            "Advertising shifts preferences"
          ],
          correctAnswer: 1,
          explanation: "Only price changes cause movements along the same curve."
        },
        {
          id: 3,
          question: "Which factor would shift demand for a normal good to the right?",
          type: "multiple_choice",
          options: [
            "Decrease in consumer income",
            "Increase in consumer income",
            "Price decrease",
            "Population decline"
          ],
          correctAnswer: 1,
          explanation: "Higher income increases purchasing power for normal goods."
        },
        {
          id: 4,
          question: "A substitute good example for coffee is:",
          type: "multiple_choice",
          options: [
            "Milk",
            "Tea",
            "Sugar",
            "Water"
          ],
          correctAnswer: 1,
          explanation: "When coffee's price rises, consumers switch to tea, a substitute."
        },
        {
          id: 5,
          question: "A complement for cars is:",
          type: "multiple_choice",
          options: [
            "Gasoline",
            "Motorcycles",
            "Bicycles",
            "Public transit"
          ],
          correctAnswer: 0,
          explanation: "Goods consumed together are complements."
        },
        {
          id: 6,
          question: "If consumer tastes shift away from a product:",
          type: "multiple_choice",
          options: [
            "The demand curve shifts right",
            "The demand curve shifts left",
            "Price increases",
            "Quantity demanded increases"
          ],
          correctAnswer: 1,
          explanation: "Lower preference decreases demand at every price."
        },
        {
          id: 7,
          question: "Explain the difference between the substitution effect and the income effect in the Law of Demand.",
          type: "free_response",
          correctAnswer: "The substitution effect occurs when consumers switch to cheaper alternatives when a good's price rises. The income effect occurs when a price change affects consumers' purchasing power, making them feel richer or poorer.",
          explanation: "Both effects work together to create the inverse relationship between price and quantity demanded."
        },
        {
          id: 8,
          question: "What factors can cause a demand curve to shift, and how do they differ from movements along the curve?",
          type: "free_response",
          correctAnswer: "Demand shifts are caused by changes in income, tastes, number of consumers, prices of related goods, or expectations. These differ from movements along the curve, which are caused only by changes in the good's own price.",
          explanation: "Understanding this distinction is crucial for analyzing market changes and consumer behavior."
        }
      ]
    },
    "The Law of Supply": {
      title: "Law of Supply Quiz",
      description: "Test your understanding of producer behavior and supply principles",
      type: "mixed",
      questions: [
        {
          id: 1,
          question: "The Law of Supply shows a relationship between price and quantity supplied that is:",
          type: "multiple_choice",
          options: [
            "Inverse",
            "Constant",
            "Direct",
            "Negative"
          ],
          correctAnswer: 2,
          explanation: "As price rises, producers supply more."
        },
        {
          id: 2,
          question: "A movement along the supply curve occurs when:",
          type: "multiple_choice",
          options: [
            "Input prices change",
            "Technology improves",
            "The product's own price changes",
            "The number of sellers changes"
          ],
          correctAnswer: 2,
          explanation: "Only the product's price causes movement along the curve."
        },
        {
          id: 3,
          question: "A decrease in production cost will:",
          type: "multiple_choice",
          options: [
            "Shift supply left",
            "Shift supply right",
            "Decrease demand",
            "Increase price"
          ],
          correctAnswer: 1,
          explanation: "Lower costs make it cheaper to produce, increasing supply."
        },
        {
          id: 4,
          question: "Which event would shift the supply curve for corn to the left?",
          type: "multiple_choice",
          options: [
            "Improved farming technology",
            "Increase in fertilizer costs",
            "Fall in the price of corn",
            "Rise in consumer income"
          ],
          correctAnswer: 1,
          explanation: "Higher input costs reduce profitability, lowering supply."
        },
        {
          id: 5,
          question: "If new firms enter the market:",
          type: "multiple_choice",
          options: [
            "Supply increases",
            "Demand decreases",
            "Supply decreases",
            "Price rises"
          ],
          correctAnswer: 0,
          explanation: "More producers increase total market supply."
        },
        {
          id: 6,
          question: "Government subsidies to producers generally cause:",
          type: "multiple_choice",
          options: [
            "Lower supply",
            "Higher supply",
            "No effect",
            "Lower efficiency"
          ],
          correctAnswer: 1,
          explanation: "Subsidies lower production costs, encouraging more output."
        },
        {
          id: 7,
          question: "Explain why the supply curve slopes upward and what factors can cause it to shift.",
          type: "free_response",
          correctAnswer: "The supply curve slopes upward because higher prices make production more profitable, encouraging firms to supply more. Factors that shift supply include input prices, technology, number of sellers, government policies, producer expectations, and natural conditions.",
          explanation: "Understanding supply behavior is essential for analyzing market dynamics and producer responses."
        },
        {
          id: 8,
          question: "How do time horizons affect supply elasticity, and why is this important for understanding market behavior?",
          type: "free_response",
          correctAnswer: "Supply is more elastic in the long run because producers can adjust all inputs and production capacity. In the short run, supply is less elastic because some inputs are fixed. This affects how markets respond to price changes over time.",
          explanation: "Time horizons are crucial for understanding how markets adjust to changes and reach equilibrium."
        }
      ]
    },
    "Market Equilibrium": {
      title: "Market Equilibrium Quiz",
      description: "Test your understanding of market balance and price determination",
      type: "mixed",
      questions: [
        {
          id: 1,
          question: "Market equilibrium occurs when:",
          type: "multiple_choice",
          options: [
            "Supply is greater than demand",
            "Demand is greater than supply",
            "Quantity demanded equals quantity supplied",
            "Prices are rising"
          ],
          correctAnswer: 2,
          explanation: "Equilibrium is the stable point where market forces balance."
        },
        {
          id: 2,
          question: "A surplus occurs when:",
          type: "multiple_choice",
          options: [
            "Price is below equilibrium",
            "Price is above equilibrium",
            "Demand shifts right",
            "Supply shifts left"
          ],
          correctAnswer: 1,
          explanation: "High prices encourage too much production relative to demand."
        },
        {
          id: 3,
          question: "A shortage creates:",
          type: "multiple_choice",
          options: [
            "Pressure for price to rise",
            "Pressure for price to fall",
            "No change in price",
            "A new equilibrium immediately"
          ],
          correctAnswer: 0,
          explanation: "Shortages lead consumers to compete, driving prices up."
        },
        {
          id: 4,
          question: "When demand increases, equilibrium price and quantity:",
          type: "multiple_choice",
          options: [
            "Both increase",
            "Both decrease",
            "Price increases, quantity decreases",
            "Price decreases, quantity increases"
          ],
          correctAnswer: 0,
          explanation: "Higher demand raises both the market price and output."
        },
        {
          id: 5,
          question: "When supply increases, equilibrium price:",
          type: "multiple_choice",
          options: [
            "Increases",
            "Decreases",
            "Remains constant",
            "Doubles"
          ],
          correctAnswer: 1,
          explanation: "More supply puts downward pressure on prices."
        },
        {
          id: 6,
          question: "If both demand and supply decrease, equilibrium quantity will:",
          type: "multiple_choice",
          options: [
            "Increase",
            "Decrease",
            "Stay the same",
            "Cannot be determined"
          ],
          correctAnswer: 1,
          explanation: "Both shifts lower total output, though price depends on which curve shifts more."
        },
        {
          id: 7,
          question: "Explain how markets automatically adjust to reach equilibrium when there is a surplus or shortage.",
          type: "free_response",
          correctAnswer: "When there's a surplus (price too high), sellers compete to sell their products, driving prices down until equilibrium is reached. When there's a shortage (price too low), buyers compete for limited goods, driving prices up until equilibrium is reached.",
          explanation: "Market forces naturally push prices toward equilibrium through competition between buyers and sellers."
        },
        {
          id: 8,
          question: "Why does market equilibrium represent an efficient allocation of resources?",
          type: "free_response",
          correctAnswer: "Market equilibrium maximizes total welfare by ensuring resources go to their highest-valued uses. At equilibrium, the marginal benefit to consumers equals the marginal cost to producers, and no mutually beneficial trades are left unexploited.",
          explanation: "Understanding efficiency helps explain why competitive markets are generally preferred over government intervention."
        }
      ]
    },
    "Price Controls (Ceilings and Floors)": {
      title: "Price Controls Quiz",
      description: "Test your understanding of government price interventions and their effects",
      type: "mixed",
      questions: [
        {
          id: 1,
          question: "A price ceiling is:",
          type: "multiple_choice",
          options: [
            "Minimum legal price",
            "Maximum legal price",
            "Equilibrium price",
            "Subsidy"
          ],
          correctAnswer: 1,
          explanation: "It sets the highest price sellers can legally charge."
        },
        {
          id: 2,
          question: "A binding price ceiling causes:",
          type: "multiple_choice",
          options: [
            "Surplus",
            "Shortage",
            "Equilibrium",
            "Higher efficiency"
          ],
          correctAnswer: 1,
          explanation: "At low prices, more people demand than suppliers provide."
        },
        {
          id: 3,
          question: "A price floor is binding if it is:",
          type: "multiple_choice",
          options: [
            "Below equilibrium",
            "Above equilibrium",
            "Equal to equilibrium",
            "Changing constantly"
          ],
          correctAnswer: 1,
          explanation: "It prevents prices from falling to equilibrium, causing surplus."
        },
        {
          id: 4,
          question: "Minimum wage laws are an example of:",
          type: "multiple_choice",
          options: [
            "Price ceiling",
            "Price floor",
            "Market equilibrium",
            "Tax"
          ],
          correctAnswer: 1,
          explanation: "It's a minimum legal price for labor."
        },
        {
          id: 5,
          question: "Rent control may result in:",
          type: "multiple_choice",
          options: [
            "Excess housing supply",
            "Housing shortages",
            "Increased construction",
            "Lower demand for apartments"
          ],
          correctAnswer: 1,
          explanation: "Low rent discourages landlords from supplying housing."
        },
        {
          id: 6,
          question: "A common side effect of price ceilings is:",
          type: "multiple_choice",
          options: [
            "Efficient allocation",
            "Black markets",
            "Higher profits",
            "Lower demand"
          ],
          correctAnswer: 1,
          explanation: "When prices are artificially low, illegal resale can occur at market value."
        },
        {
          id: 7,
          question: "Explain the unintended consequences of price controls and why they often create problems they were meant to solve.",
          type: "free_response",
          correctAnswer: "Price controls often create unintended consequences like shortages (ceilings) or surpluses (floors), black markets, quality degradation, and resource misallocation. They prevent markets from reaching equilibrium, reducing total welfare and creating inefficiencies.",
          explanation: "Understanding these consequences is crucial for evaluating government intervention policies."
        },
        {
          id: 8,
          question: "Compare and contrast price ceilings and price floors in terms of their effects on consumers, producers, and market efficiency.",
          type: "free_response",
          correctAnswer: "Price ceilings help consumers by lowering prices but hurt producers and create shortages. Price floors help producers by raising prices but hurt consumers and create surpluses. Both reduce market efficiency by preventing equilibrium and creating deadweight loss.",
          explanation: "Both types of controls involve trade-offs between helping one group while hurting others and reducing overall market efficiency."
        }
      ]
    },
    "Elasticity": {
      title: "Elasticity Quiz",
      description: "Test your understanding of market responsiveness and elasticity concepts",
      type: "mixed",
      questions: [
        {
          id: 1,
          question: "If demand is elastic, a price increase will:",
          type: "multiple_choice",
          options: [
            "Increase total revenue",
            "Decrease total revenue",
            "Not affect revenue",
            "Increase demand"
          ],
          correctAnswer: 1,
          explanation: "Consumers reduce purchases significantly when prices rise."
        },
        {
          id: 2,
          question: "Perfectly inelastic demand means:",
          type: "multiple_choice",
          options: [
            "Consumers buy none if price rises",
            "Quantity demanded doesn't change",
            "Demand is very responsive",
            "Demand curve slopes downward"
          ],
          correctAnswer: 1,
          explanation: "Consumers buy the same amount regardless of price."
        },
        {
          id: 3,
          question: "If the price of tea rises and demand for coffee increases, these goods are:",
          type: "multiple_choice",
          options: [
            "Complements",
            "Substitutes",
            "Inferior",
            "Unrelated"
          ],
          correctAnswer: 1,
          explanation: "A rise in tea price causes consumers to switch to coffee."
        },
        {
          id: 4,
          question: "If income elasticity is negative, the good is:",
          type: "multiple_choice",
          options: [
            "Normal",
            "Inferior",
            "Luxury",
            "Substitute"
          ],
          correctAnswer: 1,
          explanation: "Demand for inferior goods falls when income rises."
        },
        {
          id: 5,
          question: "Supply tends to be more elastic in the:",
          type: "multiple_choice",
          options: [
            "Short run",
            "Long run",
            "Immediate market period",
            "Recession"
          ],
          correctAnswer: 1,
          explanation: "Producers can adjust production more over time."
        },
        {
          id: 6,
          question: "When demand is unit elastic, total revenue:",
          type: "multiple_choice",
          options: [
            "Increases with price",
            "Decreases with price",
            "Remains constant",
            "Doubles"
          ],
          correctAnswer: 2,
          explanation: "Percentage change in quantity equals percentage change in price."
        },
        {
          id: 7,
          question: "Explain the factors that determine price elasticity of demand and how they affect consumer responsiveness to price changes.",
          type: "free_response",
          correctAnswer: "Factors include availability of substitutes (more substitutes = more elastic), necessity vs luxury (necessities = more inelastic), time horizon (longer time = more elastic), and proportion of income (larger proportion = more elastic).",
          explanation: "Understanding these factors helps predict how consumers will respond to price changes and market conditions."
        },
        {
          id: 8,
          question: "How does elasticity affect government tax policy and business pricing strategies?",
          type: "free_response",
          correctAnswer: "Governments prefer to tax inelastic goods because consumers won't reduce purchases much, maintaining tax revenue. Businesses use elasticity to set prices - elastic demand means lower prices increase revenue, while inelastic demand means higher prices increase revenue.",
          explanation: "Elasticity is crucial for understanding market responses to policies and business decisions."
        }
      ]
    },
    "Consumer and Producer Surplus": {
      title: "Consumer and Producer Surplus Quiz",
      description: "Test your understanding of market welfare and surplus concepts",
      type: "mixed",
      questions: [
        {
          id: 1,
          question: "Consumer surplus represents:",
          type: "multiple_choice",
          options: [
            "Producer profits",
            "Benefit to consumers from paying less than they're willing to",
            "Tax revenue",
            "Wasted resources"
          ],
          correctAnswer: 1,
          explanation: "It measures how much better off consumers are in a transaction."
        },
        {
          id: 2,
          question: "Producer surplus measures:",
          type: "multiple_choice",
          options: [
            "Loss from regulation",
            "Extra benefit producers receive from market prices",
            "Production cost",
            "Consumer savings"
          ],
          correctAnswer: 1,
          explanation: "It's the difference between market price and producer's minimum acceptable price."
        },
        {
          id: 3,
          question: "Market equilibrium maximizes:",
          type: "multiple_choice",
          options: [
            "Deadweight loss",
            "Consumer surplus only",
            "Total surplus",
            "Government efficiency"
          ],
          correctAnswer: 2,
          explanation: "Equilibrium ensures optimal resource allocation."
        },
        {
          id: 4,
          question: "A price ceiling reduces total surplus by creating:",
          type: "multiple_choice",
          options: [
            "Efficiency gain",
            "Deadweight loss",
            "Surplus goods",
            "Higher producer profits"
          ],
          correctAnswer: 1,
          explanation: "Fewer trades occur than in equilibrium."
        },
        {
          id: 5,
          question: "A tax on a good causes:",
          type: "multiple_choice",
          options: [
            "Higher total surplus",
            "Lower total surplus",
            "No change in surplus",
            "Lower government revenue"
          ],
          correctAnswer: 1,
          explanation: "Taxes distort incentives, reducing trade efficiency."
        },
        {
          id: 6,
          question: "Deadweight loss represents:",
          type: "multiple_choice",
          options: [
            "Government profit",
            "Lost welfare due to market distortion",
            "Producer surplus",
            "Consumer savings"
          ],
          correctAnswer: 1,
          explanation: "It's the value of mutually beneficial trades that don't occur."
        },
        {
          id: 7,
          question: "Explain how consumer and producer surplus are calculated and what they represent in terms of market welfare.",
          type: "free_response",
          correctAnswer: "Consumer surplus is the area below the demand curve and above the price line, representing the extra value consumers receive. Producer surplus is the area above the supply curve and below the price line, representing extra profit producers receive. Together they measure total market welfare.",
          explanation: "Understanding surplus helps evaluate market efficiency and the effects of government interventions."
        },
        {
          id: 8,
          question: "Why does market equilibrium maximize total surplus, and how do government interventions affect this efficiency?",
          type: "free_response",
          correctAnswer: "Equilibrium maximizes total surplus because it ensures all mutually beneficial trades occur and resources go to highest-valued uses. Government interventions like price controls or taxes prevent some beneficial trades from occurring, creating deadweight loss and reducing total welfare.",
          explanation: "This principle explains why competitive markets are generally more efficient than government-controlled markets."
        }
      ]
    }
  };

  return quizTemplates[lessonTitle] || null;
}

// Unit test templates for each course
function generateUnitTestsForCourse(courseId, courseTitle) {
  const unitTestTemplates = {
    "Investing 101": {
      title: "Investing 101 Comprehensive Test",
      description: "Final assessment covering all investing fundamentals",
      questions: [
        {
          id: 1,
          question: "Explain the concept of compound interest and provide a real-world example of how it works over 20 years.",
          type: "free_response",
          correctAnswer: "Compound interest is interest earned on both principal and previously earned interest. For example, $1,000 invested at 7% annually grows to $3,870 in 20 years, demonstrating exponential growth.",
          explanation: "Compound interest is powerful because it allows your money to grow exponentially over time."
        },
        {
          id: 2,
          question: "Compare and contrast stocks and bonds in terms of risk, return, and ownership structure.",
          type: "free_response",
          correctAnswer: "Stocks represent ownership in companies with higher risk and potential returns, while bonds are loans with lower risk and fixed returns. Stocks offer partial ownership and voting rights, while bonds offer creditor status.",
          explanation: "Understanding the fundamental differences between stocks and bonds is crucial for investment decisions."
        },
        {
          id: 3,
          question: "What is the primary purpose of diversification in an investment portfolio?",
          options: [
            "To guarantee higher returns",
            "To reduce risk without necessarily reducing returns",
            "To eliminate all investment risk",
            "To avoid paying taxes"
          ],
          correctAnswer: 1,
          explanation: "Diversification reduces risk by spreading investments across different assets, sectors, and regions."
        },
        {
          id: 4,
          question: "Describe three types of investment risk and how to mitigate each one.",
          type: "free_response",
          correctAnswer: "Market risk (diversify across asset classes), company-specific risk (diversify across companies), and inflation risk (invest in assets that typically outpace inflation).",
          explanation: "Understanding different types of risk helps in creating a well-balanced portfolio."
        },
        {
          id: 5,
          question: "What is the time value of money and why is it important for investors?",
          type: "free_response",
          correctAnswer: "Time value of money means money today is worth more than the same amount in the future because it can earn returns. It's important because it emphasizes starting to invest early.",
          explanation: "The time value of money is a fundamental concept that drives the importance of starting to invest early."
        }
      ]
    },
    "AP Microeconomics": {
      title: "AP Microeconomics Unit 1 Comprehensive Test",
      description: "Final assessment covering all Unit 1 microeconomic concepts",
      questions: [
        {
          id: 1,
          question: "Explain the concept of scarcity and how it relates to opportunity cost. Provide a real-world example of a decision you might make and identify the opportunity cost.",
          type: "free_response",
          correctAnswer: "Scarcity is the fundamental economic problem where resources are limited but wants are unlimited. Opportunity cost is the next best alternative forgone when making a choice. Example: Choosing to study economics instead of working part-time - the opportunity cost is the money you could have earned.",
          explanation: "Understanding scarcity and opportunity cost is fundamental to all economic analysis."
        },
        {
          id: 2,
          question: "Draw and explain a Production Possibilities Curve. What do points on the curve, inside the curve, and outside the curve represent?",
          type: "free_response",
          correctAnswer: "Points on the curve represent efficient production using all resources. Points inside represent underutilization/inefficiency. Points outside are unattainable with current resources. The curve shows trade-offs between two goods.",
          explanation: "The PPC is a crucial tool for visualizing economic trade-offs and efficiency."
        },
        {
          id: 3,
          question: "What is the law of increasing opportunity cost, and why does it occur?",
          type: "free_response",
          correctAnswer: "The law states that as more of one good is produced, the opportunity cost of producing additional units increases. This occurs because resources are not equally efficient for all uses - some resources are better suited for certain goods.",
          explanation: "This law explains why PPCs are typically bowed outward rather than straight lines."
        },
        {
          id: 4,
          question: "Compare and contrast absolute advantage and comparative advantage. Which is more important for determining trade patterns?",
          type: "free_response",
          correctAnswer: "Absolute advantage means being able to produce more with the same resources. Comparative advantage means having a lower opportunity cost. Comparative advantage is more important for trade because it determines specialization patterns.",
          explanation: "Understanding this distinction is crucial for analyzing international trade."
        },
        {
          id: 5,
          question: "Explain how specialization and trade can benefit both countries even if one country has an absolute advantage in all goods.",
          type: "free_response",
          correctAnswer: "Even if one country is more efficient in all goods, both countries can still benefit from trade if they have different opportunity costs. Each should specialize in the good where they have comparative advantage, then trade to consume beyond their individual PPCs.",
          explanation: "This principle explains why free trade generally benefits all participating countries."
        },
        {
          id: 6,
          question: "What are the three fundamental economic questions that every society must answer? How do different economic systems answer these questions?",
          type: "free_response",
          correctAnswer: "The three questions are: What to produce? How to produce? For whom to produce? Market economies answer through prices and individual choice, command economies through government planning, and mixed economies through a combination of both.",
          explanation: "These questions define how societies organize their economic systems."
        },
        {
          id: 7,
          question: "What factors can cause a Production Possibilities Curve to shift outward? What would an inward shift indicate?",
          type: "free_response",
          correctAnswer: "Outward shifts are caused by economic growth factors like increased resources, technological progress, improved education, or better infrastructure. Inward shifts indicate economic decline from natural disasters, war, resource depletion, or population decrease.",
          explanation: "Understanding PPC shifts helps analyze economic growth and decline."
        },
        {
          id: 8,
          question: "Explain the role of property rights in different economic systems and how they affect incentives.",
          type: "free_response",
          correctAnswer: "Property rights encourage investment and innovation because people are motivated to improve what they own. Market economies emphasize private property rights, while command economies rely more on public ownership. Clear property rights facilitate trade and reduce conflict.",
          explanation: "Property rights are fundamental to understanding how different economic systems create incentives."
        }
      ]
    }
  };

  return unitTestTemplates[courseTitle] || null;
}

// Generate default quiz for lessons without specific quiz data
function generateDefaultQuiz(lessonId, lessonTitle) {
  return {
    title: `${lessonTitle} Knowledge Check`,
    description: `Test your understanding of ${lessonTitle.toLowerCase()}`,
    type: "mixed",
    questions: [
      {
        id: 1,
        question: `What is the main topic covered in "${lessonTitle}"?`,
        type: "multiple_choice",
        options: [
          "Basic concepts and fundamentals",
          "Advanced strategies and techniques", 
          "Historical background and context",
          "Current market trends and analysis"
        ],
        correctAnswer: 0,
        explanation: "This lesson covers the fundamental concepts and basic understanding of the topic."
      },
      {
        id: 2,
        question: "Which of the following is most important when learning about this topic?",
        type: "short_answer",
        correctAnswer: "Understanding the underlying principles",
        explanation: "Understanding the underlying principles is more important than memorizing specific details."
      },
      {
        id: 3,
        question: "What should you do if you don't understand a concept in this lesson?",
        type: "short_answer",
        correctAnswer: "Review the lesson content again",
        explanation: "If you don't understand a concept, you should review the lesson content to gain better understanding."
      },
      {
        id: 4,
        question: "How often should you review the concepts from this lesson?",
        type: "short_answer",
        correctAnswer: "Periodically to reinforce learning",
        explanation: "Periodic review helps reinforce learning and improves long-term retention."
      },
      {
        id: 5,
        question: "What is the best way to apply what you've learned from this lesson?",
        type: "multiple_choice",
        options: [
          "Keep it theoretical only",
          "Practice with real examples",
          "Tell others about it",
          "Write it down and forget it"
        ],
        correctAnswer: 1,
        explanation: "Practicing with real examples helps you apply and retain the knowledge effectively."
      },
      {
        id: 6,
        question: "Explain in your own words the most important concept you learned from this lesson.",
        type: "free_response",
        correctAnswer: "Answers will vary, but should demonstrate understanding of the lesson's key concepts.",
        explanation: "Being able to explain concepts in your own words shows true understanding and helps with retention."
      },
      {
        id: 7,
        question: "How would you explain this topic to someone who has never heard of it before?",
        type: "short_answer",
        correctAnswer: "Answers will vary, but should provide a clear, simple explanation suitable for beginners.",
        explanation: "Teaching others is one of the best ways to solidify your own understanding of a topic."
      },
      {
        id: 8,
        question: "What is the most practical way to apply this lesson's concepts?",
        type: "short_answer",
        correctAnswer: "Answers will vary, but should suggest real-world application of the lesson concepts.",
        explanation: "Practical application helps reinforce learning and makes concepts more memorable."
      },
      {
        id: 9,
        question: "Describe how this lesson connects to your overall financial education goals.",
        type: "free_response",
        correctAnswer: "Answers will vary, but should demonstrate understanding of how this lesson fits into broader financial knowledge and goals.",
        explanation: "Understanding how individual lessons connect to larger goals helps create a comprehensive learning framework."
      }
    ]
  };
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
