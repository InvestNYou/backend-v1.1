const jwt = require('jsonwebtoken');
const DatabaseService = require('../services/databaseService');

const db = new DatabaseService();

// Helper function to send CORS-aware error responses
const sendCorsError = (res, status, message) => {
  // Set CORS headers for error responses
  const origin = res.getHeader('Access-Control-Allow-Origin') || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
  
  return res.status(status).json({ error: message });
};

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return sendCorsError(res, 401, 'Access token required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists
    const user = await db.query('SELECT id, email, name FROM users WHERE id = $1', [decoded.userId]);

    if (!user || user.length === 0) {
      return sendCorsError(res, 401, 'User not found');
    }

    req.user = user[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendCorsError(res, 401, 'Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      return sendCorsError(res, 401, 'Invalid token');
    }
    return sendCorsError(res, 500, 'Token verification failed');
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.query('SELECT id, email, name FROM users WHERE id = $1', [decoded.userId]);

    req.user = user && user.length > 0 ? user[0] : null;
    next();
  } catch (error) {
    // For optional auth, we don't send errors, just set user to null
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};
