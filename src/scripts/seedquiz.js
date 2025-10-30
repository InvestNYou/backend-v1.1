const { PrismaClient } = require('@prisma/client');
const ManualQuizContentGenerator = require('./manualQuizContent');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting manual quiz data seeding...');
  
  try {
    // Get all lessons from the database
    const lessons = await prisma.lesson.findMany({
      include: {
        unit: {
          include: {
            course: true
          }
        }
      },
      orderBy: [
        { unit: { course: { order: 'asc' } } },
        { unit: { order: 'asc' } },
        { order: 'asc' }
      ]
    });

    console.log(`📚 Found ${lessons.length} lessons to process`);

    let quizzesCreated = 0;
    let quizzesUpdated = 0;
    let errors = 0;

    for (const lesson of lessons) {
      try {
        console.log(`\n🔄 Processing lesson: "${lesson.title}" (ID: ${lesson.id})`);
        
        // Check if quiz already exists for this lesson
        const existingQuiz = await prisma.quiz.findFirst({
          where: { lessonId: lesson.id }
        });

        // Generate quiz questions based on lesson content
        const generatedQuiz = ManualQuizContentGenerator.generateQuizData(lesson.id, lesson.title);
        
        if (!generatedQuiz) {
          console.log(`⚠️ No manual quiz content available for lesson: "${lesson.title}"`);
          continue;
        }
        
        // Use the generated quiz data directly
        const quizData = generatedQuiz;

        if (existingQuiz) {
          // Update existing quiz
          await prisma.quiz.update({
            where: { id: existingQuiz.id },
            data: quizData
          });
          quizzesUpdated++;
          console.log(`✅ Updated quiz for lesson: "${lesson.title}"`);
        } else {
          // Create new quiz
          await prisma.quiz.create({
            data: quizData
          });
          quizzesCreated++;
          console.log(`✅ Created quiz for lesson: "${lesson.title}"`);
        }

        // Log quiz details
        console.log(`   📊 Quiz details:`);
        console.log(`   - Questions: ${quizData.questions.length}`);
        console.log(`   - XP Value: ${quizData.xpValue}`);
        console.log(`   - Passing Score: ${quizData.passingScore}%`);
        console.log(`   - Question Types: ${quizData.questions.map(q => q.type).join(', ')}`);

      } catch (error) {
        console.error(`❌ Error processing lesson "${lesson.title}" (ID: ${lesson.id}):`, error.message);
        errors++;
      }
    }

    console.log(`\n🎉 Manual quiz seeding completed!`);
    console.log(`📊 Summary:`);
    console.log(`- Lessons processed: ${lessons.length}`);
    console.log(`- Quizzes created: ${quizzesCreated}`);
    console.log(`- Quizzes updated: ${quizzesUpdated}`);
    console.log(`- Errors: ${errors}`);

    // Show available manual quiz content
    const availableLessons = ManualQuizContentGenerator.getAvailableLessonTitles();
    console.log(`\n📚 Available manual quiz content for ${availableLessons.length} lessons:`);
    availableLessons.forEach((title, index) => {
      console.log(`   ${index + 1}. ${title}`);
    });

    // Verify results
    const totalQuizzes = await prisma.quiz.count();
    console.log(`\n📈 Total quizzes in database: ${totalQuizzes}`);

    // Show some sample quizzes
    console.log(`\n🔍 Sample quizzes created:`);
    const sampleQuizzes = await prisma.quiz.findMany({
      take: 5,
      include: {
        lesson: {
          include: {
            unit: {
              include: {
                course: true
              }
            }
          }
        }
      },
      orderBy: { id: 'asc' }
    });

    for (const quiz of sampleQuizzes) {
      console.log(`\n📝 Quiz: "${quiz.title}"`);
      console.log(`   Course: ${quiz.lesson.unit?.course?.title || 'N/A'}`);
      console.log(`   Lesson: ${quiz.lesson.title}`);
      console.log(`   Questions: ${Array.isArray(quiz.questions) ? quiz.questions.length : 'N/A'}`);
      console.log(`   XP Value: ${quiz.xpValue}`);
    }

  } catch (error) {
    console.error('❌ Error during quiz seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
