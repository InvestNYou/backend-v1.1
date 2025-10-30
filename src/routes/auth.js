const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DatabaseService = require('../services/databaseService');
const { validateUserRegistration } = require('../middleware/validation');

const router = express.Router();
const db = new DatabaseService();

router.post('/register', validateUserRegistration, async (req, res) => {
  try {
    const { email, password, name, ageRange, financialGoal, learningMode } = req.body;

    const existingUser = await db.findUser(email);

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    const user = await db.createUser({
      email,
      password: hashedPassword,
      name,
      ageRange,
      financialGoal,
      learningMode: learningMode || 'facts'
    });

    console.log('Created user:', user);

    if (!user || !user.id) {
      throw new Error('Failed to create user - no user ID returned');
    }

    // Use the proper database service method for creating user progress
    await db.createUserProgress(user.id);

    // Use the proper database service method for creating user portfolio
    await db.createUserPortfolio(user.id);

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        ageRange: user.ageRange,
        financialGoal: user.financialGoal,
        learningMode: user.learningMode
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user
    const user = await db.findUser(email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check password if user has one
    if (user.password) {
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid password' });
      }
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        ageRange: user.ageRange,
        financialGoal: user.financialGoal,
        learningMode: user.learningMode,
        progress: user.progress,
        portfolio: user.portfolio
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Guest login (no email required)
router.post('/guest', async (req, res) => {
  try {
    const { name, ageRange, financialGoal, learningMode } = req.body;

    // Create guest user with temporary email
    const guestEmail = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@moneysmart.app`;
    
    const user = await db.createUser({
      email: guestEmail,
      name: name || 'Guest User',
      ageRange: ageRange || '18-24',
      financialGoal: financialGoal || 'investing',
      learningMode: learningMode || 'facts'
    });

    // Create user progress and portfolio using proper service methods
    await db.createUserProgress(user.id);
    await db.createUserPortfolio(user.id);

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Guest user created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        ageRange: user.ageRange,
        financialGoal: user.financialGoal,
        learningMode: user.learningMode
      },
      token
    });
  } catch (error) {
    console.error('Guest registration error:', error);
    res.status(500).json({ error: 'Failed to create guest user' });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await db.findUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        ageRange: user.ageRange,
        financialGoal: user.financialGoal,
        learningMode: user.learningMode,
        progress: user.progress,
        portfolio: user.portfolio
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
