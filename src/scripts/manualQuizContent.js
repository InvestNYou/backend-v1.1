const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Manual quiz content generator - AI-generated questions for each lesson
class ManualQuizContentGenerator {
  
  // Get all manual quiz content for lessons
  static getManualQuizContent() {
    return {
      // INVESTING 101 COURSE
      "What is Investing?": {
        title: "What is Investing? - Knowledge Check",
        description: "Test your understanding of basic investing concepts",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What is the primary purpose of investing?",
            options: [
              "To save money in a bank account",
              "To put money to work to earn more money over time",
              "To spend money on luxury items",
              "To avoid paying taxes"
            ],
            correctAnswer: 1,
            explanation: "Investing is putting your money to work to earn more money over time, rather than just saving it in a bank account."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "What did Albert Einstein call compound interest?",
            options: [
              "The seventh wonder of the world",
              "The eighth wonder of the world",
              "The ninth wonder of the world",
              "The tenth wonder of the world"
            ],
            correctAnswer: 1,
            explanation: "Einstein called compound interest 'the eighth wonder of the world' because of its powerful exponential growth effect."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "Which of the following is considered an asset?",
            options: [
              "Credit card debt",
              "Car loan",
              "Stock ownership",
              "Personal loan"
            ],
            correctAnswer: 2,
            explanation: "Assets put money in your pocket (like stocks), while liabilities take money out of your pocket (like loans)."
          },
          {
            id: 4,
            type: "true_false",
            question: "Money today is worth more than the same amount in the future.",
            correctAnswer: true,
            explanation: "This is the time value of money concept - money today can earn returns, making it more valuable than the same amount in the future."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "If you invest $1,000 at 7% annual return, approximately how much will you have after 30 years?",
            options: [
              "$2,100",
              "$4,500",
              "$7,600",
              "$10,000"
            ],
            correctAnswer: 2,
            explanation: "Due to compound interest, $1,000 at 7% annual return grows to approximately $7,612 after 30 years."
          }
        ],
        passingScore: 70,
        xpValue: 25
      },

      "Stocks vs Bonds": {
        title: "Stocks vs Bonds - Knowledge Check",
        description: "Test your understanding of stocks and bonds fundamentals",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What does owning a stock represent?",
            options: [
              "You are lending money to the company",
              "You are a partial owner of the company",
              "You are guaranteed fixed returns",
              "You are a creditor of the company"
            ],
            correctAnswer: 1,
            explanation: "Stocks represent ownership shares in a company. When you buy a stock, you become a partial owner."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "What is a bond?",
            options: [
              "Ownership in a company",
              "A loan you make to a company or government",
              "A type of stock",
              "A savings account"
            ],
            correctAnswer: 1,
            explanation: "Bonds are loans you make to companies or governments. You're essentially lending money and earning interest."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "Which investment typically has higher risk and higher potential return?",
            options: [
              "Bonds",
              "Stocks",
              "Savings accounts",
              "Certificates of deposit"
            ],
            correctAnswer: 1,
            explanation: "Stocks typically have higher risk and higher potential returns compared to bonds, which are generally safer but offer lower returns."
          },
          {
            id: 4,
            type: "true_false",
            question: "All stocks pay dividends to shareholders.",
            correctAnswer: false,
            explanation: "Not all stocks pay dividends. Some companies reinvest profits for growth instead of paying dividends to shareholders."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What happens when a bond reaches its maturity date?",
            options: [
              "The bond issuer pays back the principal",
              "The bond becomes worthless",
              "The bond converts to stock",
              "The bond pays higher interest"
            ],
            correctAnswer: 0,
            explanation: "At maturity, the bond issuer pays back the principal amount you originally invested."
          }
        ],
        passingScore: 70,
        xpValue: 25
      },

      "Risk and Return": {
        title: "Risk and Return - Knowledge Check",
        description: "Test your understanding of investment risk and return concepts",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What is the fundamental relationship between risk and return?",
            options: [
              "Higher risk always means higher returns",
              "Lower risk always means lower returns",
              "Higher potential returns generally come with higher risk",
              "Risk and return are unrelated"
            ],
            correctAnswer: 2,
            explanation: "Generally, higher potential returns come with higher risk. This is the fundamental trade-off in investing."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "Which type of risk affects the entire market?",
            options: [
              "Company-specific risk",
              "Market risk",
              "Interest rate risk",
              "Inflation risk"
            ],
            correctAnswer: 1,
            explanation: "Market risk affects the entire market, like during the 2008 financial crisis when most investments declined."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What is inflation risk?",
            options: [
              "Risk that interest rates will rise",
              "Risk that a specific company will fail",
              "Risk that inflation will erode purchasing power",
              "Risk that the market will decline"
            ],
            correctAnswer: 2,
            explanation: "Inflation risk is the risk that inflation will erode your money's purchasing power over time."
          },
          {
            id: 4,
            type: "true_false",
            question: "A conservative investor typically allocates more to bonds than stocks.",
            correctAnswer: true,
            explanation: "Conservative investors prefer safety over growth, typically allocating 70% bonds and 30% stocks."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What is the best way to reduce company-specific risk?",
            options: [
              "Invest in only one company",
              "Diversify across many companies",
              "Invest only in government bonds",
              "Avoid investing altogether"
            ],
            correctAnswer: 1,
            explanation: "Diversifying across many companies reduces company-specific risk by spreading your investments."
          }
        ],
        passingScore: 70,
        xpValue: 25
      },

      "Building Your Portfolio": {
        title: "Building Your Portfolio - Knowledge Check",
        description: "Test your understanding of portfolio construction and management",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What is diversification?",
            options: [
              "Putting all your money in one investment",
              "Spreading investments across different assets",
              "Only investing in stocks",
              "Avoiding all risk"
            ],
            correctAnswer: 1,
            explanation: "Diversification means spreading your investments across different asset classes, industries, and geographic regions."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "What is dollar-cost averaging?",
            options: [
              "Investing more when prices are high",
              "Investing a fixed amount regularly regardless of market conditions",
              "Only investing when markets are up",
              "Timing the market perfectly"
            ],
            correctAnswer: 1,
            explanation: "Dollar-cost averaging is investing a fixed amount regularly, which helps smooth out market volatility."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What is the 'age rule' for stock allocation?",
            options: [
              "Subtract your age from 100",
              "Subtract your age from 110",
              "Add your age to 100",
              "Multiply your age by 2"
            ],
            correctAnswer: 1,
            explanation: "A common rule is to subtract your age from 110 to determine your stock allocation percentage."
          },
          {
            id: 4,
            type: "true_false",
            question: "Rebalancing your portfolio means adjusting it to maintain your desired asset allocation.",
            correctAnswer: true,
            explanation: "Rebalancing involves periodically adjusting your portfolio to maintain your target asset allocation."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "Which factor should NOT influence your asset allocation?",
            options: [
              "Your age",
              "Your risk tolerance",
              "Your time horizon",
              "Recent market performance"
            ],
            correctAnswer: 3,
            explanation: "Recent market performance shouldn't drive long-term allocation decisions. Focus on your age, risk tolerance, and time horizon."
          }
        ],
        passingScore: 70,
        xpValue: 25
      },

      // BUDGETING & TAXES COURSE
      "Budgeting Basics": {
        title: "Budgeting Basics - Knowledge Check",
        description: "Test your understanding of personal budgeting fundamentals",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What is the 50/30/20 rule?",
            options: [
              "50% savings, 30% needs, 20% wants",
              "50% needs, 30% wants, 20% savings and debt repayment",
              "50% wants, 30% needs, 20% savings",
              "50% debt, 30% savings, 20% needs"
            ],
            correctAnswer: 1,
            explanation: "The 50/30/20 rule allocates 50% to needs, 30% to wants, and 20% to savings and debt repayment."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "What should be included in your emergency fund?",
            options: [
              "1 month of expenses",
              "3-6 months of living expenses",
              "1 year of expenses",
              "No emergency fund needed"
            ],
            correctAnswer: 1,
            explanation: "Financial experts recommend having 3-6 months of living expenses saved in an emergency fund."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What is the 'latte factor'?",
            options: [
              "The cost of expensive coffee",
              "Small daily expenses that add up over time",
              "A budgeting app",
              "A type of investment"
            ],
            correctAnswer: 1,
            explanation: "The latte factor refers to how small daily expenses can add up significantly over time."
          },
          {
            id: 4,
            type: "true_false",
            question: "Tracking your spending is optional for effective budgeting.",
            correctAnswer: false,
            explanation: "Tracking your spending is essential for effective budgeting - you need to know where your money goes."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What is the first step in creating a budget?",
            options: [
              "Set spending limits",
              "Calculate your income",
              "Open a savings account",
              "Pay off all debt"
            ],
            correctAnswer: 1,
            explanation: "The first step in budgeting is calculating your total income to understand what you have to work with."
          }
        ],
        passingScore: 70,
        xpValue: 20
      },

      "Tax-Advantaged Accounts": {
        title: "Tax-Advantaged Accounts - Knowledge Check",
        description: "Test your understanding of tax-advantaged investment accounts",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What is the main benefit of a traditional 401(k)?",
            options: [
              "Tax-free withdrawals",
              "Tax deduction on contributions",
              "No contribution limits",
              "Guaranteed returns"
            ],
            correctAnswer: 1,
            explanation: "Traditional 401(k) contributions are tax-deductible, reducing your current year's taxable income."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "What is the main benefit of a Roth IRA?",
            options: [
              "Tax deduction on contributions",
              "Tax-free growth and withdrawals in retirement",
              "Higher contribution limits",
              "Employer matching"
            ],
            correctAnswer: 1,
            explanation: "Roth IRAs provide tax-free growth and withdrawals in retirement, though contributions are made with after-tax money."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What does HSA stand for?",
            options: [
              "High Savings Account",
              "Health Savings Account",
              "Home Savings Account",
              "Housing Savings Account"
            ],
            correctAnswer: 1,
            explanation: "HSA stands for Health Savings Account, which offers triple tax advantages for healthcare expenses."
          },
          {
            id: 4,
            type: "true_false",
            question: "You can contribute to both a traditional and Roth IRA in the same year.",
            correctAnswer: true,
            explanation: "You can contribute to both types of IRAs in the same year, but the total contribution limit applies to both combined."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What is the penalty for early withdrawal from a traditional IRA before age 59½?",
            options: [
              "5%",
              "10%",
              "15%",
              "20%"
            ],
            correctAnswer: 1,
            explanation: "Early withdrawals from traditional IRAs before age 59½ typically incur a 10% penalty plus income taxes."
          }
        ],
        passingScore: 70,
        xpValue: 20
      },

      // RETIREMENT BASICS COURSE
      "Retirement Planning": {
        title: "Retirement Planning - Knowledge Check",
        description: "Test your understanding of retirement planning fundamentals",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What is the 4% withdrawal rule?",
            options: [
              "Withdraw 4% of your portfolio annually",
              "Save 4% of your income for retirement",
              "Invest 4% in bonds",
              "Retire at age 40"
            ],
            correctAnswer: 0,
            explanation: "The 4% rule suggests withdrawing 4% of your portfolio annually in retirement, adjusted for inflation."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "What is the Rule of 72 used for?",
            options: [
              "Calculating retirement age",
              "Estimating how long it takes to double your money",
              "Determining Social Security benefits",
              "Calculating tax deductions"
            ],
            correctAnswer: 1,
            explanation: "The Rule of 72 helps estimate how long it takes to double your money by dividing 72 by your annual interest rate."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "When should you start saving for retirement?",
            options: [
              "When you're 50",
              "When you're 40",
              "As early as possible",
              "When you get a raise"
            ],
            correctAnswer: 2,
            explanation: "Start saving for retirement as early as possible to take advantage of compound interest over time."
          },
          {
            id: 4,
            type: "true_false",
            question: "Social Security alone is sufficient for most people's retirement needs.",
            correctAnswer: false,
            explanation: "Social Security typically replaces only 40% of pre-retirement income, so additional savings are usually needed."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What is the maximum age for required minimum distributions (RMDs) from traditional IRAs?",
            options: [
              "65",
              "70",
              "72",
              "75"
            ],
            correctAnswer: 2,
            explanation: "Required minimum distributions from traditional IRAs must begin at age 72 (as of 2023)."
          }
        ],
        passingScore: 70,
        xpValue: 20
      },

      // MARKET FUNDAMENTALS COURSE
      "Market Equilibrium": {
        title: "Market Equilibrium - Knowledge Check",
        description: "Test your understanding of market balance and price determination",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What is market equilibrium?",
            options: [
              "When supply exceeds demand",
              "When demand exceeds supply",
              "When supply equals demand",
              "When prices are falling"
            ],
            correctAnswer: 2,
            explanation: "Market equilibrium occurs when supply equals demand, establishing a stable price point."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "What happens to price when demand increases?",
            options: [
              "Price decreases",
              "Price increases",
              "Price stays the same",
              "Price becomes zero"
            ],
            correctAnswer: 1,
            explanation: "When demand increases (supply constant), prices typically rise due to higher competition for goods."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What is the law of supply?",
            options: [
              "Higher prices lead to higher quantity supplied",
              "Higher prices lead to lower quantity supplied",
              "Supply is always constant",
              "Supply depends only on demand"
            ],
            correctAnswer: 0,
            explanation: "The law of supply states that higher prices generally lead to higher quantity supplied by producers."
          },
          {
            id: 4,
            type: "true_false",
            question: "Market prices are always stable and never change.",
            correctAnswer: false,
            explanation: "Market prices constantly change based on supply and demand dynamics, new information, and market conditions."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What causes a shift in the demand curve?",
            options: [
              "Change in price of the good",
              "Change in consumer preferences",
              "Change in quantity supplied",
              "Change in production costs"
            ],
            correctAnswer: 1,
            explanation: "A shift in the demand curve is caused by factors other than price, such as changes in consumer preferences, income, or prices of related goods."
          }
        ],
        passingScore: 70,
        xpValue: 20
      },

      // Additional lessons from Investing 101
      "Diversification": {
        title: "Diversification - Knowledge Check",
        description: "Test your understanding of portfolio diversification strategies",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What does 'don't put all your eggs in one basket' mean in investing?",
            options: [
              "Only invest in one company",
              "Diversify your investments",
              "Avoid investing altogether",
              "Only invest in bonds"
            ],
            correctAnswer: 1,
            explanation: "This phrase refers to diversification - spreading your investments across different assets to reduce risk."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "Which of the following is NOT a way to diversify?",
            options: [
              "Investing in different companies",
              "Investing in different industries",
              "Investing in different countries",
              "Putting all money in one stock"
            ],
            correctAnswer: 3,
            explanation: "Putting all money in one stock is the opposite of diversification and increases risk."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What is the main benefit of diversification?",
            options: [
              "Guaranteed higher returns",
              "Reduced risk",
              "Eliminates all losses",
              "Simplifies investing"
            ],
            correctAnswer: 1,
            explanation: "Diversification reduces risk by spreading investments across different assets, though it doesn't guarantee higher returns."
          },
          {
            id: 4,
            type: "true_false",
            question: "Diversification can eliminate all investment risk.",
            correctAnswer: false,
            explanation: "Diversification reduces risk but cannot eliminate all risk, especially market-wide risks."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What is asset allocation?",
            options: [
              "Choosing individual stocks",
              "Dividing investments among different asset classes",
              "Timing the market",
              "Avoiding all risk"
            ],
            correctAnswer: 1,
            explanation: "Asset allocation is dividing your investments among different asset classes like stocks, bonds, and cash."
          }
        ],
        passingScore: 70,
        xpValue: 25
      },

      "Getting Started": {
        title: "Getting Started - Knowledge Check",
        description: "Test your understanding of beginning your investment journey",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What should you do before starting to invest?",
            options: [
              "Start investing immediately",
              "Build an emergency fund first",
              "Only invest in high-risk stocks",
              "Avoid all savings accounts"
            ],
            correctAnswer: 1,
            explanation: "Before investing, you should build an emergency fund to cover unexpected expenses."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "What is the minimum amount needed to start investing?",
            options: [
              "$10,000",
              "$1,000",
              "$100",
              "There's no minimum"
            ],
            correctAnswer: 3,
            explanation: "Many investment platforms allow you to start with very small amounts, even as little as $1."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What is dollar-cost averaging?",
            options: [
              "Investing large amounts at once",
              "Investing fixed amounts regularly",
              "Only investing when markets are up",
              "Timing the market perfectly"
            ],
            correctAnswer: 1,
            explanation: "Dollar-cost averaging is investing a fixed amount regularly, regardless of market conditions."
          },
          {
            id: 4,
            type: "true_false",
            question: "You need to be wealthy to start investing.",
            correctAnswer: false,
            explanation: "Anyone can start investing with small amounts. The key is to start early and be consistent."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What is the most important factor for long-term investment success?",
            options: [
              "Picking the best stocks",
              "Timing the market",
              "Starting early and staying consistent",
              "Having inside information"
            ],
            correctAnswer: 2,
            explanation: "Starting early and staying consistent with investments is more important than trying to time the market."
          }
        ],
        passingScore: 70,
        xpValue: 20
      },

      // Budgeting & Taxes Course
      "Creating Your First Budget": {
        title: "Creating Your First Budget - Knowledge Check",
        description: "Test your understanding of budget creation and management",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What is the first step in creating a budget?",
            options: [
              "Set spending limits",
              "Track your income",
              "Open a savings account",
              "Pay off all debt"
            ],
            correctAnswer: 1,
            explanation: "The first step is to track your total income to understand what you have to work with."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "What should be included in your monthly budget?",
            options: [
              "Only fixed expenses",
              "Only variable expenses",
              "All income and expenses",
              "Only savings"
            ],
            correctAnswer: 2,
            explanation: "A complete budget should include all sources of income and all types of expenses."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "How often should you review your budget?",
            options: [
              "Once a year",
              "Monthly",
              "Never",
              "Only when you overspend"
            ],
            correctAnswer: 1,
            explanation: "You should review and adjust your budget monthly to ensure it remains accurate and effective."
          },
          {
            id: 4,
            type: "true_false",
            question: "A budget should be flexible and adjustable.",
            correctAnswer: true,
            explanation: "Budgets should be flexible and adjustable as your income and expenses change over time."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What is the purpose of a budget?",
            options: [
              "To restrict all spending",
              "To help you reach financial goals",
              "To eliminate all expenses",
              "To avoid saving money"
            ],
            correctAnswer: 1,
            explanation: "The purpose of a budget is to help you manage your money effectively and reach your financial goals."
          }
        ],
        passingScore: 70,
        xpValue: 20
      },

      "Understanding Taxes": {
        title: "Understanding Taxes - Knowledge Check",
        description: "Test your understanding of basic tax concepts",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What is the difference between gross and net income?",
            options: [
              "Gross is after taxes, net is before taxes",
              "Gross is before taxes, net is after taxes",
              "They are the same thing",
              "Gross includes deductions, net doesn't"
            ],
            correctAnswer: 1,
            explanation: "Gross income is before taxes and deductions, while net income is after taxes and deductions."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "What is a tax deduction?",
            options: [
              "Money you owe the government",
              "An expense that reduces your taxable income",
              "A penalty for late payment",
              "Interest on unpaid taxes"
            ],
            correctAnswer: 1,
            explanation: "A tax deduction is an expense that reduces your taxable income, lowering your tax bill."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What is the standard deduction?",
            options: [
              "A fixed amount you can deduct without itemizing",
              "The maximum you can earn tax-free",
              "A penalty for not filing",
              "Interest on your tax refund"
            ],
            correctAnswer: 0,
            explanation: "The standard deduction is a fixed amount you can deduct from your income without itemizing expenses."
          },
          {
            id: 4,
            type: "true_false",
            question: "All income is subject to federal income tax.",
            correctAnswer: false,
            explanation: "Some income may be exempt from federal income tax, such as certain municipal bond interest."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "When is the federal tax filing deadline?",
            options: [
              "December 31st",
              "January 31st",
              "April 15th",
              "June 15th"
            ],
            correctAnswer: 2,
            explanation: "The federal tax filing deadline is typically April 15th, though it may be extended in some years."
          }
        ],
        passingScore: 70,
        xpValue: 20
      },

      "Filing Your Taxes": {
        title: "Filing Your Taxes - Knowledge Check",
        description: "Test your understanding of tax filing process and requirements",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What forms do most people need to file their taxes?",
            options: [
              "Form 1040",
              "Form 1099",
              "Form W-2",
              "All of the above"
            ],
            correctAnswer: 3,
            explanation: "Most people need Form 1040 (tax return), W-2 (wage statement), and may receive 1099 forms for other income."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "What is a W-2 form?",
            options: [
              "A tax return form",
              "A wage and tax statement from your employer",
              "A deduction form",
              "A penalty notice"
            ],
            correctAnswer: 1,
            explanation: "A W-2 is a wage and tax statement that shows your earnings and taxes withheld for the year."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What happens if you file your taxes late?",
            options: [
              "Nothing",
              "You may face penalties and interest",
              "You get a bonus",
              "Your refund increases"
            ],
            correctAnswer: 1,
            explanation: "Late filing can result in penalties and interest charges on any taxes owed."
          },
          {
            id: 4,
            type: "true_false",
            question: "You must file taxes even if you don't owe any money.",
            correctAnswer: false,
            explanation: "Whether you need to file depends on your income level and filing status, not just whether you owe money."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What is the difference between a tax credit and a tax deduction?",
            options: [
              "They are the same thing",
              "A credit reduces taxes dollar-for-dollar, a deduction reduces taxable income",
              "A deduction reduces taxes dollar-for-dollar, a credit reduces taxable income",
              "Credits are only for businesses"
            ],
            correctAnswer: 1,
            explanation: "A tax credit reduces your tax bill dollar-for-dollar, while a deduction reduces your taxable income."
          }
        ],
        passingScore: 70,
        xpValue: 20
      },

      // Retirement Basics Course
      "Why Start Early?": {
        title: "Why Start Early? - Knowledge Check",
        description: "Test your understanding of the importance of early retirement planning",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What is the main advantage of starting to save for retirement early?",
            options: [
              "Higher interest rates",
              "Compound interest has more time to work",
              "Lower taxes",
              "More investment options"
            ],
            correctAnswer: 1,
            explanation: "Starting early allows compound interest more time to work, significantly increasing your retirement savings."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "If you start saving $200/month at age 25 vs age 35, how much more will you have at age 65 (assuming 7% return)?",
            options: [
              "About $50,000 more",
              "About $200,000 more",
              "About $500,000 more",
              "The same amount"
            ],
            correctAnswer: 2,
            explanation: "Starting 10 years earlier can result in hundreds of thousands more due to compound interest."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What is the 'Rule of 72' used for?",
            options: [
              "Calculating retirement age",
              "Estimating how long it takes to double your money",
              "Determining Social Security benefits",
              "Calculating tax deductions"
            ],
            correctAnswer: 1,
            explanation: "The Rule of 72 helps estimate how long it takes to double your money by dividing 72 by your annual return rate."
          },
          {
            id: 4,
            type: "true_false",
            question: "It's never too late to start saving for retirement.",
            correctAnswer: true,
            explanation: "While starting early is ideal, it's never too late to start saving for retirement."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What percentage of pre-retirement income should you aim to replace in retirement?",
            options: [
              "50-60%",
              "70-80%",
              "90-100%",
              "110-120%"
            ],
            correctAnswer: 1,
            explanation: "Most financial experts recommend replacing 70-80% of your pre-retirement income for a comfortable retirement."
          }
        ],
        passingScore: 70,
        xpValue: 20
      },

      "401(k) Basics": {
        title: "401(k) Basics - Knowledge Check",
        description: "Test your understanding of 401(k) retirement accounts",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What is a 401(k)?",
            options: [
              "A type of savings account",
              "An employer-sponsored retirement plan",
              "A type of insurance",
              "A government benefit"
            ],
            correctAnswer: 1,
            explanation: "A 401(k) is an employer-sponsored retirement plan that allows employees to save for retirement with tax advantages."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "What is employer matching?",
            options: [
              "Your employer pays your taxes",
              "Your employer contributes money to your 401(k) based on your contributions",
              "Your employer manages your investments",
              "Your employer pays your fees"
            ],
            correctAnswer: 1,
            explanation: "Employer matching is when your employer contributes money to your 401(k) based on your own contributions."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What is the maximum annual contribution limit for 401(k) in 2024?",
            options: [
              "$15,000",
              "$20,500",
              "$23,000",
              "$30,000"
            ],
            correctAnswer: 2,
            explanation: "The 2024 contribution limit for 401(k) accounts is $23,000 for those under 50."
          },
          {
            id: 4,
            type: "true_false",
            question: "You can withdraw money from your 401(k) at any time without penalty.",
            correctAnswer: false,
            explanation: "Early withdrawals from 401(k) accounts typically incur a 10% penalty plus income taxes."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What happens to your 401(k) if you change jobs?",
            options: [
              "You lose all the money",
              "You can roll it over to an IRA or new employer's plan",
              "You must withdraw it immediately",
              "It automatically transfers to your new employer"
            ],
            correctAnswer: 1,
            explanation: "When changing jobs, you can roll over your 401(k) to an IRA or your new employer's plan to avoid penalties."
          }
        ],
        passingScore: 70,
        xpValue: 20
      },

      "IRA Basics": {
        title: "IRA Basics - Knowledge Check",
        description: "Test your understanding of Individual Retirement Accounts",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What does IRA stand for?",
            options: [
              "Individual Retirement Account",
              "Internal Revenue Account",
              "Investment Retirement Account",
              "Individual Revenue Account"
            ],
            correctAnswer: 0,
            explanation: "IRA stands for Individual Retirement Account, a tax-advantaged retirement savings account."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "What is the main difference between Traditional and Roth IRAs?",
            options: [
              "Traditional has higher contribution limits",
              "Traditional offers tax deduction now, Roth offers tax-free withdrawals later",
              "Roth is only for high earners",
              "Traditional is only for low earners"
            ],
            correctAnswer: 1,
            explanation: "Traditional IRAs offer tax deductions now, while Roth IRAs offer tax-free withdrawals in retirement."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What is the annual contribution limit for IRAs in 2024?",
            options: [
              "$5,000",
              "$6,000",
              "$7,000",
              "$8,000"
            ],
            correctAnswer: 2,
            explanation: "The 2024 contribution limit for IRAs is $7,000 for those under 50."
          },
          {
            id: 4,
            type: "true_false",
            question: "You can contribute to both Traditional and Roth IRAs in the same year.",
            correctAnswer: true,
            explanation: "You can contribute to both types of IRAs in the same year, but the total limit applies to both combined."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "At what age must you start taking required minimum distributions from Traditional IRAs?",
            options: [
              "65",
              "70",
              "72",
              "75"
            ],
            correctAnswer: 2,
            explanation: "Required minimum distributions from Traditional IRAs must begin at age 72 (as of 2023)."
          }
        ],
        passingScore: 70,
        xpValue: 20
      },

      // Insurance Course
      "Types of Insurance": {
        title: "Types of Insurance - Knowledge Check",
        description: "Test your understanding of different insurance types and their purposes",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What is the primary purpose of insurance?",
            options: [
              "To make money",
              "To transfer risk from individuals to insurance companies",
              "To avoid all financial losses",
              "To invest money"
            ],
            correctAnswer: 1,
            explanation: "Insurance transfers risk from individuals to insurance companies in exchange for premiums."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "What is a deductible?",
            options: [
              "The amount you pay monthly",
              "The amount you pay before insurance coverage begins",
              "The total coverage amount",
              "The insurance company's profit"
            ],
            correctAnswer: 1,
            explanation: "A deductible is the amount you must pay out-of-pocket before your insurance coverage kicks in."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "Which type of insurance covers damage to your vehicle?",
            options: [
              "Health insurance",
              "Life insurance",
              "Auto insurance",
              "Disability insurance"
            ],
            correctAnswer: 2,
            explanation: "Auto insurance covers damage to your vehicle and liability for accidents."
          },
          {
            id: 4,
            type: "true_false",
            question: "Life insurance is only needed if you have dependents.",
            correctAnswer: true,
            explanation: "Life insurance is primarily needed to provide financial support for dependents if you pass away."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What does liability insurance cover?",
            options: [
              "Your own property damage",
              "Damage you cause to others",
              "Your medical expenses",
              "Your lost income"
            ],
            correctAnswer: 1,
            explanation: "Liability insurance covers damage or injury you cause to other people or their property."
          }
        ],
        passingScore: 70,
        xpValue: 20
      },

      "Renters Insurance": {
        title: "Renters Insurance - Knowledge Check",
        description: "Test your understanding of renters insurance coverage and benefits",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What does renters insurance typically cover?",
            options: [
              "The building structure",
              "Your personal belongings",
              "Your landlord's property",
              "Only expensive items"
            ],
            correctAnswer: 1,
            explanation: "Renters insurance covers your personal belongings, not the building structure (which the landlord insures)."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "What is personal liability coverage in renters insurance?",
            options: [
              "Coverage for your belongings",
              "Coverage if someone is injured in your rental",
              "Coverage for the building",
              "Coverage for your landlord"
            ],
            correctAnswer: 1,
            explanation: "Personal liability coverage protects you if someone is injured in your rental unit."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What is additional living expenses coverage?",
            options: [
              "Extra money for rent",
              "Coverage for temporary housing if your rental is uninhabitable",
              "Coverage for moving expenses",
              "Coverage for utilities"
            ],
            correctAnswer: 1,
            explanation: "Additional living expenses coverage pays for temporary housing if your rental becomes uninhabitable due to a covered loss."
          },
          {
            id: 4,
            type: "true_false",
            question: "Renters insurance is required by law.",
            correctAnswer: false,
            explanation: "Renters insurance is not required by law, but landlords may require it as part of the lease agreement."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What factors affect renters insurance premiums?",
            options: [
              "Only your income",
              "Location, coverage amount, deductible, and claims history",
              "Only your credit score",
              "Only your age"
            ],
            correctAnswer: 1,
            explanation: "Renters insurance premiums are affected by location, coverage amount, deductible choice, and claims history."
          }
        ],
        passingScore: 70,
        xpValue: 20
      },

      "Health Insurance Basics": {
        title: "Health Insurance Basics - Knowledge Check",
        description: "Test your understanding of health insurance fundamentals",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What is a premium in health insurance?",
            options: [
              "The amount you pay for medical services",
              "The monthly payment for insurance coverage",
              "The amount the insurance pays",
              "A penalty for late payment"
            ],
            correctAnswer: 1,
            explanation: "A premium is the monthly payment you make to maintain your health insurance coverage."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "What is the difference between a copay and coinsurance?",
            options: [
              "They are the same thing",
              "Copay is a fixed amount, coinsurance is a percentage",
              "Copay is a percentage, coinsurance is a fixed amount",
              "Copay is for prescriptions only"
            ],
            correctAnswer: 1,
            explanation: "A copay is a fixed amount you pay, while coinsurance is a percentage of the cost you share with insurance."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What is an out-of-pocket maximum?",
            options: [
              "The most you can spend on premiums",
              "The most you'll pay for covered services in a year",
              "The most insurance will pay",
              "The annual deductible amount"
            ],
            correctAnswer: 1,
            explanation: "The out-of-pocket maximum is the most you'll pay for covered services in a calendar year."
          },
          {
            id: 4,
            type: "true_false",
            question: "All health insurance plans cover preventive care at no cost.",
            correctAnswer: true,
            explanation: "Under the Affordable Care Act, most health insurance plans must cover preventive care at no cost to the patient."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What is a health savings account (HSA)?",
            options: [
              "A type of health insurance",
              "A tax-advantaged account for medical expenses",
              "A government program",
              "A type of copay"
            ],
            correctAnswer: 1,
            explanation: "An HSA is a tax-advantaged savings account specifically for qualified medical expenses."
          }
        ],
        passingScore: 70,
        xpValue: 20
      },

      // AP Microeconomics Course
      "Scarcity and Opportunity Cost": {
        title: "Scarcity and Opportunity Cost - Knowledge Check",
        description: "Test your understanding of fundamental economic concepts",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What is scarcity in economics?",
            options: [
              "Having no resources",
              "Unlimited wants with limited resources",
              "Having too much money",
              "Government control of resources"
            ],
            correctAnswer: 1,
            explanation: "Scarcity is the fundamental economic problem of having unlimited wants but limited resources to satisfy them."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "What is opportunity cost?",
            options: [
              "The price of goods",
              "The value of the next best alternative given up",
              "The cost of production",
              "Government taxes"
            ],
            correctAnswer: 1,
            explanation: "Opportunity cost is the value of the next best alternative that you give up when making a choice."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "Which of the following is an example of opportunity cost?",
            options: [
              "The price of a movie ticket",
              "The time you could have spent studying instead of watching a movie",
              "The cost of popcorn",
              "The theater's rent"
            ],
            correctAnswer: 1,
            explanation: "The opportunity cost of watching a movie is the time you could have spent doing something else, like studying."
          },
          {
            id: 4,
            type: "true_false",
            question: "Every choice involves an opportunity cost.",
            correctAnswer: true,
            explanation: "Every choice involves giving up something else you could have done with your time or resources."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What does 'there's no such thing as a free lunch' mean?",
            options: [
              "Lunch is always expensive",
              "Everything has an opportunity cost",
              "Restaurants don't give free food",
              "Government provides free meals"
            ],
            correctAnswer: 1,
            explanation: "This phrase means that everything has an opportunity cost - even 'free' things require resources."
          }
        ],
        passingScore: 70,
        xpValue: 25
      },

      "The Production Possibilities Curve (PPC)": {
        title: "The Production Possibilities Curve (PPC) - Knowledge Check",
        description: "Test your understanding of production possibilities and economic efficiency",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What does the Production Possibilities Curve show?",
            options: [
              "The cost of production",
              "Maximum combinations of two goods an economy can produce",
              "The price of goods",
              "Consumer preferences"
            ],
            correctAnswer: 1,
            explanation: "The PPC shows the maximum combinations of two goods an economy can produce given its resources and technology."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "What does a point inside the PPC represent?",
            options: [
              "Efficient production",
              "Inefficient production",
              "Impossible production",
              "Future production"
            ],
            correctAnswer: 1,
            explanation: "A point inside the PPC represents inefficient production - the economy could produce more of both goods."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What causes the PPC to shift outward?",
            options: [
              "Higher prices",
              "More resources or better technology",
              "Lower demand",
              "Government regulation"
            ],
            correctAnswer: 1,
            explanation: "The PPC shifts outward when there are more resources available or technology improves."
          },
          {
            id: 4,
            type: "true_false",
            question: "Points on the PPC represent efficient production.",
            correctAnswer: true,
            explanation: "Points on the PPC represent efficient production - the economy is using all its resources fully."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What is the shape of a typical PPC?",
            options: [
              "A straight line",
              "A curve bowed outward",
              "A circle",
              "A square"
            ],
            correctAnswer: 1,
            explanation: "The PPC is typically bowed outward due to increasing opportunity costs as production shifts between goods."
          }
        ],
        passingScore: 70,
        xpValue: 25
      },

      "Comparative Advantage and Trade": {
        title: "Comparative Advantage and Trade - Knowledge Check",
        description: "Test your understanding of trade theory and comparative advantage",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What is comparative advantage?",
            options: [
              "Being better at everything",
              "Having a lower opportunity cost for producing a good",
              "Having more resources",
              "Being the largest producer"
            ],
            correctAnswer: 1,
            explanation: "Comparative advantage means having a lower opportunity cost for producing a particular good."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "What is absolute advantage?",
            options: [
              "Having a lower opportunity cost",
              "Being able to produce more with the same resources",
              "Having more resources",
              "Being more efficient overall"
            ],
            correctAnswer: 1,
            explanation: "Absolute advantage means being able to produce more of a good with the same amount of resources."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "Why do countries trade?",
            options: [
              "To show superiority",
              "To benefit from comparative advantage",
              "To avoid production",
              "To increase prices"
            ],
            correctAnswer: 1,
            explanation: "Countries trade to benefit from comparative advantage and specialization, making both countries better off."
          },
          {
            id: 4,
            type: "true_false",
            question: "A country can have comparative advantage in a good even if it doesn't have absolute advantage.",
            correctAnswer: true,
            explanation: "Yes, comparative advantage depends on opportunity cost, not absolute productivity."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What happens when countries specialize according to comparative advantage?",
            options: [
              "Total world production decreases",
              "Total world production increases",
              "Only one country benefits",
              "Trade becomes unnecessary"
            ],
            correctAnswer: 1,
            explanation: "Specialization according to comparative advantage increases total world production and benefits all trading partners."
          }
        ],
        passingScore: 70,
        xpValue: 25
      },

      "Economic Systems": {
        title: "Economic Systems - Knowledge Check",
        description: "Test your understanding of different economic systems",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What is a market economy?",
            options: [
              "Government controls all production",
              "Decisions made by supply and demand",
              "No private property",
              "Equal distribution of wealth"
            ],
            correctAnswer: 1,
            explanation: "A market economy relies on supply and demand to make economic decisions with minimal government intervention."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "What is a command economy?",
            options: [
              "No government involvement",
              "Government makes all economic decisions",
              "Mixed public and private ownership",
              "Free market with regulations"
            ],
            correctAnswer: 1,
            explanation: "A command economy is where the government makes all major economic decisions about production and distribution."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What is a mixed economy?",
            options: [
              "Only market forces",
              "Only government control",
              "Combination of market forces and government intervention",
              "No economic activity"
            ],
            correctAnswer: 2,
            explanation: "A mixed economy combines market forces with government intervention to address market failures."
          },
          {
            id: 4,
            type: "true_false",
            question: "Most modern economies are pure market or pure command systems.",
            correctAnswer: false,
            explanation: "Most modern economies are mixed systems, combining elements of both market and command economies."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What are the three basic economic questions?",
            options: [
              "Who, what, when",
              "What to produce, how to produce, for whom to produce",
              "Where, why, how much",
              "Price, quantity, quality"
            ],
            correctAnswer: 1,
            explanation: "The three basic economic questions are: What to produce? How to produce? For whom to produce?"
          }
        ],
        passingScore: 70,
        xpValue: 25
      },

      "The Law of Demand": {
        title: "The Law of Demand - Knowledge Check",
        description: "Test your understanding of demand theory and consumer behavior",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What does the Law of Demand state?",
            options: [
              "Higher prices lead to higher quantity demanded",
              "Higher prices lead to lower quantity demanded",
              "Price doesn't affect demand",
              "Demand is always constant"
            ],
            correctAnswer: 1,
            explanation: "The Law of Demand states that as price increases, quantity demanded decreases, and vice versa."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "What causes a movement along the demand curve?",
            options: [
              "Change in consumer income",
              "Change in price of the good",
              "Change in consumer preferences",
              "Change in price of related goods"
            ],
            correctAnswer: 1,
            explanation: "A change in the price of the good causes movement along the demand curve."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What causes a shift in the demand curve?",
            options: [
              "Change in price of the good",
              "Change in consumer income",
              "Change in quantity demanded",
              "Change in supply"
            ],
            correctAnswer: 1,
            explanation: "A shift in the demand curve is caused by factors other than price, such as income, preferences, or prices of related goods."
          },
          {
            id: 4,
            type: "true_false",
            question: "Normal goods have positive income elasticity of demand.",
            correctAnswer: true,
            explanation: "Normal goods have positive income elasticity - demand increases as income increases."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What are substitute goods?",
            options: [
              "Goods used together",
              "Goods that can replace each other",
              "Goods with the same price",
              "Goods from the same company"
            ],
            correctAnswer: 1,
            explanation: "Substitute goods can replace each other in consumption, like Coke and Pepsi."
          }
        ],
        passingScore: 70,
        xpValue: 25
      },

      "The Law of Supply": {
        title: "The Law of Supply - Knowledge Check",
        description: "Test your understanding of supply theory and producer behavior",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What does the Law of Supply state?",
            options: [
              "Higher prices lead to lower quantity supplied",
              "Higher prices lead to higher quantity supplied",
              "Price doesn't affect supply",
              "Supply is always constant"
            ],
            correctAnswer: 1,
            explanation: "The Law of Supply states that as price increases, quantity supplied increases, and vice versa."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "What causes a movement along the supply curve?",
            options: [
              "Change in production costs",
              "Change in price of the good",
              "Change in technology",
              "Change in number of producers"
            ],
            correctAnswer: 1,
            explanation: "A change in the price of the good causes movement along the supply curve."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What causes a shift in the supply curve?",
            options: [
              "Change in price of the good",
              "Change in production costs",
              "Change in quantity supplied",
              "Change in demand"
            ],
            correctAnswer: 1,
            explanation: "A shift in the supply curve is caused by factors other than price, such as production costs, technology, or number of producers."
          },
          {
            id: 4,
            type: "true_false",
            question: "An increase in production costs shifts the supply curve to the right.",
            correctAnswer: false,
            explanation: "An increase in production costs shifts the supply curve to the left (decreases supply)."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What is the relationship between price and quantity supplied?",
            options: [
              "Inverse relationship",
              "Direct relationship",
              "No relationship",
              "Circular relationship"
            ],
            correctAnswer: 1,
            explanation: "There is a direct relationship between price and quantity supplied - higher prices lead to higher quantities supplied."
          }
        ],
        passingScore: 70,
        xpValue: 25
      },

      "Price Controls (Ceilings and Floors)": {
        title: "Price Controls (Ceilings and Floors) - Knowledge Check",
        description: "Test your understanding of government price interventions",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What is a price ceiling?",
            options: [
              "A maximum price set by government",
              "A minimum price set by government",
              "The market equilibrium price",
              "The highest possible price"
            ],
            correctAnswer: 0,
            explanation: "A price ceiling is a government-imposed maximum price that can be charged for a good or service."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "What is a price floor?",
            options: [
              "A maximum price set by government",
              "A minimum price set by government",
              "The market equilibrium price",
              "The lowest possible price"
            ],
            correctAnswer: 1,
            explanation: "A price floor is a government-imposed minimum price that must be paid for a good or service."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What happens when a price ceiling is set below the equilibrium price?",
            options: [
              "Surplus occurs",
              "Shortage occurs",
              "No effect on market",
              "Price increases"
            ],
            correctAnswer: 1,
            explanation: "When a price ceiling is set below equilibrium, it creates a shortage because quantity demanded exceeds quantity supplied."
          },
          {
            id: 4,
            type: "true_false",
            question: "Price floors are often used to support producers.",
            correctAnswer: true,
            explanation: "Price floors are commonly used to support producers by ensuring they receive a minimum price for their goods."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What is an example of a price ceiling?",
            options: [
              "Minimum wage",
              "Rent control",
              "Agricultural price supports",
              "Import tariffs"
            ],
            correctAnswer: 1,
            explanation: "Rent control is an example of a price ceiling, limiting how much landlords can charge for rent."
          }
        ],
        passingScore: 70,
        xpValue: 25
      },

      "Elasticity": {
        title: "Elasticity - Knowledge Check",
        description: "Test your understanding of price elasticity and market responsiveness",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What is price elasticity of demand?",
            options: [
              "How much price changes",
              "How responsive quantity demanded is to price changes",
              "How much demand changes",
              "The slope of the demand curve"
            ],
            correctAnswer: 1,
            explanation: "Price elasticity of demand measures how responsive quantity demanded is to changes in price."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "What does elastic demand mean?",
            options: [
              "Demand doesn't change with price",
              "Quantity demanded changes significantly with price changes",
              "Price doesn't affect demand",
              "Demand is always high"
            ],
            correctAnswer: 1,
            explanation: "Elastic demand means quantity demanded changes significantly when price changes."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What does inelastic demand mean?",
            options: [
              "Demand changes a lot with price",
              "Quantity demanded changes little with price changes",
              "Price has no effect",
              "Demand is always low"
            ],
            correctAnswer: 1,
            explanation: "Inelastic demand means quantity demanded changes little when price changes."
          },
          {
            id: 4,
            type: "true_false",
            question: "Necessities tend to have inelastic demand.",
            correctAnswer: true,
            explanation: "Necessities like food and medicine tend to have inelastic demand because people need them regardless of price."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What factors affect price elasticity of demand?",
            options: [
              "Only price",
              "Availability of substitutes, necessity, time, and portion of budget",
              "Only income",
              "Only preferences"
            ],
            correctAnswer: 1,
            explanation: "Price elasticity is affected by availability of substitutes, necessity of the good, time period, and portion of budget."
          }
        ],
        passingScore: 70,
        xpValue: 25
      },

      "Consumer and Producer Surplus": {
        title: "Consumer and Producer Surplus - Knowledge Check",
        description: "Test your understanding of economic welfare and market efficiency",
        type: "mixed",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What is consumer surplus?",
            options: [
              "Extra money consumers have",
              "The difference between what consumers are willing to pay and what they actually pay",
              "The total amount consumers spend",
              "Consumer savings accounts"
            ],
            correctAnswer: 1,
            explanation: "Consumer surplus is the difference between what consumers are willing to pay and what they actually pay."
          },
          {
            id: 2,
            type: "multiple_choice",
            question: "What is producer surplus?",
            options: [
              "Extra profit producers make",
              "The difference between what producers receive and their minimum acceptable price",
              "Total producer revenue",
              "Producer savings"
            ],
            correctAnswer: 1,
            explanation: "Producer surplus is the difference between what producers receive and their minimum acceptable price."
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What is total surplus?",
            options: [
              "Only consumer surplus",
              "Only producer surplus",
              "Consumer surplus plus producer surplus",
              "Government revenue"
            ],
            correctAnswer: 2,
            explanation: "Total surplus is the sum of consumer surplus and producer surplus."
          },
          {
            id: 4,
            type: "true_false",
            question: "Market equilibrium maximizes total surplus.",
            correctAnswer: true,
            explanation: "In a competitive market, equilibrium maximizes total surplus, making it economically efficient."
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What happens to consumer surplus when price increases?",
            options: [
              "It increases",
              "It decreases",
              "It stays the same",
              "It becomes zero"
            ],
            correctAnswer: 1,
            explanation: "When price increases, consumer surplus decreases because consumers pay more than they were willing to pay."
          }
        ],
        passingScore: 70,
        xpValue: 25
      }
    };
  }

  // Get quiz content for a specific lesson title
  static getQuizForLesson(lessonTitle) {
    const content = this.getManualQuizContent();
    return content[lessonTitle] || null;
  }

  // Generate quiz data for database insertion
  static generateQuizData(lessonId, lessonTitle) {
    const quizContent = this.getQuizForLesson(lessonTitle);
    
    if (!quizContent) {
      console.warn(`No manual quiz content found for lesson: ${lessonTitle}`);
      return null;
    }

    return {
      lessonId: lessonId,
      title: quizContent.title,
      description: quizContent.description,
      type: quizContent.type,
      questions: quizContent.questions,
      timeLimit: null, // No time limit
      passingScore: quizContent.passingScore,
      xpValue: quizContent.xpValue,
      isActive: true
    };
  }

  // Get all lesson titles that have manual quiz content
  static getAvailableLessonTitles() {
    return Object.keys(this.getManualQuizContent());
  }
}

module.exports = ManualQuizContentGenerator;
