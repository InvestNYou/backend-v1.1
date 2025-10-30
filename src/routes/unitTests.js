const express = require('express');
const DatabaseService = require('../services/databaseService');
const { authenticateToken } = require('../middleware/auth');
const { safeParseQuizQuestions, createJSONParseErrorResponse } = require('../utils/jsonUtils');
const { calculateLevel } = require('../utils/levelUtils');

const router = express.Router();
const db = new DatabaseService();

// Get unit test by ID
router.get('/:testId', authenticateToken, async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user.id;

    const test = await db.query(
      'SELECT ut.*, c.title as "courseTitle" FROM unit_tests ut JOIN courses c ON ut."courseId" = c.id WHERE ut.id = $1',
      [parseInt(testId)]
    );

    if (!test || test.length === 0) {
      return res.status(404).json({ error: 'Unit test not found' });
    }

    res.json(test[0]);
  } catch (error) {
    console.error('Error fetching unit test:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit unit test answers
router.post('/:testId/submit', authenticateToken, async (req, res) => {
  try {
    const { testId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers array is required' });
    }

    // Get unit test
    const test = await db.query('SELECT * FROM unit_tests WHERE id = $1', [parseInt(testId)]);
    
    if (!test || test.length === 0) {
      return res.status(404).json({ error: 'Unit test not found' });
    }

    const testData = test[0];
    
    // Validate and parse questions JSON
    let questions;
    try {
      questions = safeParseQuizQuestions(testData.questions, `unit test ${testId}`);
    } catch (error) {
      console.error('Failed to parse unit test questions:', error);
      return res.status(500).json(createJSONParseErrorResponse(error, 'unit test questions'));
    }
    
    // Grade the test
    let correctAnswers = 0;
    const feedback = [];

    answers.forEach((answer, index) => {
      const question = questions[index];
      if (question && answer === question.correctAnswer) {
        correctAnswers++;
        feedback.push({
          questionIndex: index,
          correct: true,
          userAnswer: answer,
          correctAnswer: question.correctAnswer
        });
      } else {
        feedback.push({
          questionIndex: index,
          correct: false,
          userAnswer: answer,
          correctAnswer: question ? question.correctAnswer : 'N/A'
        });
      }
    });

    const score = (correctAnswers / questions.length) * 100;
    const passed = score >= 70; // 70% passing grade

    // Save test attempt
    await db.query(
      'INSERT INTO unit_test_attempts (id, "userId", "testId", answers, score, passed, "completedAt") VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [db.generateId(), userId, parseInt(testId), JSON.stringify(answers), score, passed, new Date().toISOString()]
    );

    // Award XP if passed
    if (passed) {
      const xpAwarded = testData.xpValue || 50;
      
      // Update user progress
      const progress = await db.query('SELECT * FROM user_progress WHERE "userId" = $1', [userId]);
      if (progress && progress.length > 0) {
        const currentProgress = progress[0];
        const newXp = currentProgress.xp + xpAwarded;
        const newLevel = calculateLevel(newXp);

        await db.query(
          'UPDATE user_progress SET xp = $1, level = $2, "lastActiveDate" = $3 WHERE "userId" = $4',
          [newXp, newLevel, new Date().toISOString(), userId]
        );
      }
    }

    res.json({
      score,
      totalQuestions: questions.length,
      correctAnswers,
      passed,
      feedback,
      xpAwarded: passed ? (testData.xpValue || 50) : 0
    });
  } catch (error) {
    console.error('Submit unit test error:', error);
    res.status(500).json({ error: 'Failed to submit unit test' });
  }
});

// Get user's unit test attempts
router.get('/attempts/history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const attempts = await db.query(
      'SELECT uta.*, ut.title as "testTitle", c.title as "courseTitle" FROM unit_test_attempts uta JOIN unit_tests ut ON uta."testId" = ut.id JOIN courses c ON ut."courseId" = c.id WHERE uta."userId" = $1 ORDER BY uta."completedAt" DESC LIMIT $2 OFFSET $3',
      [req.user.id, parseInt(limit), parseInt(skip)]
    );

    const totalResult = await db.query(
      'SELECT COUNT(*) as count FROM unit_test_attempts WHERE "userId" = $1',
      [req.user.id]
    );
    const total = parseInt(totalResult[0].count);

    res.json({
      attempts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get unit test attempts error:', error);
    res.status(500).json({ error: 'Failed to get unit test attempts' });
  }
});

module.exports = router;