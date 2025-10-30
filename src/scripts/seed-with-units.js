const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding with Unit structure...');

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
    }
  ];

  // Seed daily facts
  console.log('📰 Seeding daily facts...');
  for (const fact of dailyFacts) {
    const existingFact = await prisma.dailyFact.findFirst({
      where: { title: fact.title }
    });
    
    if (!existingFact) {
      await prisma.dailyFact.create({
        data: fact
      });
    }
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
      isLocked: false,
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

  console.log('🎓 Seeding courses...');
  for (const course of courses) {
    const createdCourse = await prisma.course.upsert({
      where: { title: course.title },
      update: course,
      create: course
    });

    console.log(`✅ Course "${course.title}" created/updated`);

    // Create lessons for non-AP courses (Investing 101, Budgeting, Retirement, Insurance)
    if (course.title === "Investing 101") {
      const investingLessons = [
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

**1. Market Risk**
- Definition: Risk that the entire market will decline
- Example: 2008 financial crisis affected most investments
- Mitigation: Diversification across different asset classes

**2. Company-Specific Risk**
- Definition: Risk that a specific company will perform poorly
- Example: A company's stock drops due to bad earnings
- Mitigation: Diversify across many companies

**3. Interest Rate Risk**
- Definition: Risk that rising interest rates will hurt bond prices
- Example: When rates rise, existing bonds become less valuable
- Mitigation: Shorter-term bonds or floating-rate bonds

## Understanding Return

Return is the profit or loss you make on an investment, usually expressed as a percentage.

### Types of Returns

**1. Capital Gains**
- Definition: Profit from selling an investment for more than you paid
- Example: Buy stock at $100, sell at $120 = 20% capital gain

**2. Dividends/Interest**
- Definition: Regular payments from investments
- Example: Stock pays $2 dividend per year on $100 investment = 2% yield

**3. Total Return**
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
- Cryptocurrency: Highly volatile, unpredictable returns`,
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

**Stocks (Equities)**
- Large-Cap: Well-established companies
- Mid-Cap: Medium-sized companies
- Small-Cap: Smaller, growth-oriented companies
- International: Companies outside your home country
- Emerging Markets: Developing countries

**Bonds (Fixed Income)**
- Government Bonds: Backed by governments (safest)
- Corporate Bonds: Issued by companies
- Municipal Bonds: Local government bonds (tax advantages)
- International Bonds: Bonds from other countries

### 2. Geographic Diversification
Invest in different countries and regions to capture global growth and reduce country-specific risk.

### 3. Sector Diversification
Invest across different industries:
- Defensive Sectors: Healthcare, utilities, consumer staples
- Cyclical Sectors: Technology, financials, industrials
- Growth Sectors: Technology, biotechnology, clean energy`,
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
- Automatically diversify your money across many companies
- Have low fees (typically 0.1-0.5% annually)
- Require minimal knowledge to get started
- Perform well over the long term

### 2. The Power of Small Amounts

You don't need thousands of dollars to start investing. Even $25/month can make a significant difference over time:

- $25/month for 30 years at 7% annual return = $30,000
- $100/month for 30 years at 7% annual return = $120,000
- $500/month for 30 years at 7% annual return = $600,000

### 3. Choose Your Investment Account

**For Retirement:**
- 401(k): If your employer offers one, especially with matching
- IRA: Individual Retirement Account (Traditional or Roth)

**For General Investing:**
- Taxable Brokerage Account: For any investment goals
- High-Yield Savings: For emergency fund (3-6 months expenses)

### 4. Dollar-Cost Averaging

Dollar-cost averaging means investing the same amount regularly, regardless of market conditions. This strategy:
- Reduces risk by spreading purchases over time
- Eliminates timing the market
- Builds discipline and consistency
- Smooths out market volatility

### 5. Common Beginner Mistakes to Avoid

❌ Don't Do This:
- Trying to time the market
- Investing money you need soon
- Following hot tips
- Checking daily
- Panic selling

✅ Do This Instead:
- Invest regularly regardless of market conditions
- Keep 3-6 months expenses in emergency fund
- Focus on low-cost index funds
- Check quarterly or annually
- Stay the course during market volatility`,
          order: 5,
          xpValue: 25
        }
      ];

      // Create a unit for Investing 101 course
      const investingUnit = await prisma.unit.upsert({
        where: {
          courseId_title: {
            courseId: createdCourse.id,
            title: "Investing Fundamentals"
          }
        },
        update: {},
        create: {
          courseId: createdCourse.id,
          title: "Investing Fundamentals",
          description: "Learn the basics of investing and building wealth",
          order: 1
        }
      });

      for (const lesson of investingLessons) {
        const existingLesson = await prisma.lesson.findFirst({
          where: {
            title: lesson.title,
            unitId: investingUnit.id
          }
        });

        if (!existingLesson) {
          await prisma.lesson.create({
            data: {
              ...lesson,
              unitId: investingUnit.id
            }
          });
          console.log(`📚 Created lesson: ${lesson.title}`);
        }
      }
    }

    // Add lessons for Budgeting & Taxes course
    if (course.title === "Budgeting & Taxes") {
      const budgetingLessons = [
        {
          title: "Creating Your First Budget",
          content: `# Creating Your First Budget

## Why Budgeting Matters

Budgeting is the foundation of financial success. It helps you:
- Track where your money goes
- Identify spending patterns
- Reach financial goals
- Avoid debt and overspending
- Build emergency savings

## The 50/30/20 Rule

A simple budgeting framework:
- **50% Needs**: Rent, groceries, utilities, minimum debt payments
- **30% Wants**: Entertainment, dining out, hobbies
- **20% Savings**: Emergency fund, retirement, debt payoff

## Step-by-Step Budget Creation

### 1. Calculate Your Income
- Gross income (before taxes)
- Net income (after taxes and deductions)
- Include all sources: salary, freelance, side gigs

### 2. List Your Expenses
**Fixed Expenses** (same every month):
- Rent/mortgage
- Insurance premiums
- Loan payments
- Subscriptions

**Variable Expenses** (change monthly):
- Groceries
- Gas
- Utilities
- Entertainment

### 3. Categorize and Track
Use apps like Mint, YNAB, or simple spreadsheets to track spending.

### 4. Adjust and Optimize
- Cut unnecessary expenses
- Negotiate bills
- Find cheaper alternatives
- Increase income if possible

## Common Budgeting Mistakes to Avoid

❌ **Don't Do This:**
- Guessing at expenses
- Not tracking small purchases
- Being too restrictive
- Not having an emergency fund
- Ignoring irregular expenses

✅ **Do This Instead:**
- Track every expense for 1-2 months
- Use the "envelope method" for categories
- Allow some fun money
- Build 3-6 months emergency fund
- Plan for annual expenses (insurance, taxes)`,
          order: 1,
          xpValue: 25
        },
        {
          title: "Understanding Taxes",
          content: `# Understanding Taxes: The Basics

## Types of Taxes

### Income Taxes
**Federal Income Tax**
- Progressive tax system (higher earners pay more)
- Tax brackets: 10%, 12%, 22%, 24%, 32%, 35%, 37%
- Withheld from paycheck (W-4 form controls amount)

**State Income Tax**
- Varies by state (some states have no income tax)
- Examples: CA (high), TX (none), FL (none)

**Local Income Tax**
- Some cities/counties have additional income tax
- Examples: NYC, Philadelphia

### Other Important Taxes
**Social Security Tax**: 6.2% (up to wage limit)
**Medicare Tax**: 1.45% (unlimited)
**Sales Tax**: Varies by state/city (0-10%+)
**Property Tax**: Based on home value
**Capital Gains Tax**: On investment profits

## Tax Forms You Need to Know

**W-2**: Shows wages and taxes withheld (from employer)
**1099**: Shows freelance/contract income
**W-4**: Controls tax withholding from paycheck
**1040**: Main tax return form
**Schedule A**: Itemized deductions
**Schedule B**: Interest and dividend income

## Tax Deductions vs Credits

### Deductions
- Reduce your taxable income
- Examples: mortgage interest, charitable donations, student loan interest
- Standard deduction vs. itemized deductions

### Credits
- Directly reduce your tax bill
- Examples: Child Tax Credit, Earned Income Credit, Education Credits
- More valuable than deductions

## Tax-Advantaged Accounts

**401(k)**: Pre-tax contributions, tax-deferred growth
**IRA**: Individual retirement account
**Roth IRA**: After-tax contributions, tax-free growth
**HSA**: Health savings account (triple tax advantage)
**529 Plan**: Education savings (tax-free growth)

## Tax Planning Strategies

1. **Maximize Retirement Contributions**
2. **Use Tax-Advantaged Accounts**
3. **Time Income and Deductions**
4. **Consider Roth Conversions**
5. **Plan for Capital Gains**
6. **Keep Good Records**

## Common Tax Mistakes

❌ **Avoid These:**
- Not keeping receipts
- Missing deductions
- Incorrect filing status
- Not reporting all income
- Missing deadlines

✅ **Best Practices:**
- Keep organized records
- Use tax software or professional
- File on time
- Report all income
- Plan ahead for next year`,
          order: 2,
          xpValue: 25
        },
        {
          title: "Filing Your Taxes",
          content: `# Filing Your Taxes: A Step-by-Step Guide

## When to File

**Tax Season**: January 1 - April 15
**Deadline**: April 15 (or next business day if weekend/holiday)
**Extensions**: File Form 4868 for 6-month extension (payments still due)

## What You Need to File

### Essential Documents
- W-2 forms (from all employers)
- 1099 forms (freelance, interest, dividends)
- Bank statements
- Receipts for deductions
- Previous year's tax return

### Additional Documents (if applicable)
- Mortgage statements
- Charitable donation receipts
- Medical expense receipts
- Education expense records
- Business expense receipts

## Filing Options

### 1. Free File (IRS.gov)
- Free for income under $73,000
- Guided software
- Direct e-filing

### 2. Tax Software
- TurboTax, H&R Block, TaxAct
- Cost: $0-$200+ depending on complexity
- Import documents automatically
- Error checking included

### 3. Professional Tax Preparer
- CPA or Enrolled Agent
- Cost: $200-$500+
- Best for complex situations
- Audit representation

### 4. Paper Filing
- Download forms from IRS.gov
- Mail to appropriate address
- Takes longer to process

## Step-by-Step Filing Process

### 1. Gather All Documents
- Collect W-2s, 1099s, receipts
- Organize by category
- Check for missing forms

### 2. Choose Your Filing Method
- Consider complexity and cost
- Free options available for simple returns

### 3. Enter Your Information
- Personal information
- Income from all sources
- Deductions and credits
- Review for accuracy

### 4. Review and Submit
- Double-check all numbers
- Sign electronically or print and mail
- Keep copies of everything

## Common Filing Mistakes

❌ **Errors to Avoid:**
- Wrong Social Security numbers
- Incorrect filing status
- Math errors
- Missing signatures
- Wrong bank account numbers

✅ **Prevention Tips:**
- Use tax software (reduces errors)
- Double-check all entries
- File electronically (faster processing)
- Keep copies of everything
- File on time to avoid penalties

## After Filing

### If You're Getting a Refund
- Check status at IRS.gov "Where's My Refund?"
- Direct deposit is fastest (1-3 weeks)
- Paper check takes longer (4-6 weeks)

### If You Owe Money
- Pay by April 15 to avoid penalties
- Payment options: online, phone, mail
- Set up payment plan if needed

### Keep Records
- Keep tax returns for 3-7 years
- Keep supporting documents
- Store securely (fireproof safe or digital)

## Planning for Next Year

1. **Adjust Withholding** if refund/tax owed is large
2. **Increase Retirement Contributions**
3. **Track Deductions Better**
4. **Consider Tax-Advantaged Accounts**
5. **Plan Major Purchases**`,
          order: 3,
          xpValue: 25
        },
        {
          title: "Tax-Advantaged Accounts",
          content: `# Tax-Advantaged Accounts: Maximize Your Savings

## What Are Tax-Advantaged Accounts?

Accounts that offer special tax benefits to encourage saving for specific goals like retirement, education, or healthcare.

## Retirement Accounts

### Traditional 401(k)
**How it works:**
- Contributions reduce taxable income
- Money grows tax-deferred
- Taxes paid when withdrawn in retirement

**Benefits:**
- Immediate tax savings
- Employer matching (free money!)
- Higher contribution limits
- Automatic payroll deduction

**Limits (2024):**
- Employee contribution: $23,000
- Catch-up (50+): Additional $7,500
- Total with employer: $69,000

### Traditional IRA
**How it works:**
- Similar to 401(k) but individual account
- Contributions may be tax-deductible
- Tax-deferred growth

**Benefits:**
- More investment options
- Lower fees than some 401(k)s
- Can open anywhere

**Limits (2024):**
- Contribution: $7,000
- Catch-up (50+): Additional $1,000

### Roth 401(k) & Roth IRA
**How it works:**
- Contributions made with after-tax money
- Money grows tax-free
- Qualified withdrawals are tax-free

**Benefits:**
- Tax-free growth
- No required minimum distributions
- Better for young investors
- Tax diversification

**Limits:**
- Same as traditional versions
- Income limits for Roth IRA

## Education Savings

### 529 Plans
**How it works:**
- State-sponsored education savings
- Tax-free growth
- Tax-free withdrawals for qualified education expenses

**Benefits:**
- High contribution limits
- Can be used for K-12 and college
- Transferable between family members
- State tax deductions (varies by state)

**Limits:**
- Varies by state (often $300,000+ per beneficiary)

### Coverdell ESA
**How it works:**
- Education savings account
- Tax-free growth and withdrawals
- Can be used for K-12 and college

**Limits:**
- $2,000 per year per beneficiary
- Income limits apply

## Healthcare Savings

### Health Savings Account (HSA)
**How it works:**
- Must have high-deductible health plan
- Triple tax advantage: deductible contributions, tax-free growth, tax-free withdrawals

**Benefits:**
- Contributions reduce taxable income
- Tax-free growth
- Tax-free withdrawals for medical expenses
- Can invest funds
- Portable (keeps with you)

**Limits (2024):**
- Individual: $4,300
- Family: $8,600
- Catch-up (55+): Additional $1,000

### Flexible Spending Account (FSA)
**How it works:**
- Employer-sponsored
- Pre-tax contributions
- Use-it-or-lose-it (with some rollover)

**Types:**
- Healthcare FSA
- Dependent Care FSA

## Choosing the Right Accounts

### Priority Order:
1. **401(k) with employer match** (free money!)
2. **HSA** (if eligible)
3. **Roth IRA** (if income allows)
4. **Max out 401(k)**
5. **529 Plan** (for education goals)

### Factors to Consider:
- **Age**: Younger = more Roth, older = more traditional
- **Income**: Higher = traditional benefits more
- **Tax bracket**: Current vs. expected retirement
- **Employer benefits**: Matching, HSA contributions
- **Goals**: Retirement vs. education vs. healthcare

## Common Mistakes

❌ **Avoid These:**
- Not taking employer match
- Not maxing out HSA
- Wrong account type for your situation
- Not considering tax diversification
- Early withdrawals (penalties!)

✅ **Best Practices:**
- Start early and contribute regularly
- Take advantage of employer matches
- Consider tax diversification
- Keep emergency fund separate
- Review and rebalance annually`,
          order: 4,
          xpValue: 25
        }
      ];

      // Create a unit for Budgeting & Taxes course
      const budgetingUnit = await prisma.unit.upsert({
        where: {
          courseId_title: {
            courseId: createdCourse.id,
            title: "Budgeting & Tax Fundamentals"
          }
        },
        update: {},
        create: {
          courseId: createdCourse.id,
          title: "Budgeting & Tax Fundamentals",
          description: "Master budgeting and understand tax basics",
          order: 1
        }
      });

      for (const lesson of budgetingLessons) {
        const existingLesson = await prisma.lesson.findFirst({
          where: {
            title: lesson.title,
            unitId: budgetingUnit.id
          }
        });

        if (!existingLesson) {
          await prisma.lesson.create({
            data: {
              ...lesson,
              unitId: budgetingUnit.id
            }
          });
          console.log(`📚 Created lesson: ${lesson.title}`);
        }
      }
    }

    // Add lessons for Retirement Basics course
    if (course.title === "Retirement Basics") {
      const retirementLessons = [
        {
          title: "Why Start Early?",
          content: `# Why Start Early? The Power of Time in Retirement Planning

## The Magic of Compound Interest

Starting early is the single most important factor in retirement success. Here's why:

### The Numbers Don't Lie
**Starting at Age 25:**
- Invest $200/month for 40 years
- At 7% annual return = $525,000
- Total invested: $96,000

**Starting at Age 35:**
- Invest $200/month for 30 years  
- At 7% annual return = $244,000
- Total invested: $72,000

**Starting at Age 45:**
- Invest $200/month for 20 years
- At 7% annual return = $98,000
- Total invested: $48,000

**The 10-year head start is worth $281,000!**

## Time Value of Money

### The Rule of 72
Divide 72 by your annual return rate to find how long it takes to double your money:
- 7% return = doubles every 10.3 years
- 10% return = doubles every 7.2 years
- 12% return = doubles every 6 years

### The Snowball Effect
Early investments have more time to:
- Compound and grow
- Recover from market downturns
- Benefit from dollar-cost averaging
- Take advantage of employer matches

## Common Excuses (And Why They're Wrong)

### "I'm Too Young to Think About Retirement"
❌ **Wrong**: The earlier you start, the less you need to save
✅ **Right**: Even $25/month at 22 can grow to $500,000+ by retirement

### "I Don't Make Enough Money"
❌ **Wrong**: Small amounts compound significantly over time
✅ **Right**: Start with 1% of income, increase gradually

### "I'll Start When I Make More Money"
❌ **Wrong**: Lifestyle inflation often prevents this
✅ **Right**: Start now, increase contributions with raises

### "The Market is Too Risky"
❌ **Wrong**: Not investing is riskier than investing
✅ **Right**: Diversify and stay the course long-term

## How to Start Early

### 1. Start Small
- Even $25/month makes a difference
- Increase gradually as income grows
- Focus on consistency over amount

### 2. Automate Everything
- Set up automatic transfers
- Use employer 401(k) if available
- Make it invisible to your spending

### 3. Take Free Money
- Always get employer 401(k) match
- It's literally free money!
- Even 3% match doubles your contribution

### 4. Increase Over Time
- Increase contributions with raises
- Use "save more tomorrow" strategy
- Aim for 15% of income eventually

## The Cost of Waiting

### Every Year You Wait Costs You:
- **Age 25**: $0 cost (you're starting!)
- **Age 26**: $2,400 less at retirement
- **Age 30**: $12,000 less at retirement
- **Age 35**: $30,000 less at retirement
- **Age 40**: $60,000 less at retirement

### The "Catch-Up" Reality
To catch up for starting late, you need to:
- Save much more per month
- Work longer
- Take more risk
- Accept lower retirement lifestyle

## Action Steps

### This Week:
1. **Calculate** how much you can save monthly
2. **Open** a retirement account (401(k) or IRA)
3. **Set up** automatic contributions
4. **Research** employer matching

### This Month:
1. **Increase** contribution by 1%
2. **Learn** about investment options
3. **Set** a goal to increase annually
4. **Track** your progress

### This Year:
1. **Maximize** employer match
2. **Increase** to 10% of income
3. **Consider** Roth vs. Traditional
4. **Review** and rebalance portfolio

## The Bottom Line

Starting early isn't just about money—it's about:
- **Freedom**: Financial independence
- **Options**: Career changes, sabbaticals
- **Security**: Peace of mind
- **Legacy**: Leaving money for family

**The best time to start was yesterday. The second best time is today.**`,
          order: 1,
          xpValue: 25
        },
        {
          title: "401(k) Basics",
          content: `# 401(k) Basics: Your Employer-Sponsored Retirement Plan

## What is a 401(k)?

A 401(k) is an employer-sponsored retirement savings plan that allows you to save money for retirement with significant tax advantages.

### Key Features:
- **Pre-tax contributions**: Reduce your taxable income
- **Tax-deferred growth**: No taxes on gains until withdrawal
- **Employer matching**: Free money from your employer
- **High contribution limits**: Much higher than IRAs
- **Automatic payroll deduction**: Easy and consistent saving

## How 401(k) Works

### The Process:
1. **You contribute** pre-tax money from your paycheck
2. **Your employer** may match a portion (free money!)
3. **Money grows** tax-deferred in your chosen investments
4. **You pay taxes** when you withdraw in retirement

### Example:
- Salary: $50,000
- 401(k) contribution: $5,000 (10%)
- Taxable income: $45,000
- Employer match: $2,500 (5%)
- Total in 401(k): $7,500

## Types of 401(k) Plans

### Traditional 401(k)
- **Contributions**: Pre-tax (reduce taxable income)
- **Growth**: Tax-deferred
- **Withdrawals**: Taxed as ordinary income
- **Required Minimum Distributions**: Yes, starting at age 73

### Roth 401(k)
- **Contributions**: After-tax (no immediate tax benefit)
- **Growth**: Tax-free
- **Withdrawals**: Tax-free (if qualified)
- **Required Minimum Distributions**: Yes, but can roll to Roth IRA

### Which Should You Choose?
**Traditional 401(k) if:**
- You're in a high tax bracket now
- You expect lower taxes in retirement
- You want immediate tax savings

**Roth 401(k) if:**
- You're in a low tax bracket now
- You expect higher taxes in retirement
- You want tax-free growth

## Contribution Limits (2024)

### Employee Contributions:
- **Under 50**: $23,000
- **50 and over**: $30,500 (includes $7,500 catch-up)

### Total Contributions (including employer):
- **Under 50**: $69,000
- **50 and over**: $76,500

### Important Notes:
- Limits apply per person, not per job
- Employer match doesn't count toward employee limit
- Catch-up contributions are additional

## Employer Matching

### Common Matching Formulas:
- **100% match up to 3%**: Employer matches dollar-for-dollar up to 3% of salary
- **50% match up to 6%**: Employer matches 50 cents for every dollar up to 6%
- **Tiered matching**: Different rates for different contribution levels

### Example Matching Scenarios:
**Scenario 1**: 100% match up to 3%
- You contribute 3% of $50,000 = $1,500
- Employer contributes $1,500
- Total: $3,000

**Scenario 2**: 50% match up to 6%
- You contribute 6% of $50,000 = $3,000
- Employer contributes $1,500
- Total: $4,500

### The "Free Money" Rule:
**Always contribute enough to get the full employer match!** It's literally free money.

## Investment Options

### Typical 401(k) Investments:
- **Target-date funds**: Automatically adjust based on retirement date
- **Index funds**: Low-cost, broad market exposure
- **Mutual funds**: Professionally managed portfolios
- **Company stock**: Your employer's stock (use cautiously)

### Choosing Investments:
1. **Start with target-date funds** (easiest option)
2. **Consider your age and risk tolerance**
3. **Diversify across asset classes**
4. **Keep costs low** (expense ratios matter)
5. **Rebalance annually**

## Vesting

### What is Vesting?
Vesting determines when you own the employer contributions.

### Common Vesting Schedules:
- **Immediate**: You own employer contributions immediately
- **Graded**: You gain ownership over time (e.g., 20% per year)
- **Cliff**: You own nothing until fully vested (e.g., 100% after 3 years)

### Example:
- 3-year cliff vesting
- You leave after 2 years
- You keep your contributions + earnings
- You lose employer contributions

## Withdrawals and Loans

### When You Can Withdraw:
- **Age 59½**: No penalty (still pay taxes)
- **Hardship**: Medical expenses, home purchase, education
- **Separation**: When you leave the job
- **Death/Disability**: Special circumstances

### Early Withdrawal Penalties:
- **Under 59½**: 10% penalty + taxes
- **Exceptions**: Death, disability, medical expenses, first-time home purchase

### 401(k) Loans:
- **Maximum**: $50,000 or 50% of account value
- **Interest**: Usually prime rate + 1-2%
- **Repayment**: 5 years (longer for home purchase)
- **Risk**: If you leave job, loan becomes withdrawal

## Maximizing Your 401(k)

### Step-by-Step Strategy:
1. **Start immediately** (even if small amount)
2. **Get full employer match** (free money!)
3. **Increase gradually** (1% per year)
4. **Aim for 15%** of income eventually
5. **Max out if possible** ($23,000 in 2024)

### Pro Tips:
- **Increase with raises**: Don't feel the difference
- **Use catch-up contributions**: If 50+
- **Consider Roth 401(k)**: For tax diversification
- **Roll over when changing jobs**: Don't cash out
- **Review investments annually**: Rebalance as needed

## Common Mistakes

❌ **Avoid These:**
- Not contributing enough for employer match
- Cashing out when changing jobs
- Taking loans for non-essential expenses
- Not increasing contributions over time
- Ignoring investment options

✅ **Best Practices:**
- Contribute at least enough for full match
- Roll over to new employer or IRA
- Use loans only for emergencies
- Increase contributions annually
- Choose low-cost, diversified investments`,
          order: 2,
          xpValue: 25
        },
        {
          title: "IRA Basics",
          content: `# IRA Basics: Individual Retirement Accounts

## What is an IRA?

An Individual Retirement Account (IRA) is a personal retirement savings account that offers tax advantages. Unlike a 401(k), you open and manage an IRA yourself.

### Key Benefits:
- **Tax advantages**: Traditional (pre-tax) or Roth (tax-free growth)
- **Investment flexibility**: Choose your own investments
- **Portability**: Keep it when changing jobs
- **Lower fees**: Often lower than 401(k) plans
- **Accessibility**: Available to everyone with earned income

## Types of IRAs

### Traditional IRA
**How it works:**
- Contributions may be tax-deductible
- Money grows tax-deferred
- Taxes paid when withdrawn in retirement

**Tax Deductibility (2024):**
- **Single, no 401(k)**: Full deduction up to limit
- **Single, has 401(k)**: Phase-out $73,000-$83,000
- **Married, no 401(k)**: Full deduction up to limit
- **Married, has 401(k)**: Phase-out $116,000-$136,000

### Roth IRA
**How it works:**
- Contributions made with after-tax money
- Money grows tax-free
- Qualified withdrawals are tax-free

**Income Limits (2024):**
- **Single**: Phase-out $138,000-$153,000
- **Married filing jointly**: Phase-out $218,000-$228,000

### Which Should You Choose?

**Choose Traditional IRA if:**
- You're in a high tax bracket now
- You expect lower taxes in retirement
- You want immediate tax deduction
- You're not eligible for Roth IRA

**Choose Roth IRA if:**
- You're in a low tax bracket now
- You expect higher taxes in retirement
- You want tax-free growth
- You're under income limits
- You're young (more time for tax-free growth)

## Contribution Limits (2024)

### Annual Limits:
- **Under 50**: $7,000
- **50 and over**: $8,000 (includes $1,000 catch-up)

### Important Rules:
- **Earned income required**: Must have wages, salary, or self-employment income
- **Cannot exceed earned income**: Can't contribute more than you earned
- **Spousal IRA**: Non-working spouse can contribute based on working spouse's income
- **Deadline**: April 15 of following year (same as tax filing)

## Opening an IRA

### Where to Open:
**Online Brokers:**
- Fidelity, Vanguard, Charles Schwab
- Low fees, good investment options
- User-friendly platforms

**Robo-Advisors:**
- Betterment, Wealthfront
- Automated investing
- Higher fees but easier management

**Banks:**
- Often limited investment options
- May have higher fees
- Convenient if you bank there

### What You Need:
- Social Security number
- Bank account information
- Employment information
- Beneficiary information

## Investment Options

### What You Can Invest In:
- **Stocks**: Individual companies
- **Bonds**: Government and corporate bonds
- **Mutual funds**: Professionally managed portfolios
- **ETFs**: Exchange-traded funds
- **Index funds**: Track market indexes
- **CDs**: Certificates of deposit
- **REITs**: Real estate investment trusts

### Recommended Strategy:
1. **Start with target-date funds** (easiest)
2. **Use index funds** (low cost, diversified)
3. **Consider your age** (younger = more stocks)
4. **Keep costs low** (expense ratios matter)
5. **Rebalance annually**

## Withdrawals

### Traditional IRA Withdrawals:
**Age 59½ and older:**
- No penalty
- Pay ordinary income tax
- Required Minimum Distributions (RMDs) start at age 73

**Under age 59½:**
- 10% penalty + ordinary income tax
- Exceptions: death, disability, first-time home purchase, medical expenses

### Roth IRA Withdrawals:
**Qualified distributions (age 59½ + 5 years):**
- Tax-free and penalty-free
- Can withdraw contributions anytime (not earnings)

**Non-qualified distributions:**
- Contributions: Tax-free and penalty-free
- Earnings: Tax + 10% penalty

## Required Minimum Distributions (RMDs)

### Traditional IRA:
- **Start age**: 73 (2024+)
- **Calculation**: Account balance ÷ life expectancy factor
- **Penalty**: 25% of amount not withdrawn
- **No RMDs**: Roth IRAs (but inherited Roth IRAs have RMDs)

### Strategies:
- **Convert to Roth**: Before RMDs start
- **Donate to charity**: Qualified Charitable Distributions
- **Plan withdrawals**: Consider tax implications

## IRA vs 401(k)

| Feature | IRA | 401(k) |
|---------|-----|--------|
| **Contribution Limit** | $7,000 | $23,000 |
| **Employer Match** | No | Yes |
| **Investment Options** | Unlimited | Limited |
| **Fees** | Often lower | Often higher |
| **Portability** | Always portable | Must roll over |
| **Loans** | No | Yes |

## Maximizing Your IRA

### Step-by-Step Strategy:
1. **Open IRA** with low-cost provider
2. **Set up automatic contributions** (monthly)
3. **Choose appropriate investments** (target-date or index funds)
4. **Increase contributions** over time
5. **Consider Roth conversion** if beneficial

### Pro Tips:
- **Start early**: Even small amounts compound significantly
- **Contribute regularly**: Dollar-cost averaging
- **Max out if possible**: $7,000 annually
- **Use catch-up contributions**: If 50+
- **Consider backdoor Roth**: If income too high for direct Roth

## Common Mistakes

❌ **Avoid These:**
- Not contributing because of low limits
- Choosing wrong IRA type for your situation
- Not investing the money (leaving in cash)
- Taking early withdrawals
- Not naming beneficiaries

✅ **Best Practices:**
- Contribute regularly, even small amounts
- Choose IRA type based on tax situation
- Invest in diversified, low-cost funds
- Keep money invested until retirement
- Update beneficiaries regularly

## Action Steps

### This Week:
1. **Research** IRA providers (Fidelity, Vanguard, Schwab)
2. **Calculate** how much you can contribute monthly
3. **Decide** between Traditional and Roth
4. **Gather** required documents

### This Month:
1. **Open** IRA account
2. **Set up** automatic contributions
3. **Choose** initial investments
4. **Set** goal to increase contributions

### This Year:
1. **Max out** contributions if possible
2. **Review** and rebalance investments
3. **Consider** Roth conversion if beneficial
4. **Plan** for next year's contributions`,
          order: 3,
          xpValue: 25
        }
      ];

      // Create a unit for Retirement Basics course
      const retirementUnit = await prisma.unit.upsert({
        where: {
          courseId_title: {
            courseId: createdCourse.id,
            title: "Retirement Planning Fundamentals"
          }
        },
        update: {},
        create: {
          courseId: createdCourse.id,
          title: "Retirement Planning Fundamentals",
          description: "Plan for your future with retirement accounts",
          order: 1
        }
      });

      for (const lesson of retirementLessons) {
        const existingLesson = await prisma.lesson.findFirst({
          where: {
            title: lesson.title,
            unitId: retirementUnit.id
          }
        });

        if (!existingLesson) {
          await prisma.lesson.create({
            data: {
              ...lesson,
              unitId: retirementUnit.id
            }
          });
          console.log(`📚 Created lesson: ${lesson.title}`);
        }
      }
    }

    // Add lessons for Insurance Essentials course
    if (course.title === "Insurance Essentials") {
      const insuranceLessons = [
        {
          title: "Types of Insurance",
          content: `# Types of Insurance: Protecting What Matters

## What is Insurance?

Insurance is a financial safety net that protects you from unexpected losses. You pay a small amount (premium) regularly to avoid paying a large amount if something bad happens.

### How Insurance Works:
- **Premium**: Regular payment you make
- **Deductible**: Amount you pay before insurance kicks in
- **Coverage**: Maximum amount insurance will pay
- **Claim**: Request for payment when loss occurs

## Essential Types of Insurance

### 1. Health Insurance
**What it covers:**
- Doctor visits and hospital stays
- Prescription medications
- Preventive care
- Emergency services

**Types:**
- **HMO**: Lower cost, must use network doctors
- **PPO**: Higher cost, can use any doctor
- **HDHP**: High deductible, often with HSA
- **Medicare**: For those 65+ or with disabilities

**Why you need it:**
- Medical bills can bankrupt you
- Required by law (with some exceptions)
- Provides access to preventive care

### 2. Auto Insurance
**What it covers:**
- **Liability**: Damage you cause to others
- **Collision**: Damage to your car from accidents
- **Comprehensive**: Non-collision damage (theft, weather)
- **Uninsured/Underinsured**: Protection from uninsured drivers

**Required coverage:**
- **Liability**: Required in most states
- **Personal Injury Protection**: Required in some states
- **Uninsured Motorist**: Required in some states

**Optional coverage:**
- **Collision**: If you have a loan on your car
- **Comprehensive**: If you want full protection
- **Gap insurance**: If you owe more than car is worth

### 3. Homeowners/Renters Insurance
**Homeowners covers:**
- **Dwelling**: Structure of your home
- **Personal property**: Your belongings
- **Liability**: If someone gets hurt on your property
- **Additional living expenses**: If home is uninhabitable

**Renters covers:**
- **Personal property**: Your belongings
- **Liability**: If someone gets hurt in your rental
- **Additional living expenses**: If rental is uninhabitable

**Why you need it:**
- **Homeowners**: Required by mortgage lenders
- **Renters**: Protects your belongings (landlord's insurance doesn't)
- **Both**: Liability protection is crucial

### 4. Life Insurance
**What it covers:**
- **Death benefit**: Money paid to beneficiaries
- **Term life**: Coverage for specific period (cheaper)
- **Whole life**: Coverage for life + cash value (expensive)

**Who needs it:**
- **Parents**: To provide for children
- **Breadwinners**: To replace lost income
- **Debt holders**: To pay off debts
- **Business owners**: To protect business

**How much coverage:**
- **Rule of thumb**: 10-12x annual income
- **Consider**: Debts, children's education, spouse's needs
- **Factor in**: Existing savings, other income sources

### 5. Disability Insurance
**What it covers:**
- **Income replacement**: If you can't work due to illness/injury
- **Short-term**: Coverage for weeks/months
- **Long-term**: Coverage for years/lifetime

**Types:**
- **Employer-provided**: Often short-term only
- **Individual**: More comprehensive, portable
- **Social Security**: Limited, hard to qualify

**Why you need it:**
- **Higher risk**: More likely than death for young people
- **Income protection**: Maintains lifestyle if disabled
- **Peace of mind**: Financial security during difficult times

## Additional Insurance Types

### 6. Umbrella Insurance
**What it covers:**
- **Excess liability**: Beyond auto/home insurance limits
- **High-value claims**: Lawsuits, libel, slander
- **Worldwide coverage**: Not just at home

**Who needs it:**
- **High net worth**: Assets to protect
- **High risk**: Professionals, landlords
- **Peace of mind**: Extra protection

### 7. Long-Term Care Insurance
**What it covers:**
- **Nursing home care**: Skilled nursing facilities
- **Assisted living**: Help with daily activities
- **Home care**: Care in your own home

**Who needs it:**
- **Older adults**: Higher risk of needing care
- **Asset protection**: Preserve wealth for family
- **Quality care**: Choose where you receive care

## How to Choose Insurance

### Step 1: Assess Your Needs
- **What do you own?**: Home, car, valuable possessions
- **Who depends on you?**: Spouse, children, parents
- **What are your risks?**: Job, health, lifestyle

### Step 2: Determine Coverage Amounts
- **Life insurance**: 10-12x income + debts
- **Disability insurance**: 60-70% of income
- **Home insurance**: Replacement cost of home
- **Auto insurance**: State minimums + collision/comprehensive

### Step 3: Shop Around
- **Compare quotes**: From multiple companies
- **Check ratings**: A.M. Best, Moody's, Standard & Poor's
- **Read reviews**: Customer satisfaction, claims handling
- **Consider bundling**: Often saves money

### Step 4: Review Regularly
- **Annual review**: Life changes affect needs
- **Major life events**: Marriage, children, new job
- **Market changes**: New products, better rates

## Common Insurance Mistakes

❌ **Avoid These:**
- **Underinsuring**: Not enough coverage
- **Overinsuring**: Paying for unnecessary coverage
- **Not shopping around**: Missing better deals
- **Ignoring deductibles**: Choosing wrong deductible
- **Not reading policies**: Not understanding coverage

✅ **Best Practices:**
- **Adequate coverage**: Protect what matters
- **Regular reviews**: Update as life changes
- **Shop around**: Compare quotes annually
- **Understand policies**: Know what's covered
- **Bundle when possible**: Save money

## Insurance Priority Order

### Must-Have (Essential):
1. **Health insurance**: Required and critical
2. **Auto insurance**: Required by law
3. **Renters/Homeowners**: Protect your home/possessions

### Should-Have (Important):
4. **Life insurance**: If others depend on you
5. **Disability insurance**: Protect your income

### Nice-to-Have (Optional):
6. **Umbrella insurance**: Extra liability protection
7. **Long-term care**: If you're older or have assets

## Action Steps

### This Week:
1. **Inventory** your current insurance coverage
2. **Identify** gaps in your protection
3. **Research** insurance companies and ratings
4. **Get quotes** for missing coverage

### This Month:
1. **Purchase** essential insurance you're missing
2. **Review** existing policies for adequacy
3. **Compare** rates with other companies
4. **Update** beneficiaries and contact information

### This Year:
1. **Review** all policies annually
2. **Adjust** coverage as life changes
3. **Shop around** for better rates
4. **Consider** additional coverage as needed`,
          order: 1,
          xpValue: 25
        },
        {
          title: "Renters Insurance",
          content: `# Renters Insurance: Protecting Your Belongings

## What is Renters Insurance?

Renters insurance protects your personal belongings and provides liability coverage when you rent a home, apartment, or condo. It's often misunderstood but incredibly important.

### What Many People Don't Know:
- **Landlord's insurance doesn't cover your stuff**
- **Renters insurance is surprisingly affordable**
- **It covers more than just your belongings**
- **It's required by many landlords**

## What Renters Insurance Covers

### 1. Personal Property
**Your belongings are protected from:**
- **Fire and smoke damage**
- **Theft and vandalism**
- **Water damage** (from burst pipes, not floods)
- **Wind and hail damage**
- **Lightning strikes**
- **Explosions**
- **Riots and civil unrest**

**What's typically covered:**
- Furniture and electronics
- Clothing and jewelry
- Kitchen appliances
- Sports equipment
- Musical instruments
- Books and collectibles

### 2. Liability Protection
**Protects you if:**
- Someone gets hurt in your rental
- You accidentally damage someone else's property
- Your dog bites someone
- You're sued for covered incidents

**Coverage amounts:**
- **Standard**: $100,000-$300,000
- **Higher limits**: Available for additional premium
- **Legal defense**: Included in liability coverage

### 3. Additional Living Expenses
**Covers costs if your rental becomes uninhabitable:**
- **Hotel stays**
- **Restaurant meals**
- **Laundry services**
- **Pet boarding**
- **Storage fees**

**Typical coverage**: 10-20% of personal property limit

## Types of Coverage

### Actual Cash Value (ACV)
- **How it works**: Replaces items minus depreciation
- **Cost**: Lower premium
- **Example**: 5-year-old laptop worth $200, not $1,000

### Replacement Cost Value (RCV)
- **How it works**: Replaces items at current market value
- **Cost**: Higher premium
- **Example**: 5-year-old laptop replaced with similar new laptop

### Which Should You Choose?
- **RCV recommended**: Better protection for your money
- **ACV okay**: If you're on a tight budget
- **Consider**: Age and value of your belongings

## How Much Coverage Do You Need?

### Step 1: Inventory Your Belongings
**Create a detailed list:**
- **Room by room**: Go through each space
- **Take photos**: Visual record of your items
- **Keep receipts**: Proof of purchase and value
- **Use apps**: Many free home inventory apps available

### Step 2: Calculate Total Value
**Common categories:**
- **Furniture**: $2,000-$10,000
- **Electronics**: $1,000-$5,000
- **Clothing**: $1,000-$3,000
- **Kitchen items**: $500-$2,000
- **Sports equipment**: $500-$2,000
- **Jewelry**: $500-$5,000

### Step 3: Choose Coverage Amount
- **Minimum recommended**: $20,000
- **Typical range**: $25,000-$50,000
- **High-value items**: May need additional coverage

## Special Considerations

### High-Value Items
**Items that may need special coverage:**
- **Jewelry**: Often limited to $1,000-$2,500
- **Electronics**: May have sub-limits
- **Art and collectibles**: Usually excluded
- **Musical instruments**: May need separate policy

**Solutions:**
- **Scheduled items**: Add specific items to policy
- **Rider policies**: Additional coverage for valuables
- **Separate policies**: For very valuable items

### Roommates
**Important considerations:**
- **Separate policies**: Each roommate needs their own
- **Shared items**: Decide who owns what
- **Liability**: Each person is responsible for their actions
- **Claims**: Only policyholder can file claims

## Cost of Renters Insurance

### Typical Costs:
- **Basic coverage**: $15-$30 per month
- **Comprehensive coverage**: $25-$50 per month
- **High-value coverage**: $40-$80 per month

### Factors Affecting Cost:
- **Location**: Crime rates, weather risks
- **Coverage amount**: Higher coverage = higher premium
- **Deductible**: Higher deductible = lower premium
- **Claims history**: Previous claims increase cost
- **Credit score**: Better credit = lower premium

### Ways to Save:
- **Bundle policies**: Combine with auto insurance
- **Higher deductible**: Lower monthly premium
- **Security features**: Alarms, deadbolts, smoke detectors
- **Good credit**: Maintain good credit score
- **Shop around**: Compare quotes from multiple companies

## What's NOT Covered

### Standard Exclusions:
- **Floods**: Need separate flood insurance
- **Earthquakes**: Need separate earthquake insurance
- **Normal wear and tear**: Expected deterioration
- **Intentional damage**: Damage you cause on purpose
- **Business property**: Items used for business
- **Pets**: Pet damage to your belongings

### Additional Coverage Available:
- **Flood insurance**: Through National Flood Insurance Program
- **Earthquake insurance**: Separate policy
- **Identity theft**: Often available as add-on
- **Sewer backup**: May be available as rider

## How to Choose a Policy

### Step 1: Determine Your Needs
- **Calculate** total value of belongings
- **Consider** liability needs
- **Think about** high-value items
- **Evaluate** additional living expense needs

### Step 2: Shop Around
- **Get quotes** from multiple companies
- **Compare** coverage and exclusions
- **Check** company ratings and reviews
- **Consider** bundling with other policies

### Step 3: Read the Policy
- **Understand** what's covered and excluded
- **Know** your deductibles and limits
- **Ask questions** about anything unclear
- **Keep** policy documents in safe place

## Common Mistakes

❌ **Avoid These:**
- **Not having renters insurance**: Your belongings aren't protected
- **Underinsuring**: Not enough coverage for your belongings
- **Not updating**: Coverage doesn't reflect current belongings
- **Not reading policy**: Don't understand what's covered
- **Not documenting**: No proof of belongings

✅ **Best Practices:**
- **Get adequate coverage**: Protect what you own
- **Update regularly**: As you acquire new items
- **Document everything**: Photos, receipts, inventory
- **Understand policy**: Know coverage and exclusions
- **Review annually**: Adjust coverage as needed

## Action Steps

### This Week:
1. **Inventory** all your belongings
2. **Calculate** total value
3. **Research** insurance companies
4. **Get quotes** from multiple providers

### This Month:
1. **Purchase** renters insurance
2. **Document** your belongings with photos
3. **Store** receipts and inventory safely
4. **Review** policy with agent

### This Year:
1. **Update** inventory as you buy new items
2. **Review** coverage annually
3. **Compare** rates with other companies
4. **Adjust** coverage as needed`,
          order: 2,
          xpValue: 25
        },
        {
          title: "Health Insurance Basics",
          content: `# Health Insurance Basics: Protecting Your Health and Finances

## What is Health Insurance?

Health insurance is a contract between you and an insurance company that helps pay for medical expenses. You pay a premium (monthly payment) and the insurance company helps cover your healthcare costs.

### Why Health Insurance Matters:
- **Medical bills can be astronomical**: A single hospital stay can cost $10,000+
- **Required by law**: The Affordable Care Act requires most people to have coverage
- **Access to care**: Insurance provides access to preventive care and treatments
- **Financial protection**: Prevents medical debt from ruining your finances

## How Health Insurance Works

### Key Terms:
- **Premium**: Monthly payment you make to keep coverage
- **Deductible**: Amount you pay before insurance starts paying
- **Copay**: Fixed amount you pay for specific services
- **Coinsurance**: Percentage you pay after meeting deductible
- **Out-of-pocket maximum**: Most you'll pay in a year
- **Network**: Doctors and hospitals that accept your insurance

### Example:
- **Premium**: $300/month
- **Deductible**: $1,500/year
- **Copay**: $25 for doctor visits
- **Coinsurance**: 20% after deductible
- **Out-of-pocket max**: $6,000/year

## Types of Health Insurance

### 1. Employer-Sponsored Insurance
**How it works:**
- Provided by your employer
- Often partially paid by employer
- Usually the most affordable option
- May offer multiple plan choices

**Pros:**
- Employer often pays part of premium
- Group rates are lower
- Easy enrollment process
- May include additional benefits

**Cons:**
- Limited to employer's choices
- Coverage ends when you leave job
- May not be portable

### 2. Individual/Family Plans
**How it works:**
- You purchase directly from insurance company
- Available through Health Insurance Marketplace
- Can choose from multiple plans
- Premium tax credits may be available

**Pros:**
- More plan choices
- Portable (keeps with you)
- May qualify for subsidies
- Can choose based on needs

**Cons:**
- Usually more expensive
- No employer contribution
- Must manage enrollment yourself

### 3. Government Programs
**Medicare:**
- For people 65+ or with disabilities
- Part A (hospital), Part B (medical), Part D (drugs)
- May need supplemental insurance

**Medicaid:**
- For low-income individuals and families
- Free or low-cost coverage
- Income limits vary by state

**CHIP:**
- Children's Health Insurance Program
- For children whose families earn too much for Medicaid
- Low-cost coverage for children

## Types of Plans

### 1. HMO (Health Maintenance Organization)
**How it works:**
- Must use network doctors and hospitals
- Need referral from primary care doctor to see specialists
- Lower premiums and out-of-pocket costs

**Pros:**
- Lower cost
- Coordinated care
- Preventive care focus

**Cons:**
- Limited choice of doctors
- Need referrals for specialists
- No coverage outside network

### 2. PPO (Preferred Provider Organization)
**How it works:**
- Can use any doctor (in-network or out-of-network)
- No referrals needed for specialists
- Higher premiums but more flexibility

**Pros:**
- More choice of doctors
- No referrals needed
- Coverage outside network (higher cost)

**Cons:**
- Higher premiums
- Higher out-of-pocket costs
- More complex to understand

### 3. EPO (Exclusive Provider Organization)
**How it works:**
- Must use network doctors
- No referrals needed
- No coverage outside network

**Pros:**
- Lower cost than PPO
- No referrals needed
- Middle ground between HMO and PPO

**Cons:**
- Limited to network
- No coverage outside network

### 4. HDHP (High Deductible Health Plan)
**How it works:**
- Higher deductibles ($1,400+ individual, $2,800+ family)
- Lower premiums
- Can be paired with HSA (Health Savings Account)

**Pros:**
- Lower premiums
- HSA tax benefits
- Good for healthy people

**Cons:**
- High out-of-pocket costs
- Not good for frequent medical needs

## Understanding Costs

### Premium
- **Monthly payment** to keep coverage
- **Varies by plan type**: HMO < EPO < PPO < HDHP
- **May be subsidized**: Employer or government assistance
- **Consider**: Can you afford the premium?

### Deductible
- **Amount you pay** before insurance starts paying
- **Resets annually**: January 1st typically
- **Varies by plan**: $0-$8,000+
- **Consider**: How much can you afford to pay?

### Copay
- **Fixed amount** for specific services
- **Common copays**: $25 doctor, $50 specialist, $10 generic drugs
- **Doesn't count toward deductible** in most plans
- **Consider**: How often do you use these services?

### Coinsurance
- **Percentage you pay** after meeting deductible
- **Common**: 20% (you pay) / 80% (insurance pays)
- **Counts toward out-of-pocket maximum**
- **Consider**: Can you afford the percentage?

### Out-of-Pocket Maximum
- **Most you'll pay** in a year (excluding premiums)
- **Includes**: Deductible + copays + coinsurance
- **Protection**: Insurance pays 100% after this amount
- **Consider**: Maximum financial exposure

## Choosing the Right Plan

### Step 1: Assess Your Needs
**Consider:**
- **Health status**: Do you have ongoing conditions?
- **Frequency of care**: How often do you see doctors?
- **Medications**: Do you take regular prescriptions?
- **Family situation**: Do you have dependents?

### Step 2: Compare Plans
**Look at:**
- **Total cost**: Premium + expected out-of-pocket
- **Network**: Are your doctors included?
- **Coverage**: What services are covered?
- **Prescription drugs**: Are your medications covered?

### Step 3: Calculate Total Cost
**Formula:**
- **Annual premium** + **Expected out-of-pocket** = **Total cost**
- **Consider**: Best case vs. worst case scenarios
- **Factor in**: Tax benefits (HSA, FSA)

## Common Mistakes

❌ **Avoid These:**
- **Choosing by premium only**: May have high out-of-pocket costs
- **Not checking network**: Doctors may not be covered
- **Ignoring prescription coverage**: Medications may not be covered
- **Not understanding costs**: Confusion about deductibles and copays
- **Not shopping around**: Missing better deals

✅ **Best Practices:**
- **Compare total costs**: Premium + out-of-pocket
- **Check network**: Ensure your doctors are covered
- **Review prescription coverage**: Check your medications
- **Understand all costs**: Deductibles, copays, coinsurance
- **Shop annually**: Plans and costs change

## Open Enrollment

### When to Enroll:
- **Employer plans**: Usually once per year
- **Marketplace plans**: November 1 - January 15
- **Medicare**: October 15 - December 7
- **Special enrollment**: After qualifying life events

### Qualifying Life Events:
- **Marriage or divorce**
- **Birth or adoption of child**
- **Loss of other coverage**
- **Moving to new area**
- **Change in income**

## Action Steps

### This Week:
1. **Assess** your current health insurance needs
2. **Research** available plans in your area
3. **Calculate** total costs for different plans
4. **Check** if your doctors are in-network

### This Month:
1. **Compare** plans side-by-side
2. **Get quotes** from multiple companies
3. **Ask questions** about coverage and costs
4. **Make decision** based on your needs and budget

### This Year:
1. **Review** coverage during open enrollment
2. **Update** information after life changes
3. **Track** healthcare spending
4. **Consider** HSA or FSA if eligible`,
          order: 3,
          xpValue: 25
        }
      ];

      // Create a unit for Insurance Essentials course
      const insuranceUnit = await prisma.unit.upsert({
        where: {
          courseId_title: {
            courseId: createdCourse.id,
            title: "Insurance Protection Fundamentals"
          }
        },
        update: {},
        create: {
          courseId: createdCourse.id,
          title: "Insurance Protection Fundamentals",
          description: "Protect yourself with the right insurance",
          order: 1
        }
      });

      for (const lesson of insuranceLessons) {
        const existingLesson = await prisma.lesson.findFirst({
          where: {
            title: lesson.title,
            unitId: insuranceUnit.id
          }
        });

        if (!existingLesson) {
          await prisma.lesson.create({
            data: {
              ...lesson,
              unitId: insuranceUnit.id
            }
          });
          console.log(`📚 Created lesson: ${lesson.title}`);
        }
      }
    }
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });