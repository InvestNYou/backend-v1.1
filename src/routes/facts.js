const express = require('express');
const DatabaseService = require('../services/databaseService');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const db = new DatabaseService();

// Get all daily facts
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const skip = (page - 1) * limit;

    let whereClause = 'WHERE "isActive" = true';
    const params = [];
    let paramCount = 1;

    if (category) {
      whereClause += ` AND category = $${paramCount++}`;
      params.push(category);
    }

    const facts = await db.query(
      `SELECT * FROM daily_facts ${whereClause} ORDER BY "createdAt" DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, parseInt(limit), parseInt(skip)]
    );

    const totalResult = await db.query(
      `SELECT COUNT(*) as count FROM daily_facts ${whereClause}`,
      params
    );
    const total = parseInt(totalResult[0].count);

    res.json({
      facts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get facts error:', error);
    res.status(500).json({ error: 'Failed to get facts' });
  }
});

// Get today's fact
router.get('/today', optionalAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

    let dailyFact = null;
    let isCompleted = false;
    let canCompleteToday = true;

    if (req.user) {
      // Check if user has already completed a fact today
      const todayCompletion = await db.query(
        'SELECT f.* FROM fact_completions fc JOIN daily_facts f ON fc."factId" = f.id WHERE fc."userId" = $1 AND fc."completedAt" >= $2 AND fc."completedAt" < $3',
        [req.user.id, today, tomorrow]
      );

      if (todayCompletion && todayCompletion.length > 0) {
        // User already completed today's fact
        dailyFact = todayCompletion[0];
        isCompleted = true;
        canCompleteToday = false;
      } else {
        // User hasn't completed today's fact yet
        // Get all facts user hasn't completed
        const completedFactIds = await db.query(
          'SELECT "factId" FROM fact_completions WHERE "userId" = $1',
          [req.user.id]
        );

        const completedIds = completedFactIds.map(c => c.factId);
        
        // Get available facts (not completed by user)
        let availableFacts;
        if (completedIds.length > 0) {
          const placeholders = completedIds.map((_, index) => `$${index + 1}`).join(', ');
          availableFacts = await db.query(
            `SELECT * FROM daily_facts WHERE "isActive" = true AND id NOT IN (${placeholders})`,
            completedIds
          );
        } else {
          availableFacts = await db.query(
            'SELECT * FROM daily_facts WHERE "isActive" = true',
            []
          );
        }

        if (availableFacts.length === 0) {
          // User has completed all facts, get a random one
          const allFacts = await db.query('SELECT * FROM daily_facts WHERE "isActive" = true', []);
          dailyFact = allFacts[Math.floor(Math.random() * allFacts.length)];
        } else {
          // Get random fact from available facts
          dailyFact = availableFacts[Math.floor(Math.random() * availableFacts.length)];
        }
      }
    } else {
      // Not authenticated, get random fact
      const facts = await db.query('SELECT * FROM daily_facts WHERE "isActive" = true', []);

      if (facts.length === 0) {
        return res.status(404).json({ error: 'No facts available' });
      }

      dailyFact = facts[Math.floor(Math.random() * facts.length)];
    }

    if (!dailyFact) {
      return res.status(404).json({ error: 'No facts available' });
    }

    res.json({
      fact: {
        ...dailyFact,
        isCompleted,
        canCompleteToday
      }
    });
  } catch (error) {
    console.error('Get today fact error:', error);
    res.status(500).json({ error: 'Failed to get today\'s fact' });
  }
});

// Get specific fact by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const factId = req.params.id;

    const fact = await db.query('SELECT * FROM daily_facts WHERE id = $1', [factId]);

    if (!fact || fact.length === 0) {
      return res.status(404).json({ error: 'Fact not found' });
    }

    // If user is authenticated, check if they've completed this fact
    let isCompleted = false;
    if (req.user) {
      const completion = await db.query(
        'SELECT * FROM fact_completions WHERE "userId" = $1 AND "factId" = $2',
        [req.user.id, factId]
      );
      isCompleted = completion && completion.length > 0;
    }

    res.json({
      fact: {
        ...fact[0],
        isCompleted
      }
    });
  } catch (error) {
    console.error('Get fact error:', error);
    res.status(500).json({ error: 'Failed to get fact' });
  }
});

// Get user's completed facts
router.get('/user/completed', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const completions = await db.query(
      'SELECT fc.*, f.* FROM fact_completions fc JOIN daily_facts f ON fc."factId" = f.id WHERE fc."userId" = $1 ORDER BY fc."completedAt" DESC LIMIT $2 OFFSET $3',
      [req.user.id, parseInt(limit), parseInt(skip)]
    );

    const totalResult = await db.query(
      'SELECT COUNT(*) as count FROM fact_completions WHERE "userId" = $1',
      [req.user.id]
    );
    const total = parseInt(totalResult[0].count);

    res.json({
      completedFacts: completions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get completed facts error:', error);
    res.status(500).json({ error: 'Failed to get completed facts' });
  }
});

// Get fact categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await db.query(
      'SELECT DISTINCT category FROM daily_facts WHERE "isActive" = true',
      []
    );

    res.json({
      categories: categories.map(c => c.category)
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// Get facts by category
router.get('/category/:category', optionalAuth, async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const facts = await db.query(
      'SELECT * FROM daily_facts WHERE category = $1 AND "isActive" = true ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3',
      [category, parseInt(limit), parseInt(skip)]
    );

    const totalResult = await db.query(
      'SELECT COUNT(*) as count FROM daily_facts WHERE category = $1 AND "isActive" = true',
      [category]
    );
    const total = parseInt(totalResult[0].count);

    res.json({
      facts,
      category,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get facts by category error:', error);
    res.status(500).json({ error: 'Failed to get facts by category' });
  }
});

// Search facts
router.get('/search/:query', optionalAuth, async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const facts = await db.query(
      'SELECT * FROM daily_facts WHERE "isActive" = true AND (LOWER(title) LIKE LOWER($1) OR LOWER(content) LIKE LOWER($1) OR LOWER(category) LIKE LOWER($1)) ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3',
      [`%${query}%`, parseInt(limit), parseInt(skip)]
    );

    const totalResult = await db.query(
      'SELECT COUNT(*) as count FROM daily_facts WHERE "isActive" = true AND (LOWER(title) LIKE LOWER($1) OR LOWER(content) LIKE LOWER($1) OR LOWER(category) LIKE LOWER($1))',
      [`%${query}%`]
    );
    const total = parseInt(totalResult[0].count);

    res.json({
      facts,
      query,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search facts error:', error);
    res.status(500).json({ error: 'Failed to search facts' });
  }
});

module.exports = router;