const express = require('express');
const DatabaseService = require('../services/databaseService');
const { authenticateToken } = require('../middleware/auth');
const { validateChatMessage } = require('../middleware/validation');
const GPTService = require('../services/gptService');

const router = express.Router();
const db = new DatabaseService();
const gptService = new GPTService();

// Get chat history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const messages = await db.query(
      'SELECT * FROM chat_messages WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT $2 OFFSET $3',
      [req.user.id, parseInt(limit), parseInt(skip)]
    );

    const totalResult = await db.query(
      'SELECT COUNT(*) as count FROM chat_messages WHERE "userId" = $1',
      [req.user.id]
    );
    const total = parseInt(totalResult[0].count);

    res.json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});

// Send message
router.post('/send', authenticateToken, validateChatMessage, async (req, res) => {
  try {
    const { message, context } = req.body;
    const userId = req.user.id;

    // Save user message
    const userMessage = await db.query(
      'INSERT INTO chat_messages (id, "userId", role, content, context, "createdAt") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [db.generateId(), userId, 'user', message, JSON.stringify(context || {}), new Date().toISOString()]
    );

    // Get AI response
    let aiResponse;
    try {
      aiResponse = await gptService.generateResponse(message, context);
    } catch (gptError) {
      console.error('GPT service error:', gptError);
      aiResponse = "I'm sorry, I'm having trouble responding right now. Please try again later.";
    }

    // Save AI response
    const aiMessage = await db.query(
      'INSERT INTO chat_messages (id, "userId", role, content, context, "createdAt") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [db.generateId(), userId, 'assistant', aiResponse, JSON.stringify(context || {}), new Date().toISOString()]
    );

    res.json({
      userMessage: userMessage[0],
      aiMessage: aiMessage[0]
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Clear chat history
router.delete('/history', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM chat_messages WHERE "userId" = $1', [req.user.id]);

    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

// Get chat statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const totalMessagesResult = await db.query(
      'SELECT COUNT(*) as count FROM chat_messages WHERE "userId" = $1',
      [req.user.id]
    );
    const totalMessages = parseInt(totalMessagesResult[0].count);

    const userMessagesResult = await db.query(
      'SELECT COUNT(*) as count FROM chat_messages WHERE "userId" = $1 AND role = $2',
      [req.user.id, 'user']
    );
    const userMessages = parseInt(userMessagesResult[0].count);

    const aiMessagesResult = await db.query(
      'SELECT COUNT(*) as count FROM chat_messages WHERE "userId" = $1 AND role = $2',
      [req.user.id, 'assistant']
    );
    const aiMessages = parseInt(aiMessagesResult[0].count);

    res.json({
      totalMessages,
      userMessages,
      aiMessages,
      averageMessagesPerDay: totalMessages > 0 ? Math.round(totalMessages / 30) : 0
    });
  } catch (error) {
    console.error('Get chat stats error:', error);
    res.status(500).json({ error: 'Failed to get chat statistics' });
  }
});

module.exports = router;