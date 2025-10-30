const express = require('express');
const DatabaseService = require('../services/databaseService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = new DatabaseService();

// Get all courses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const courses = await db.query(
      'SELECT * FROM courses ORDER BY "order" ASC',
      []
    );

    // Get user's lesson completions
    const userCompletions = await db.query(
      'SELECT "lessonId" FROM lesson_completions WHERE "userId" = $1',
      [req.user.id]
    );

    const completedLessonIds = new Set(userCompletions.map(c => c.lessonId));

    // For each course, get its units and lessons (3-tier structure)
    const coursesWithProgress = await Promise.all(courses.map(async (course) => {
      // Get units for this course
      const units = await db.query(
        'SELECT * FROM units WHERE "courseId" = $1 ORDER BY "order" ASC',
        [course.id]
      );

      // Get lessons for each unit
      const unitsWithLessons = await Promise.all(units.map(async (unit) => {
        const lessons = await db.query(
          'SELECT * FROM lessons WHERE "unitId" = $1 ORDER BY "order" ASC',
          [unit.id]
        );

        // Get quizzes for each lesson
        const lessonsWithQuizzes = await Promise.all(lessons.map(async (lesson) => {
          const quizzes = await db.query(
            'SELECT * FROM quizzes WHERE "lessonId" = $1',
            [lesson.id]
          );
          return { ...lesson, quizzes };
        }));

        return { ...unit, lessons: lessonsWithQuizzes };
      }));

      // Add isCompleted flag to each lesson
      const unitsWithProgress = unitsWithLessons.map(unit => ({
        ...unit,
        lessons: unit.lessons.map(lesson => ({
          ...lesson,
          isCompleted: completedLessonIds.has(lesson.id)
        }))
      }));

      // Count total lessons
      const allLessons = unitsWithProgress.flatMap(unit => unit.lessons);
      const completedLessons = allLessons.filter(lesson => 
        completedLessonIds.has(lesson.id)
      ).length;

      return {
        ...course,
        units: unitsWithProgress,
        completedLessons,
        progress: allLessons.length > 0 ? (completedLessons / allLessons.length) * 100 : 0
      };
    }));

    res.json({ courses: coursesWithProgress });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to get courses' });
  }
});

// Get specific course
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    
    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }

    const course = await db.query('SELECT * FROM courses WHERE id = $1', [courseId]);

    if (!course || course.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Get units for this course
    const units = await db.query(
      'SELECT * FROM units WHERE "courseId" = $1 ORDER BY "order" ASC',
      [courseId]
    );

    // Get lessons for each unit with error handling
    const unitsWithLessons = await Promise.all(units.map(async (unit) => {
      try {
        const lessons = await db.query(
          'SELECT * FROM lessons WHERE "unitId" = $1 ORDER BY "order" ASC',
          [unit.id]
        );

        // Get quizzes for each lesson with error handling
        const lessonsWithQuizzes = await Promise.all(lessons.map(async (lesson) => {
          try {
            const quizzes = await db.query(
              'SELECT * FROM quizzes WHERE "lessonId" = $1',
              [lesson.id]
            );
            return { ...lesson, quizzes };
          } catch (quizError) {
            console.error(`Error fetching quizzes for lesson ${lesson.id}:`, quizError);
            return { ...lesson, quizzes: [] };
          }
        }));

        return { ...unit, lessons: lessonsWithQuizzes };
      } catch (unitError) {
        console.error(`Error fetching lessons for unit ${unit.id}:`, unitError);
        return { ...unit, lessons: [] };
      }
    }));

    // Get user's lesson completions
    const userCompletions = await db.query(
      'SELECT "lessonId" FROM lesson_completions WHERE "userId" = $1',
      [req.user.id]
    );

    const completedLessonIds = new Set(userCompletions.map(c => c.lessonId));

    // Add isCompleted flag to each lesson
    const unitsWithProgress = unitsWithLessons.map(unit => ({
      ...unit,
      lessons: unit.lessons.map(lesson => ({
        ...lesson,
        isCompleted: completedLessonIds.has(lesson.id)
      }))
    }));

    // Calculate progress
    const allLessons = unitsWithProgress.flatMap(unit => unit.lessons);
    const completedLessons = allLessons.filter(lesson => 
      completedLessonIds.has(lesson.id)
    ).length;

    res.json({
      course: {
        ...course[0],
        units: unitsWithProgress,
        completedLessons,
        progress: allLessons.length > 0 ? (completedLessons / allLessons.length) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Get course error:', error);
    console.error('Error stack:', error.stack);
    // Ensure response is sent even if there's an error
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to get course', details: error.message });
    }
  }
});

// Get specific lesson
router.get('/:courseId/lessons/:lessonId', authenticateToken, async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    const lesson = await db.query(
      'SELECT l.*, u."courseId" FROM lessons l JOIN units u ON l."unitId" = u.id WHERE l.id = $1 AND u."courseId" = $2',
      [lessonId, courseId]
    );

    if (!lesson || lesson.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Get quizzes for this lesson
    const quizzes = await db.query(
      'SELECT * FROM quizzes WHERE "lessonId" = $1',
      [lessonId]
    );

    // Check if user has completed this lesson
    const completion = await db.query(
      'SELECT * FROM lesson_completions WHERE "userId" = $1 AND "lessonId" = $2',
      [req.user.id, lessonId]
    );

    const isCompleted = completion && completion.length > 0;

    res.json({
      lesson: {
        ...lesson[0],
        quizzes,
        isCompleted
      }
    });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ error: 'Failed to get lesson' });
  }
});

// Complete a lesson
router.post('/:courseId/lessons/:lessonId/complete', authenticateToken, async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    // Check if lesson exists
    const lesson = await db.query(
      'SELECT l.*, u."courseId" FROM lessons l JOIN units u ON l."unitId" = u.id WHERE l.id = $1 AND u."courseId" = $2',
      [lessonId, courseId]
    );

    if (!lesson || lesson.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Check if already completed
    const existingCompletion = await db.query(
      'SELECT * FROM lesson_completions WHERE "userId" = $1 AND "lessonId" = $2',
      [req.user.id, lessonId]
    );

    if (existingCompletion && existingCompletion.length > 0) {
      return res.status(400).json({ error: 'Lesson already completed' });
    }

    // Create completion record
    await db.query(
      'INSERT INTO lesson_completions (id, "userId", "lessonId", "completedAt") VALUES ($1, $2, $3, $4)',
      [db.generateId(), req.user.id, lessonId, new Date().toISOString()]
    );

    // Update user progress (this would typically be handled by the progress service)
    // For now, we'll just return success

    res.json({
      message: 'Lesson completed successfully',
      lessonId,
      courseId
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({ error: 'Failed to complete lesson' });
  }
});

// Get course progress
router.get('/:id/progress', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;

    // Get all lessons in this course (3-tier structure)
    const lessons = await db.query(
      'SELECT l.* FROM lessons l JOIN units u ON l."unitId" = u.id WHERE u."courseId" = $1',
      [courseId]
    );

    // Get user's completions for this course
    const lessonIds = lessons.map(l => l.id);
    const completions = await db.query(
      `SELECT "lessonId" FROM lesson_completions WHERE "userId" = $1 AND "lessonId" IN (${lessonIds.map((_, i) => `$${i + 2}`).join(', ')})`,
      [req.user.id, ...lessonIds]
    );

    const completedLessonIds = new Set(completions.map(c => c.lessonId));
    const completedLessons = lessons.filter(lesson => 
      completedLessonIds.has(lesson.id)
    );

    res.json({
      courseId,
      totalLessons: lessons.length,
      completedLessons: completedLessons.length,
      progress: lessons.length > 0 ? (completedLessons.length / lessons.length) * 100 : 0,
      completedLessonIds: Array.from(completedLessonIds)
    });
  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({ error: 'Failed to get course progress' });
  }
});

module.exports = router;