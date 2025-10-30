const DatabaseService = require('./databaseService');

class LessonQuizGenerator {
  constructor() {
    this.db = new DatabaseService();
  }

  /**
   * Extract key concepts, facts, and important information from lesson content
   * @param {string} lessonContent - The markdown content of the lesson
   * @returns {Object} Extracted data including concepts, facts, examples, etc.
   */
  extractLessonData(lessonContent) {
    const lines = lessonContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const extractedData = {
      title: '',
      mainConcepts: [],
      keyFacts: [],
      examples: [],
      definitions: [],
      lists: [],
      importantNumbers: [],
      comparisons: [],
      steps: []
    };

    let currentSection = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Extract title (first heading)
      if (line.startsWith('# ') && !extractedData.title) {
        extractedData.title = line.substring(2).trim();
        continue;
      }
      
      // Extract main concepts (## headings)
      if (line.startsWith('## ')) {
        const concept = line.substring(3).trim();
        extractedData.mainConcepts.push(concept);
        currentSection = concept;
        continue;
      }
      
      // Extract definitions (bold text followed by colon or dash)
      if (line.includes('**') && (line.includes(':') || line.includes('-'))) {
        const definition = line.replace(/\*\*/g, '').trim();
        extractedData.definitions.push(definition);
        continue;
      }
      
      // Extract lists
      if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\./.test(line)) {
        extractedData.lists.push(line);
        continue;
      }
      
      // Extract important numbers (percentages, dollar amounts, etc.)
      if (/\d+%|\$\d+|\d+\.\d+%/.test(line)) {
        extractedData.importantNumbers.push(line);
        continue;
      }
      
      // Extract examples (lines that start with "For example" or contain "such as")
      if (line.toLowerCase().includes('for example') || line.toLowerCase().includes('such as')) {
        extractedData.examples.push(line);
        continue;
      }
      
      // Extract comparisons (lines with "vs", "compared to", "unlike", etc.)
      if (/\b(vs|versus|compared to|unlike|different from)\b/i.test(line)) {
        extractedData.comparisons.push(line);
        continue;
      }
      
      // Extract steps (numbered lists or "Step" patterns)
      if (/^Step \d+:|^\d+\.\s*[A-Z]/.test(line)) {
        extractedData.steps.push(line);
        continue;
      }
      
      // Extract key facts (lines with important information)
      if (line.length > 20 && line.length < 200 && 
          !line.startsWith('#') && 
          !line.startsWith('-') && 
          !line.startsWith('*') &&
          !/^\d+\./.test(line)) {
        extractedData.keyFacts.push(line);
      }
    }
    
    return extractedData;
  }

  /**
   * Generate quiz questions based on extracted lesson data
   * @param {Object} lessonData - Extracted lesson data
   * @returns {Array} Array of quiz questions
   */
  generateQuestions(lessonData) {
    const questions = [];
    
    // Question 1: Main concept identification
    if (lessonData.mainConcepts.length > 0) {
      const concept = lessonData.mainConcepts[0];
      questions.push({
        type: 'multiple-choice',
        question: `What is the main topic discussed in this lesson?`,
        options: [
          concept,
          ...this.generateDistractors(lessonData.mainConcepts.slice(1), concept)
        ],
        correctAnswer: concept,
        explanation: `The main topic is "${concept}" as indicated by the lesson structure.`
      });
    }
    
    // Question 2: Definition-based question
    if (lessonData.definitions.length > 0) {
      const definition = lessonData.definitions[0];
      const term = definition.split(':')[0] || definition.split('-')[0];
      questions.push({
        type: 'multiple-choice',
        question: `What does "${term.trim()}" mean?`,
        options: [
          definition,
          'A financial instrument',
          'A type of investment',
          'A market strategy'
        ],
        correctAnswer: definition,
        explanation: `"${term.trim()}" is defined as: ${definition}`
      });
    }
    
    // Question 3: Number-based question
    if (lessonData.importantNumbers.length > 0) {
      const numberFact = lessonData.importantNumbers[0];
      questions.push({
        type: 'multiple-choice',
        question: `According to the lesson, which of the following is mentioned?`,
        options: [
          numberFact,
          'A different percentage',
          'An unrelated statistic',
          'No specific numbers'
        ],
        correctAnswer: numberFact,
        explanation: `The lesson specifically mentions: ${numberFact}`
      });
    }
    
    // Question 4: Example-based question
    if (lessonData.examples.length > 0) {
      const example = lessonData.examples[0];
      questions.push({
        type: 'multiple-choice',
        question: `Which of the following is an example mentioned in the lesson?`,
        options: [
          example,
          'A generic example',
          'An unrelated case',
          'No examples provided'
        ],
        correctAnswer: example,
        explanation: `The lesson provides this example: ${example}`
      });
    }
    
    // Question 5: True/False question based on key facts
    if (lessonData.keyFacts.length > 0) {
      const fact = lessonData.keyFacts[0];
      const isTrue = Math.random() > 0.5;
      questions.push({
        type: 'true-false',
        question: isTrue ? fact : this.generateFalseStatement(fact),
        correctAnswer: isTrue,
        explanation: isTrue ? `This is correct: ${fact}` : `This is incorrect. The correct statement is: ${fact}`
      });
    }
    
    return questions.slice(0, 5); // Limit to 5 questions
  }

  /**
   * Generate distractors for multiple choice questions
   */
  generateDistractors(concepts, correctAnswer) {
    const distractors = [
      'Investment strategies',
      'Market analysis',
      'Financial planning',
      'Risk management',
      'Portfolio diversification'
    ];
    
    return distractors.slice(0, 3);
  }

  /**
   * Generate a false statement for true/false questions
   */
  generateFalseStatement(fact) {
    const falseStatements = [
      'This concept is not important in finance',
      'This only applies to large corporations',
      'This is outdated information',
      'This contradicts modern financial theory'
    ];
    
    return falseStatements[Math.floor(Math.random() * falseStatements.length)];
  }

  /**
   * Generate a complete quiz for a lesson
   * @param {number} lessonId - The ID of the lesson
   * @returns {Object} Complete quiz object
   */
  async generateLessonQuiz(lessonId) {
    try {
      // Get lesson content from database
      const lesson = await this.db.query(
        'SELECT l.*, u.title as "unitTitle", c.title as "courseTitle" FROM lessons l JOIN units u ON l."unitId" = u.id JOIN courses c ON u."courseId" = c.id WHERE l.id = $1',
        [lessonId]
      );

      if (!lesson || lesson.length === 0) {
        throw new Error('Lesson not found');
      }

      const lessonData = lesson[0];
      
      // Extract lesson data
      const extractedData = this.extractLessonData(lessonData.content || '');
      
      // Generate questions
      const questions = this.generateQuestions(extractedData);
      
      // Create quiz object
      const quiz = {
        id: `quiz-${lessonId}`,
        title: `Quiz: ${lessonData.title}`,
        description: `Test your knowledge of ${lessonData.title}`,
        lessonId: lessonId,
        courseTitle: lessonData.courseTitle,
        unitTitle: lessonData.unitTitle,
        questions: questions,
        timeLimit: 10, // 10 minutes
        passingScore: 70,
        createdAt: new Date().toISOString()
      };

      return quiz;

    } catch (error) {
      console.error('Error generating lesson quiz:', error);
      throw error;
    }
  }
}

module.exports = LessonQuizGenerator;