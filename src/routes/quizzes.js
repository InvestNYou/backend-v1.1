const express = require('express');
const DatabaseService = require('../services/databaseService');
const { authenticateToken } = require('../middleware/auth');
const { validateProgressUpdate } = require('../middleware/validation');
const { calculateLevel } = require('../utils/levelUtils');
const QuizGradingService = require('../services/quizGradingService');
const LessonQuizGenerator = require('../services/lessonQuizGenerator');
const { safeParseQuizQuestions, createJSONParseErrorResponse } = require('../utils/jsonUtils');

const router = express.Router();
const db = new DatabaseService();

// Get quiz attempts for a specific lesson
router.get('/lesson/:lessonId/attempts', authenticateToken, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;
    
    // Convert lessonId to integer
    const numericLessonId = parseInt(lessonId);
    if (isNaN(numericLessonId)) {
      return res.status(400).json({ error: 'Invalid lesson ID format' });
    }

    // Get all database quizzes for this lesson
    const quizzes = await db.query(
      'SELECT id FROM quizzes WHERE "lessonId" = $1',
      [numericLessonId]
    );

    const quizIds = quizzes.map(q => q.id);
    const generatedQuizId = `quiz-${lessonId}`;

    let attempts = [];

    // Get attempts for database quizzes (if any exist)
    if (quizIds.length > 0) {
      const placeholders = quizIds.map((_, index) => `$${index + 2}`).join(',');
      const dbAttempts = await db.query(
        `SELECT * FROM quiz_attempts WHERE "userId" = $1 AND "quizId" IN (${placeholders}) ORDER BY "completedAt" DESC`,
        [userId, ...quizIds]
      );
      attempts = attempts.concat(dbAttempts);
    }

    // Note: Generated quiz attempts (with quizId like "quiz-3") cannot be queried if quizId is Int type
    // If quizId column is TEXT/VARCHAR, they would need to be queried differently
    // For now, we only return attempts for database quizzes (integer quizIds)

    // Remove duplicates (in case of any overlap) and sort by completion time
    const uniqueAttempts = attempts.filter((attempt, index, self) =>
      index === self.findIndex(a => a.id === attempt.id)
    );
    uniqueAttempts.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    res.json(uniqueAttempts);
  } catch (error) {
    console.error('Get lesson quiz attempts error:', error);
    res.status(500).json({ error: 'Failed to get lesson quiz attempts' });
  }
});

// Get quiz by ID
router.get('/:quizId', authenticateToken, async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    console.log('[QUIZZES][GET /:quizId] Incoming request', {
      quizId,
      userId,
      time: new Date().toISOString()
    });

    // Handle both integer IDs and string IDs like "quiz-11"
    let quiz;
    if (quizId.startsWith('quiz-')) {
      // This is a request for a lesson without a database quiz
      // Generate a quiz based on the lesson content
      const lessonId = parseInt(quizId.replace('quiz-', ''));
      const quizGenerator = new LessonQuizGenerator();
      
      try {
        quiz = await quizGenerator.generateLessonQuiz(lessonId);
        console.log('[QUIZZES] ✅ Generated lesson-based quiz', {
          id: quiz.id,
          title: quiz.title,
          questionsCount: quiz.questions.length
        });
      } catch (error) {
        console.error('[QUIZZES] ❌ Failed to generate lesson quiz', {
          error: error.message,
          stack: error.stack
        });
        return res.status(500).json({ error: 'Failed to generate quiz' });
      }
    } else {
      // Regular database quiz - convert quizId to integer
      const numericQuizId = parseInt(quizId);
      if (isNaN(numericQuizId)) {
        return res.status(400).json({ error: 'Invalid quiz ID format' });
      }
      
      console.log('[QUIZZES] Fetching quiz from DB', { numericQuizId });
      const quizResult = await db.query('SELECT * FROM quizzes WHERE id = $1', [numericQuizId]);
      
      if (!quizResult || quizResult.length === 0) {
        return res.status(404).json({ error: 'Quiz not found' });
      }
      
      quiz = quizResult[0];
      
      // Validate and parse questions JSON
      try {
        const rawType = typeof quiz.questions;
        const rawPreview = typeof quiz.questions === 'string' ? quiz.questions.substring(0, 80) : undefined;
        console.log('[QUIZZES] Parsing questions', { rawType, rawPreview });
        quiz.questions = safeParseQuizQuestions(quiz.questions, `quiz ${quizId}`);
        console.log('[QUIZZES] Parsed questions OK', { questionsLength: Array.isArray(quiz.questions) ? quiz.questions.length : null });
      } catch (error) {
        console.error('[QUIZZES] Failed to parse quiz questions', {
          error: error.message,
          code: error.code
        });
        return res.status(500).json(createJSONParseErrorResponse(error, 'quiz questions'));
      }
    }

    console.log('[QUIZZES] Returning quiz response', {
      quizId: quiz?.id || quizId,
      title: quiz?.title,
    questionsLength: Array.isArray(quiz?.questions) ? quiz.questions.length : null
    });
    try {
      const firstQuestion = Array.isArray(quiz?.questions) && quiz.questions.length > 0 ? quiz.questions[0] : null;
      console.log('[QUIZZES] Response shape preview', {
        hasQuiz: !!quiz,
        hasQuestions: Array.isArray(quiz?.questions),
        firstQuestionType: firstQuestion?.type,
        firstQuestionHasOptions: Array.isArray(firstQuestion?.options)
      });
    } catch (e) {
      console.warn('[QUIZZES] Error logging response preview', e?.message);
    }
    res.json({ quiz });
  } catch (error) {
    console.error('[QUIZZES] Get quiz error', { message: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to get quiz' });
  }
});

// Get attempts for a specific quiz
router.get('/:quizId/attempts', authenticateToken, async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    console.log('[QUIZZES][GET /:quizId/attempts] Incoming request', {
      quizId,
      userId,
      time: new Date().toISOString()
    });

    // Support both numeric DB quizzes and generated quizzes (e.g., "quiz-6")
    const quizIdForDb = quizId.startsWith('quiz-') ? quizId : parseInt(quizId);
    if (!quizId.startsWith('quiz-') && isNaN(quizIdForDb)) {
      return res.status(400).json({ error: 'Invalid quiz ID format' });
    }

    const attempts = await db.query(
      'SELECT * FROM quiz_attempts WHERE "userId" = $1 AND "quizId" = $2 ORDER BY "completedAt" DESC',
      [userId, quizIdForDb]
    );

    console.log('[QUIZZES] Returning quiz attempts', {
      count: Array.isArray(attempts) ? attempts.length : null
    });
    res.json(attempts);
  } catch (error) {
    console.error('[QUIZZES] Get quiz attempts error', { message: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to get quiz attempts' });
  }
});

// Submit quiz answers
router.post('/:quizId/submit', authenticateToken, async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    console.log('[QUIZZES][POST /:quizId/submit] Incoming submission', {
      quizId,
      userId,
      answersType: Array.isArray(answers) ? 'array' : typeof answers,
      answersLength: Array.isArray(answers) ? answers.length : undefined,
      time: new Date().toISOString()
    });

    // Expect an answers object keyed by questionId
    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers object is required' });
    }

    // Get quiz
    let quiz;
    if (quizId.startsWith('quiz-')) {
      const lessonId = parseInt(quizId.replace('quiz-', ''));
      const quizGenerator = new LessonQuizGenerator();
      quiz = await quizGenerator.generateLessonQuiz(lessonId);
    } else {
      // Regular database quiz - convert quizId to integer
      const numericQuizId = parseInt(quizId);
      if (isNaN(numericQuizId)) {
        return res.status(400).json({ error: 'Invalid quiz ID format' });
      }
      
      console.log('[QUIZZES] Fetching quiz for grading from DB', { numericQuizId });
      const quizResult = await db.query('SELECT * FROM quizzes WHERE id = $1', [numericQuizId]);
      if (!quizResult || quizResult.length === 0) {
        return res.status(404).json({ error: 'Quiz not found' });
      }
      quiz = quizResult[0];

      // Validate and parse questions JSON
      try {
        const rawType = typeof quiz.questions;
        const rawPreview = typeof quiz.questions === 'string' ? quiz.questions.substring(0, 80) : undefined;
        console.log('[QUIZZES] Parsing questions for grading', { rawType, rawPreview });
        quiz.questions = safeParseQuizQuestions(quiz.questions, `quiz ${quizId}`);
        console.log('[QUIZZES] Parsed questions for grading OK', { questionsLength: Array.isArray(quiz.questions) ? quiz.questions.length : null });
      } catch (error) {
        console.error('[QUIZZES] Failed to parse quiz questions for grading', { error: error.message, code: error.code });
        return res.status(500).json(createJSONParseErrorResponse(error, 'quiz questions'));
      }
    }

    // Grade the quiz
    const gradingService = new QuizGradingService();
    console.log('[QUIZZES] Grading quiz', {
      quizIdForGrading: quiz?.id || quizId,
      questionsLength: Array.isArray(quiz?.questions) ? quiz.questions.length : null
    });
    const result = await gradingService.gradeQuiz(quiz.questions, answers);
    console.log('[QUIZZES] Grading complete', {
      score: result?.totalScore,
      totalQuestions: result?.totalQuestions,
      passed: result?.passed
    });

    // Save quiz attempt
    const quizIdForDb = quizId.startsWith('quiz-') ? quizId : parseInt(quizId);
    await db.query(
      'INSERT INTO quiz_attempts (id, "userId", "quizId", answers, score, passed, "completedAt") VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [db.generateId(), userId, quizIdForDb, JSON.stringify(answers), result.totalScore, result.passed, new Date().toISOString()]
    );

    res.json({
      score: result.totalScore,
      totalQuestions: result.totalQuestions,
      correctAnswers: result.correctAnswers,
      feedback: result.results,
      detailedResults: result.results, // per-question grades for frontend UI
      passed: result.passed,
      aiUsed: result.aiUsed
    });
  } catch (error) {
    console.error('[QUIZZES] Submit quiz error', { message: error.message, stack: error.stack });
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

// Get user's quiz attempts
router.get('/attempts/history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const attempts = await db.query(
      'SELECT * FROM quiz_attempts WHERE "userId" = $1 ORDER BY "completedAt" DESC LIMIT $2 OFFSET $3',
      [req.user.id, parseInt(limit), parseInt(skip)]
    );

    const totalResult = await db.query(
      'SELECT COUNT(*) as count FROM quiz_attempts WHERE "userId" = $1',
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
    console.error('Get quiz attempts error:', error);
    res.status(500).json({ error: 'Failed to get quiz attempts' });
  }
});

module.exports = router;