const express = require('express');
const DatabaseService = require('../services/databaseService');
const { authenticateToken } = require('../middleware/auth');
const { validateProgressUpdate } = require('../middleware/validation');
const { calculateLevel } = require('../utils/levelUtils');

const router = express.Router();
const db = new DatabaseService();

// Helper function to ensure user has progress record
async function ensureUserProgress(userId) {
  let progress = await db.query('SELECT * FROM user_progress WHERE "userId" = $1', [userId]);
  
  if (!progress || progress.length === 0) {
    console.log(`Creating new progress record for user ${userId}`);
    
    const newProgress = await db.query(`
      INSERT INTO user_progress (
        id, "userId", level, xp, streak, badges, "completedFacts", "completedLessons", 
        "lastActiveDate", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
    `, [
      db.generateId(),
      userId,
      1, // level
      0, // xp
      0, // streak
      JSON.stringify([]), // badges
      JSON.stringify([]), // completedFacts
      JSON.stringify([]), // completedLessons
      new Date().toISOString(), // lastActiveDate
      new Date().toISOString(), // createdAt
      new Date().toISOString()  // updatedAt
    ]);
    
    progress = newProgress;
  }
  
  return progress[0];
}

// Get user progress
router.get('/', authenticateToken, async (req, res) => {
  try {
    const progress = await ensureUserProgress(req.user.id);
    res.json({ progress });
  } catch (error) {
    console.error('Get progress error:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// Update user progress
router.put('/', authenticateToken, validateProgressUpdate, async (req, res) => {
  try {
    const { level, xp, streak, badges, completedFacts, completedLessons } = req.body;

    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;
    
    if (level) { updateFields.push(`level = $${paramCount++}`); updateValues.push(level); }
    if (xp !== undefined) { updateFields.push(`xp = $${paramCount++}`); updateValues.push(xp); }
    if (streak !== undefined) { updateFields.push(`streak = $${paramCount++}`); updateValues.push(streak); }
    if (badges) { updateFields.push(`badges = $${paramCount++}`); updateValues.push(JSON.stringify(badges)); }
    if (completedFacts) { updateFields.push(`"completedFacts" = $${paramCount++}`); updateValues.push(JSON.stringify(completedFacts)); }
    if (completedLessons) { updateFields.push(`"completedLessons" = $${paramCount++}`); updateValues.push(JSON.stringify(completedLessons)); }
    
    updateFields.push(`"lastActiveDate" = $${paramCount++}`);
    updateValues.push(new Date().toISOString());
    updateValues.push(req.user.id);
    
    const updateQuery = `UPDATE user_progress SET ${updateFields.join(', ')} WHERE "userId" = $${paramCount} RETURNING *`;
    const updatedProgress = await db.query(updateQuery, updateValues);

    res.json({
      message: 'Progress updated successfully',
      progress: updatedProgress[0]
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Add XP to user
router.post('/xp', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid XP amount is required' });
    }

    const progress = await ensureUserProgress(req.user.id);
    const newXp = progress.xp + amount;
    const newLevel = calculateLevel(newXp);

    const updatedProgress = await db.query(
      'UPDATE user_progress SET xp = $1, level = $2, "lastActiveDate" = $3 WHERE "userId" = $4 RETURNING *',
      [newXp, newLevel, new Date().toISOString(), req.user.id]
    );

    res.json({
      message: `Added ${amount} XP`,
      progress: updatedProgress[0],
      levelUp: newLevel > progress.level
    });
  } catch (error) {
    console.error('Add XP error:', error);
    res.status(500).json({ error: 'Failed to add XP' });
  }
});

// Update streak
router.post('/streak', authenticateToken, async (req, res) => {
  try {
    const { increment = 1 } = req.body;

    const currentProgress = await db.query('SELECT * FROM user_progress WHERE "userId" = $1', [req.user.id]);

    if (!currentProgress || currentProgress.length === 0) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    const progress = currentProgress[0];
    const newStreak = Math.max(0, progress.streak + increment);

    const updatedProgress = await db.query(
      'UPDATE user_progress SET streak = $1, "lastActiveDate" = $2 WHERE "userId" = $3 RETURNING *',
      [newStreak, new Date().toISOString(), req.user.id]
    );

    res.json({
      message: `Streak updated to ${newStreak}`,
      progress: updatedProgress[0]
    });
  } catch (error) {
    console.error('Update streak error:', error);
    res.status(500).json({ error: 'Failed to update streak' });
  }
});

// Add badge
router.post('/badges', authenticateToken, async (req, res) => {
  try {
    const { badge } = req.body;

    if (!badge || !badge.id || !badge.name) {
      return res.status(400).json({ error: 'Valid badge object is required' });
    }

    const currentProgress = await db.query('SELECT * FROM user_progress WHERE "userId" = $1', [req.user.id]);

    if (!currentProgress || currentProgress.length === 0) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    const progress = currentProgress[0];
    const currentBadges = progress.badges || [];
    
    // Check if badge already exists
    const badgeExists = currentBadges.some(b => b.id === badge.id);
    
    if (badgeExists) {
      return res.status(400).json({ error: 'Badge already exists' });
    }

    const updatedBadges = [...currentBadges, badge];

    const updatedProgress = await db.query(
      'UPDATE user_progress SET badges = $1, "lastActiveDate" = $2 WHERE "userId" = $3 RETURNING *',
      [JSON.stringify(updatedBadges), new Date().toISOString(), req.user.id]
    );

    res.json({
      message: 'Badge added successfully',
      progress: updatedProgress[0]
    });
  } catch (error) {
    console.error('Add badge error:', error);
    res.status(500).json({ error: 'Failed to add badge' });
  }
});

// Complete a fact
router.post('/complete-fact', authenticateToken, async (req, res) => {
  try {
    const { factId } = req.body;

    if (!factId) {
      return res.status(400).json({ error: 'Fact ID is required' });
    }

    // Check if fact exists
    const fact = await db.query('SELECT * FROM daily_facts WHERE id = $1', [factId]);

    if (!fact || fact.length === 0) {
      return res.status(404).json({ error: 'Fact not found' });
    }

    // Check if already completed
    const existingCompletion = await db.query(
      'SELECT * FROM fact_completions WHERE "userId" = $1 AND "factId" = $2',
      [req.user.id, factId]
    );

    if (existingCompletion && existingCompletion.length > 0) {
      return res.status(400).json({ error: 'Fact already completed' });
    }

    // Check daily limit - only one fact per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCompletion = await db.query(
      'SELECT * FROM fact_completions WHERE "userId" = $1 AND "completedAt" >= $2 AND "completedAt" < $3',
      [req.user.id, today, tomorrow]
    );

    if (todayCompletion && todayCompletion.length > 0) {
      return res.status(400).json({ error: 'You can only complete one fact per day' });
    }

    // Create completion record
    await db.query(
      'INSERT INTO fact_completions (id, "userId", "factId", "completedAt") VALUES ($1, $2, $3, $4)',
      [db.generateId(), req.user.id, factId, new Date().toISOString()]
    );

    // Update user progress with streak logic
    const currentProgress = await db.query('SELECT * FROM user_progress WHERE "userId" = $1', [req.user.id]);
    const progress = currentProgress[0];

    const completedFacts = [...(progress.completedFacts || []), factId];
    const newXp = progress.xp + (fact[0].xpValue || 10);
    const newLevel = calculateLevel(newXp);

    // Calculate streak - since we already checked this is the first fact today,
    // we can safely increment the streak
    let newStreak = progress.streak;
    const lastActiveDate = progress.lastActiveDate;
    const now = new Date();
    
    if (lastActiveDate) {
      const lastActive = new Date(lastActiveDate);
      const daysDifference = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
      
      if (daysDifference === 1) {
        // Consecutive day - increment streak
        newStreak += 1;
      } else if (daysDifference > 1) {
        // Missed days - reset streak to 1
        newStreak = 1;
      } else if (daysDifference === 0) {
        // Same day - this is the first fact completion today, increment streak
        newStreak += 1;
      }
    } else {
      // First time completing a fact
      newStreak = 1;
    }

    const updatedProgress = await db.query(
      'UPDATE user_progress SET "completedFacts" = $1, xp = $2, level = $3, streak = $4, "lastActiveDate" = $5 WHERE "userId" = $6 RETURNING *',
      [JSON.stringify(completedFacts), newXp, newLevel, newStreak, now.toISOString(), req.user.id]
    );

    // Check for streak-based badge unlocks
    let badgeUnlocked = null;
    if (newStreak === 3) {
      try {
        const currentBadges = progress.badges || [];
        const updatedBadges = [...currentBadges, { id: 'streak-3', name: 'Getting Started', description: '3-day streak!' }];
        await db.query(
          'UPDATE user_progress SET badges = $1 WHERE "userId" = $2',
          [JSON.stringify(updatedBadges), req.user.id]
        );
        badgeUnlocked = { id: 'streak-3', name: 'Getting Started' };
      } catch (badgeError) {
        console.error('Error adding 3-day streak badge:', badgeError);
      }
    } else if (newStreak === 7) {
      try {
        const currentBadges = progress.badges || [];
        const updatedBadges = [...currentBadges, { id: 'streak-7', name: 'Fact Finder', description: '7-day streak!' }];
        await db.query(
          'UPDATE user_progress SET badges = $1 WHERE "userId" = $2',
          [JSON.stringify(updatedBadges), req.user.id]
        );
        badgeUnlocked = { id: 'streak-7', name: 'Fact Finder' };
      } catch (badgeError) {
        console.error('Error adding 7-day streak badge:', badgeError);
      }
    } else if (newStreak === 14) {
      try {
        const currentBadges = progress.badges || [];
        const updatedBadges = [...currentBadges, { id: 'streak-14', name: 'Dedicated Learner', description: '14-day streak!' }];
        await db.query(
          'UPDATE user_progress SET badges = $1 WHERE "userId" = $2',
          [JSON.stringify(updatedBadges), req.user.id]
        );
        badgeUnlocked = { id: 'streak-14', name: 'Dedicated Learner' };
      } catch (badgeError) {
        console.error('Error adding 14-day streak badge:', badgeError);
      }
    } else if (newStreak === 30) {
      try {
        const currentBadges = progress.badges || [];
        const updatedBadges = [...currentBadges, { id: 'streak-30', name: 'Streak Master', description: '30-day streak!' }];
        await db.query(
          'UPDATE user_progress SET badges = $1 WHERE "userId" = $2',
          [JSON.stringify(updatedBadges), req.user.id]
        );
        badgeUnlocked = { id: 'streak-30', name: 'Streak Master' };
      } catch (badgeError) {
        console.error('Error adding 30-day streak badge:', badgeError);
      }
    }

    res.json({
      message: 'Fact completed successfully',
      xpEarned: fact[0].xpValue || 10,
      newLevel,
      newStreak,
      badgeUnlocked,
      progress: updatedProgress[0]
    });
  } catch (error) {
    console.error('Complete fact error:', error);
    res.status(500).json({ error: 'Failed to complete fact' });
  }
});

// Complete a lesson
router.post('/complete-lesson', authenticateToken, async (req, res) => {
  console.log('[API] POST /progress/complete-lesson called');
  console.log('[API] Request body:', req.body);
  console.log('[API] Request body type:', typeof req.body);
  console.log('[API] Request body keys:', Object.keys(req.body || {}));
  console.log('[API] User ID:', req.user?.id);
  console.log('[API] User object:', req.user);
  
  try {
    const { lessonId } = req.body;
    console.log('[API] Extracted lessonId:', lessonId);
    console.log('[API] lessonId type:', typeof lessonId);
    console.log('[API] lessonId === undefined:', lessonId === undefined);
    console.log('[API] lessonId === null:', lessonId === null);
    console.log('[API] lessonId === "":', lessonId === '');

    // Validate and parse lessonId
    if (lessonId === undefined || lessonId === null || lessonId === '') {
      console.error('[API] Validation failed: lessonId is missing');
      console.error('[API] Full request body:', JSON.stringify(req.body, null, 2));
      console.error('[API] Raw request body:', req.body);
      return res.status(400).json({ error: 'Lesson ID is required', received: req.body });
    }

    // Parse lessonId to integer
    console.log('[API] Parsing lessonId to integer...');
    const parsedLessonId = parseInt(lessonId, 10);
    console.log('[API] Parsed lessonId:', parsedLessonId);
    console.log('[API] isNaN check:', isNaN(parsedLessonId));
    console.log('[API] <= 0 check:', parsedLessonId <= 0);
    
    if (isNaN(parsedLessonId) || parsedLessonId <= 0) {
      console.error('[API] Validation failed: lessonId is not a valid number');
      console.error('[API] Original lessonId:', lessonId);
      console.error('[API] Parsed lessonId:', parsedLessonId);
      return res.status(400).json({ error: 'Lesson ID must be a valid positive number', received: lessonId, parsed: parsedLessonId });
    }

    // Check if lesson exists
    console.log('[API] Querying database for lesson with id:', parsedLessonId);
    const lesson = await db.query('SELECT * FROM lessons WHERE id = $1', [parsedLessonId]);
    console.log('[API] Lesson query result:', lesson);
    console.log('[API] Lesson found:', lesson && lesson.length > 0);

    if (!lesson || lesson.length === 0) {
      console.error('[API] Lesson not found with id:', parsedLessonId);
      return res.status(404).json({ error: 'Lesson not found', lessonId: parsedLessonId });
    }

    // Check if already completed
    console.log('[API] Checking if lesson already completed for user:', req.user.id);
    const existingCompletion = await db.query(
      'SELECT * FROM lesson_completions WHERE "userId" = $1 AND "lessonId" = $2',
      [req.user.id, parsedLessonId]
    );
    console.log('[API] Existing completion check:', existingCompletion);
    console.log('[API] Already completed:', existingCompletion && existingCompletion.length > 0);

    if (existingCompletion && existingCompletion.length > 0) {
      console.log('[API] Lesson already completed');
      return res.status(400).json({ error: 'Lesson already completed' });
    }

    // Create completion record
    console.log('[API] Creating completion record...');
    const completionId = db.generateId();
    console.log('[API] Completion ID:', completionId);
    await db.query(
      'INSERT INTO lesson_completions (id, "userId", "lessonId", "completedAt") VALUES ($1, $2, $3, $4)',
      [completionId, req.user.id, parsedLessonId, new Date().toISOString()]
    );
    console.log('[API] Completion record created successfully');

    // Ensure user has progress record and update user progress
    console.log('[API] Ensuring user progress record exists...');
    const progress = await ensureUserProgress(req.user.id);
    console.log('[API] User progress:', progress);

    // Parse completedLessons if it's a JSON string, otherwise use as is
    console.log('[API] Processing completedLessons...');
    console.log('[API] completedLessons type:', typeof progress.completedLessons);
    console.log('[API] completedLessons value:', progress.completedLessons);
    const existingCompletedLessons = typeof progress.completedLessons === 'string' 
      ? JSON.parse(progress.completedLessons || '[]')
      : (progress.completedLessons || []);
    console.log('[API] Existing completed lessons:', existingCompletedLessons);
    const completedLessons = [...existingCompletedLessons, parsedLessonId];
    console.log('[API] Updated completed lessons:', completedLessons);
    const xpValue = lesson[0].xpValue || 20;
    const newXp = progress.xp + xpValue;
    console.log('[API] XP calculation:', `${progress.xp} + ${xpValue} = ${newXp}`);
    const newLevel = calculateLevel(newXp);
    console.log('[API] New level:', newLevel);

    console.log('[API] Updating user progress...');
    const updatedProgress = await db.query(
      'UPDATE user_progress SET "completedLessons" = $1, xp = $2, level = $3, "lastActiveDate" = $4 WHERE "userId" = $5 RETURNING *',
      [JSON.stringify(completedLessons), newXp, newLevel, new Date().toISOString(), req.user.id]
    );
    console.log('[API] Progress updated successfully');

    const response = {
      message: 'Lesson completed successfully',
      xpEarned: xpValue,
      newLevel,
      progress: updatedProgress[0]
    };
    console.log('[API] Sending success response:', response);
    res.json(response);
  } catch (error) {
    console.error('[API] Complete lesson error:', error);
    console.error('[API] Error name:', error.name);
    console.error('[API] Error message:', error.message);
    console.error('[API] Error details:', error.stack);
    console.error('[API] Request body:', req.body);
    console.error('[API] Request body type:', typeof req.body);
    console.error('[API] User ID:', req.user?.id);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to complete lesson', details: error.message, stack: error.stack });
    }
  }
});

module.exports = router;