const GPTService = require('./gptService');

// Load environment variables
require('dotenv').config();

class QuizGradingService {
  constructor() {
    try {
      this.gptService = new GPTService();
    } catch (error) {
      console.warn('GPT Service initialization failed:', error.message);
      this.gptService = null;
    }
  }

  /**
   * Grade a quiz with mixed question types using AI
   * @param {Array} questions - Array of question objects
   * @param {Object} answers - User's answers object
   * @returns {Promise<Object>} Grading results
   */
  async gradeQuiz(questions, answers) {
    console.log('🤖 Starting Quiz Grading...');
    console.log(`Questions: ${questions.length}, Answers: ${Object.keys(answers).length}`);
    console.log('Answers received:', answers);
    
    // Check if AI service is available
    const aiAvailable = await this.validateService();
    console.log(`AI Service Available: ${aiAvailable}`);
    
    const results = [];
    let totalScorePoints = 0;
    let totalQuestions = questions.length;

    for (const question of questions) {
      const userAnswer = answers[question.id];
      console.log(`\n📝 Grading Question ${question.id}: ${question.type || 'undefined'}`);
      console.log(`   Question: "${question.question}"`);
      console.log(`   User Answer: "${userAnswer}"`);
      console.log(`   Correct Answer: "${question.correctAnswer}"`);
      
      // Default to multiple_choice if type is undefined
      const questionType = question.type || 'multiple_choice';
      console.log(`   Using question type: ${questionType}`);
      
      let result;
      
      if (questionType === 'multiple_choice') {
        result = this.gradeMultipleChoice(question, userAnswer);
      } else if (questionType === 'true_false') {
        result = this.gradeTrueFalse(question, userAnswer);
      } else if (questionType === 'free_response') {
        if (aiAvailable) {
          result = await this.gradeFreeResponse(question, userAnswer);
        } else {
          console.log(`   AI unavailable, using fallback grading for free response`);
          result = this.createFallbackResult(question, userAnswer);
        }
      } else if (questionType === 'short_answer') {
        if (aiAvailable) {
          result = await this.gradeShortAnswer(question, userAnswer);
        } else {
          console.log(`   AI unavailable, using fallback grading for short answer`);
          result = this.createShortAnswerFallbackResult(question, userAnswer);
        }
      } else {
        console.warn(`Unsupported question type: ${questionType}`);
        result = {
          questionId: question.id,
          score: 0,
          isCorrect: false,
          feedback: 'Unsupported question type',
          explanation: question.explanation || 'This question type is not supported.'
        };
      }
      
      results.push(result);
      totalScorePoints += result.score;
      
      console.log(`   Final Score: ${result.score}% (${result.isCorrect ? 'Correct' : 'Incorrect'})`);
    }

    const totalScore = Math.round(totalScorePoints / totalQuestions);
    const passed = totalScore >= 70; // Default passing score
    const correctAnswers = results.filter(r => r.isCorrect).length;

    console.log(`\n📊 Final Results: ${correctAnswers}/${totalQuestions} correct (${totalScore}%)`);
    console.log(`Status: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`AI Service Used: ${aiAvailable ? '✅ YES' : '❌ NO (Fallback Mode)'}`);

    return {
      totalScore,
      correctAnswers,
      totalQuestions,
      passed,
      results,
      aiUsed: aiAvailable
    };
  }

  /**
   * Grade multiple choice questions
   * @param {Object} question - Question object
   * @param {*} userAnswer - User's answer
   * @returns {Object} Grading result
   */
  gradeMultipleChoice(question, userAnswer) {
    const isCorrect = userAnswer === question.correctAnswer;
    const score = isCorrect ? 100 : 0;
    
    return {
      questionId: question.id,
      score,
      isCorrect,
      feedback: isCorrect ? 'Correct!' : `Incorrect. The correct answer is option ${question.correctAnswer + 1}.`,
      explanation: question.explanation
    };
  }

  /**
   * Grade true/false questions
   * @param {Object} question - Question object
   * @param {*} userAnswer - User's answer
   * @returns {Object} Grading result
   */
  gradeTrueFalse(question, userAnswer) {
    // Convert user answer to boolean if it's a string
    let userBoolean;
    if (typeof userAnswer === 'string') {
      userBoolean = userAnswer.toLowerCase() === 'true';
    } else {
      userBoolean = Boolean(userAnswer);
    }
    
    const isCorrect = userBoolean === question.correctAnswer;
    const score = isCorrect ? 100 : 0;
    
    return {
      questionId: question.id,
      score,
      isCorrect,
      feedback: isCorrect ? 'Correct!' : `Incorrect. The correct answer is ${question.correctAnswer ? 'True' : 'False'}.`,
      explanation: question.explanation
    };
  }

  /**
   * Grade short answer questions using AI with stricter criteria
   * @param {Object} question - Question object
   * @param {string} userAnswer - User's answer
   * @returns {Promise<Object>} Grading result
   */
  async gradeShortAnswer(question, userAnswer) {
    if (!userAnswer || userAnswer.trim() === '') {
      return {
        questionId: question.id,
        score: 0,
        isCorrect: false,
        feedback: 'No answer provided.',
        explanation: question.explanation
      };
    }

    try {
      if (!this.gptService) {
        console.log(`   GPT Service not available, using fallback grading for short answer`);
        return this.createShortAnswerFallbackResult(question, userAnswer);
      }

      const gradingPrompt = this.createShortAnswerGradingPrompt(question, userAnswer);
      console.log(`   AI Short Answer Grading prompt created for question ${question.id}`);
      console.log(`   User answer: "${userAnswer}"`);
      
      const aiResponse = await this.gptService.generateResponse(gradingPrompt);
      
      if (!aiResponse.success) {
        console.error(`AI grading failed for short answer question ${question.id}:`, aiResponse.error);
        console.log(`   Falling back to keyword-based grading`);
        return this.createShortAnswerFallbackResult(question, userAnswer);
      }

      console.log(`   AI Response: "${aiResponse.response}"`);
      const gradingResult = this.parseAIResponse(aiResponse.response, question);
      console.log(`   AI short answer grading completed for question ${question.id}: ${gradingResult.score}% (isCorrect: ${gradingResult.isCorrect})`);
      
      return gradingResult;
      
    } catch (error) {
      console.error(`Error grading short answer question ${question.id}:`, error);
      console.log(`   Falling back to keyword-based grading`);
      return this.createShortAnswerFallbackResult(question, userAnswer);
    }
  }

  /**
   * Create AI grading prompt for short answer questions
   * @param {Object} question - Question object
   * @param {string} userAnswer - User's answer
   * @returns {string} Grading prompt
   */
  createShortAnswerGradingPrompt(question, userAnswer) {
    return `You are an expert financial education instructor grading a student's short answer response. Please evaluate the student's response with stricter criteria than free response questions, as short answers should be more concise and precise.

QUESTION: "${question.question}"

REFERENCE ANSWER: "${question.correctAnswer}"

STUDENT'S ANSWER: "${userAnswer}"

Please provide your assessment in the following JSON format:
{
  "score": [0-100],
  "isCorrect": [true/false],
  "feedback": "[Brief feedback on what the student got right or wrong]",
  "explanation": "[Detailed explanation of the concept]"
}

Short Answer Grading criteria (stricter than free response):
- 90-100%: Excellent, precise answer covering all key points concisely
- 80-89%: Very good answer with minor omissions or slight imprecision
- 70-79%: Good answer but missing some important details
- 60-69%: Partial understanding with some correct elements
- 0-59%: Poor understanding or mostly incorrect

For short answers, prioritize:
1. Accuracy of key terms and concepts
2. Completeness of essential information
3. Conciseness and clarity
4. Correct use of financial terminology

Be encouraging but accurate in your assessment. Focus on educational value.`;
  }

  /**
   * Create fallback result for short answer questions when AI grading fails
   * @param {Object} question - Question object
   * @param {string} userAnswer - User's answer
   * @returns {Object} Fallback grading result
   */
  createShortAnswerFallbackResult(question, userAnswer) {
    if (!userAnswer || userAnswer.trim() === '') {
      return {
        questionId: question.id,
        score: 0,
        isCorrect: false,
        feedback: 'No answer provided.',
        explanation: question.explanation
      };
    }

    // Enhanced keyword-based fallback grading for short answers
    const userText = userAnswer.toLowerCase().trim();
    const correctText = question.correctAnswer.toLowerCase();
    
    // Check for key concepts in the answer
    const keyConcepts = this.extractKeyConcepts(correctText);
    const foundConcepts = keyConcepts.filter(concept => 
      userText.includes(concept.toLowerCase())
    );
    
    // Short answers need higher percentage of key concepts
    let score = Math.round((foundConcepts.length / keyConcepts.length) * 100);
    
    // Bonus for concise but complete answers
    if (userText.length > 20 && userText.length < 100) {
      score = Math.min(100, score + 5);
    }
    
    // Penalty for very short answers
    if (userText.length < 5) {
      score = Math.max(0, score - 30);
    }
    
    const isCorrect = score >= 70;
    
    return {
      questionId: question.id,
      score: Math.max(0, Math.min(100, score)),
      isCorrect,
      feedback: isCorrect 
        ? 'Good understanding of the key concepts! (Graded using fallback method)' 
        : 'Consider reviewing the lesson content for better understanding. (Graded using fallback method)',
      explanation: question.explanation
    };
  }

  /**
   * Grade free response questions using AI
   * @param {Object} question - Question object
   * @param {string} userAnswer - User's answer
   * @returns {Promise<Object>} Grading result
   */
  async gradeFreeResponse(question, userAnswer) {
    if (!userAnswer || userAnswer.trim() === '') {
      return {
        questionId: question.id,
        score: 0,
        isCorrect: false,
        feedback: 'No answer provided.',
        explanation: question.explanation
      };
    }

    try {
      if (!this.gptService) {
        console.log(`   GPT Service not available, using fallback grading for free response`);
        return this.createFallbackResult(question, userAnswer);
      }

      const gradingPrompt = this.createGradingPrompt(question, userAnswer);
      console.log(`   AI Grading prompt created for question ${question.id}`);
      console.log(`   User answer: "${userAnswer}"`);
      
      const aiResponse = await this.gptService.generateResponse(gradingPrompt);
      
      if (!aiResponse.success) {
        console.error(`AI grading failed for question ${question.id}:`, aiResponse.error);
        console.log(`   Falling back to keyword-based grading`);
        return this.createFallbackResult(question, userAnswer);
      }

      console.log(`   AI Response: "${aiResponse.response}"`);
      const gradingResult = this.parseAIResponse(aiResponse.response, question);
      console.log(`   AI grading completed for question ${question.id}: ${gradingResult.score}% (isCorrect: ${gradingResult.isCorrect})`);
      
      return gradingResult;
      
    } catch (error) {
      console.error(`Error grading free response question ${question.id}:`, error);
      console.log(`   Falling back to keyword-based grading`);
      return this.createFallbackResult(question, userAnswer);
    }
  }

  /**
   * Create AI grading prompt for free response questions
   * @param {Object} question - Question object
   * @param {string} userAnswer - User's answer
   * @returns {string} Grading prompt
   */
  createGradingPrompt(question, userAnswer) {
    return `You are an expert financial education instructor grading a student's free-response answer. Please evaluate the student's response and provide a detailed assessment.

QUESTION: "${question.question}"

REFERENCE ANSWER: "${question.correctAnswer}"

STUDENT'S ANSWER: "${userAnswer}"

Please provide your assessment in the following JSON format:
{
  "score": [0-100],
  "isCorrect": [true/false],
  "feedback": "[Brief feedback on what the student got right or wrong]",
  "explanation": "[Detailed explanation of the concept]"
}

Grading criteria:
- 90-100%: Excellent understanding, covers key concepts accurately
- 70-89%: Good understanding with minor gaps or inaccuracies
- 50-69%: Partial understanding with some correct elements
- 0-49%: Poor understanding or mostly incorrect

Be encouraging but accurate in your assessment. Focus on educational value.`;
  }

  /**
   * Parse AI response and extract grading information
   * @param {string} aiResponse - AI's response
   * @param {Object} question - Original question
   * @returns {Object} Parsed grading result
   */
  parseAIResponse(aiResponse, question) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const score = Math.max(0, Math.min(100, parseInt(parsed.score) || 0));
        const isCorrect = score >= 70; // Consider 70%+ as correct
        
        return {
          questionId: question.id,
          score,
          isCorrect,
          feedback: parsed.feedback || 'AI feedback unavailable',
          explanation: parsed.explanation || question.explanation
        };
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
    }

    // Fallback if JSON parsing fails
    return this.createFallbackResult(question, 'AI response parsing failed');
  }

  /**
   * Create fallback result when AI grading fails
   * @param {Object} question - Question object
   * @param {string} userAnswer - User's answer
   * @returns {Object} Fallback grading result
   */
  createFallbackResult(question, userAnswer) {
    if (!userAnswer || userAnswer.trim() === '') {
      return {
        questionId: question.id,
        score: 0,
        isCorrect: false,
        feedback: 'No answer provided.',
        explanation: question.explanation
      };
    }

    // Enhanced keyword-based fallback grading
    const userText = userAnswer.toLowerCase().trim();
    const correctText = question.correctAnswer.toLowerCase();
    
    // Check for key concepts in the answer
    const keyConcepts = this.extractKeyConcepts(correctText);
    const foundConcepts = keyConcepts.filter(concept => 
      userText.includes(concept.toLowerCase())
    );
    
    // Additional scoring based on answer length and completeness
    let score = Math.round((foundConcepts.length / keyConcepts.length) * 100);
    
    // Bonus for longer, more thoughtful answers
    if (userText.length > 50) {
      score = Math.min(100, score + 10);
    }
    
    // Penalty for very short answers
    if (userText.length < 10) {
      score = Math.max(0, score - 20);
    }
    
    const isCorrect = score >= 70;
    
    return {
      questionId: question.id,
      score: Math.max(0, Math.min(100, score)),
      isCorrect,
      feedback: isCorrect 
        ? 'Good understanding of the key concepts! (Graded using fallback method)' 
        : 'Consider reviewing the lesson content for better understanding. (Graded using fallback method)',
      explanation: question.explanation
    };
  }

  /**
   * Extract key concepts from text for fallback grading
   * @param {string} text - Text to analyze
   * @returns {Array} Array of key concepts
   */
  extractKeyConcepts(text) {
    // Simple keyword extraction - could be enhanced
    const words = text.split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['this', 'that', 'with', 'from', 'they', 'have', 'will', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other', 'after', 'first', 'well', 'also', 'where', 'much', 'some', 'very', 'when', 'here', 'just', 'into', 'over', 'think', 'back', 'then', 'them', 'these', 'your', 'work', 'first', 'way', 'may', 'say', 'use', 'her', 'many', 'than', 'call', 'who', 'its', 'now', 'find', 'long', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part'].includes(word.toLowerCase()));
    
    return words.slice(0, 5); // Take first 5 meaningful words
  }

  /**
   * Validate service availability
   * @returns {Promise<boolean>} True if service is available
   */
  async validateService() {
    try {
      if (!this.gptService) {
        console.log('GPT Service not available - using fallback grading');
        return false;
      }
      return await this.gptService.validateService();
    } catch (error) {
      console.error('Quiz Grading Service validation failed:', error);
      return false;
    }
  }

  /**
   * Test grading with sample data
   * @returns {Promise<Object>} Test results
   */
  async testGrading() {
    console.log('🧪 Testing Quiz Grading Service...');
    
    const testQuestions = [
      {
        id: 1,
        question: "What is compound interest?",
        type: "free_response",
        correctAnswer: "Interest earned on both principal and previously earned interest",
        explanation: "Compound interest allows money to grow exponentially over time."
      },
      {
        id: 2,
        question: "What is the Rule of 72?",
        type: "short_answer",
        correctAnswer: "A rule that estimates how long it takes to double your money by dividing 72 by the annual interest rate",
        explanation: "The Rule of 72 is a simple formula for estimating investment doubling time."
      },
      {
        id: 3,
        question: "You need to be wealthy to start investing.",
        type: "true_false",
        correctAnswer: false,
        explanation: "Anyone can start investing with small amounts. The key is to start early and be consistent."
      }
    ];

    const testAnswers = {
      1: "Compound interest is when you earn interest on both your original money and the interest you've already earned. This makes your money grow faster over time.",
      2: "The Rule of 72 helps you figure out how long it takes to double your money by dividing 72 by your interest rate.",
      3: false
    };

    try {
      const results = await this.gradeQuiz(testQuestions, testAnswers);
      console.log('✅ Test completed successfully');
      console.log(`Test Results: ${results.totalScore}% (${results.correctAnswers}/${results.totalQuestions})`);
      return results;
    } catch (error) {
      console.error('❌ Test failed:', error);
      return { error: error.message };
    }
  }
}

module.exports = QuizGradingService;





