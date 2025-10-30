const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// User validation
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('ageRange')
    .isIn(['13-17', '18-24', '25-34', '35+'])
    .withMessage('Invalid age range'),
  body('financialGoal')
    .isIn(['college', 'investing', 'budgeting', 'retirement', 'emergency'])
    .withMessage('Invalid financial goal'),
  body('learningMode')
    .optional()
    .isIn(['facts', 'courses'])
    .withMessage('Invalid learning mode'),
  handleValidationErrors
];

const validateUserUpdate = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('ageRange')
    .optional()
    .isIn(['13-17', '18-24', '25-34', '35+'])
    .withMessage('Invalid age range'),
  body('financialGoal')
    .optional()
    .isIn(['college', 'investing', 'budgeting', 'retirement', 'emergency'])
    .withMessage('Invalid financial goal'),
  body('learningMode')
    .optional()
    .isIn(['facts', 'courses'])
    .withMessage('Invalid learning mode'),
  handleValidationErrors
];

// Progress validation
const validateProgressUpdate = [
  body('level')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Level must be between 1 and 100'),
  body('xp')
    .optional()
    .isInt({ min: 0 })
    .withMessage('XP must be a positive integer'),
  body('streak')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Streak must be a positive integer'),
  handleValidationErrors
];

// Portfolio validation - buy endpoint
const validatePortfolioBuy = [
  body('symbol')
    .trim()
    .notEmpty()
    .isLength({ min: 1, max: 10 })
    .withMessage('Symbol is required and must be 1-10 characters'),
  body('quantity')
    .notEmpty()
    .isFloat({ min: 0.0001 })
    .withMessage('Quantity must be a positive number'),
  body('price')
    .notEmpty()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  handleValidationErrors
];

// Portfolio validation - sell endpoint
const validatePortfolioSell = [
  body('symbol')
    .trim()
    .notEmpty()
    .isLength({ min: 1, max: 10 })
    .withMessage('Symbol is required and must be 1-10 characters'),
  body('quantity')
    .notEmpty()
    .isFloat({ min: 0.0001 })
    .withMessage('Quantity must be a positive number'),
  body('price')
    .notEmpty()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  handleValidationErrors
];

// Legacy validation for backward compatibility (if needed elsewhere)
const validatePortfolioTransaction = [
  body('symbol')
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Symbol is required and must be 1-10 characters'),
  body('shares')
    .optional()
    .isFloat({ min: 0.0001 })
    .withMessage('Shares must be a positive number'),
  body('quantity')
    .optional()
    .isFloat({ min: 0.0001 })
    .withMessage('Quantity must be a positive number'),
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  body('type')
    .optional()
    .isIn(['buy', 'sell'])
    .withMessage('Type must be either buy or sell'),
  handleValidationErrors
];

// Chat validation
const validateChatMessage = [
  body('message')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  handleValidationErrors
];

// Parameter validation
const validateId = [
  param('id')
    .isLength({ min: 1 })
    .withMessage('ID is required'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserUpdate,
  validateProgressUpdate,
  validatePortfolioBuy,
  validatePortfolioSell,
  validatePortfolioTransaction,
  validateChatMessage,
  validateId
};
