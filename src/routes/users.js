const express = require('express');
const DatabaseService = require('../services/databaseService');
const { authenticateToken } = require('../middleware/auth');
const { validateUserUpdate, validateId } = require('../middleware/validation');

const router = express.Router();
const db = new DatabaseService();

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const progress = await db.query('SELECT * FROM user_progress WHERE "userId" = $1', [req.user.id]);
    const portfolio = await db.query('SELECT * FROM user_portfolios WHERE "userId" = $1', [req.user.id]);
    
    const userData = user[0];
    if (userData) {
      userData.progress = progress[0] || null;
      userData.portfolio = portfolio[0] || null;
    }

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        ageRange: userData.ageRange,
        financialGoal: userData.financialGoal,
        learningMode: userData.learningMode,
        createdAt: userData.createdAt,
        progress: userData.progress,
        portfolio: userData.portfolio
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, validateUserUpdate, async (req, res) => {
  try {
    const { name, ageRange, financialGoal, learningMode } = req.body;

    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;
    
    if (name) { updateFields.push(`name = $${paramCount++}`); updateValues.push(name); }
    if (ageRange) { updateFields.push(`"ageRange" = $${paramCount++}`); updateValues.push(ageRange); }
    if (financialGoal) { updateFields.push(`"financialGoal" = $${paramCount++}`); updateValues.push(financialGoal); }
    if (learningMode) { updateFields.push(`"learningMode" = $${paramCount++}`); updateValues.push(learningMode); }
    
    updateFields.push(`"updatedAt" = $${paramCount++}`);
    updateValues.push(new Date().toISOString());
    updateValues.push(req.user.id);
    
    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const updatedUser = await db.query(updateQuery, updateValues);
    
    const progress = await db.query('SELECT * FROM user_progress WHERE "userId" = $1', [req.user.id]);
    const portfolio = await db.query('SELECT * FROM user_portfolios WHERE "userId" = $1', [req.user.id]);
    
    const userData = updatedUser[0];
    if (userData) {
      userData.progress = progress[0] || null;
      userData.portfolio = portfolio[0] || null;
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        ageRange: userData.ageRange,
        financialGoal: userData.financialGoal,
        learningMode: userData.learningMode,
        progress: userData.progress,
        portfolio: userData.portfolio
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Delete user account
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = $1', [req.user.id]);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const user = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const progress = await db.query('SELECT * FROM user_progress WHERE "userId" = $1', [req.user.id]);
    const portfolio = await db.query('SELECT * FROM user_portfolios WHERE "userId" = $1', [req.user.id]);
    const transactions = await db.query('SELECT * FROM portfolio_transactions WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 10', [req.user.id]);
    const chatMessages = await db.query('SELECT * FROM chat_messages WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 5', [req.user.id]);
    
    const userData = user[0];
    if (userData) {
      userData.progress = progress[0] || null;
      userData.portfolio = portfolio[0] || null;
      userData.transactions = transactions;
      userData.chatMessages = chatMessages;
    }

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    const totalTransactionsResult = await db.query('SELECT COUNT(*) as count FROM portfolio_transactions WHERE "userId" = $1', [req.user.id]);
    const totalChatMessagesResult = await db.query('SELECT COUNT(*) as count FROM chat_messages WHERE "userId" = $1', [req.user.id]);
    
    const totalTransactions = parseInt(totalTransactionsResult[0].count);
    const totalChatMessages = parseInt(totalChatMessagesResult[0].count);

    const completedFactsCount = userData.progress?.completedFacts?.length || 0;
    const completedLessonsCount = userData.progress?.completedLessons?.length || 0;

    res.json({
      stats: {
        level: userData.progress?.level || 1,
        xp: userData.progress?.xp || 0,
        streak: userData.progress?.streak || 0,
        badges: userData.progress?.badges || [],
        completedFacts: completedFactsCount,
        completedLessons: completedLessonsCount,
        totalTransactions,
        totalChatMessages,
        portfolioValue: userData.portfolio?.totalValue || 10000,
        balance: userData.portfolio?.balance || 10000,
        recentTransactions: userData.transactions,
        recentChatMessages: userData.chatMessages
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get user statistics' });
  }
});

module.exports = router;