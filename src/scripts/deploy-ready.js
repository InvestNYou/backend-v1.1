const { PrismaClient } = require('@prisma/client');
const ManualQuizContentGenerator = require('./manualQuizContent');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting deployment-ready database verification and quiz seeding...');
  
  try {
    // Step 1: Verify current database state
    console.log('\n📊 Step 1: Verifying current database state...');
    
    const courses = await prisma.course.count();
    const units = await prisma.unit.count();
    const lessons = await prisma.lesson.count();
    const quizzes = await prisma.quiz.count();
    const dailyFacts = await prisma.dailyFact.count();
    
    console.log(`📊 Current Database State:`);
    console.log(`   - Courses: ${courses}`);
    console.log(`   - Units: ${units}`);
    console.log(`   - Lessons: ${lessons}`);
    console.log(`   - Quizzes: ${quizzes}`);
    console.log(`   - Daily Facts: ${dailyFacts}`);
    
    // Step 2: Seed quizzes with manual content
    console.log('\n📝 Step 2: Ensuring all lessons have quiz content...');
    
    const allLessons = await prisma.lesson.findMany({
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

    console.log(`📚 Found ${allLessons.length} lessons to process`);

    let quizzesCreated = 0;
    let quizzesUpdated = 0;
    let errors = 0;

    for (const lesson of allLessons) {
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

    // Step 3: Final verification
    console.log(`\n🎉 Quiz seeding completed!`);
    console.log(`📊 Summary:`);
    console.log(`- Lessons processed: ${allLessons.length}`);
    console.log(`- Quizzes created: ${quizzesCreated}`);
    console.log(`- Quizzes updated: ${quizzesUpdated}`);
    console.log(`- Errors: ${errors}`);

    // Show available manual quiz content
    const availableLessons = ManualQuizContentGenerator.getAvailableLessonTitles();
    console.log(`\n📚 Available manual quiz content for ${availableLessons.length} lessons:`);
    availableLessons.forEach((title, index) => {
      console.log(`   ${index + 1}. ${title}`);
    });

    // Final verification
    const finalQuizzes = await prisma.quiz.count();
    console.log(`\n📈 Total quizzes in database: ${finalQuizzes}`);

    // Check quiz coverage
    const lessonsWithQuizzes = await prisma.lesson.findMany({
      where: {
        quizzes: {
          some: {}
        }
      }
    });
    
    const lessonsWithoutQuizzes = await prisma.lesson.findMany({
      where: {
        quizzes: {
          none: {}
        }
      }
    });
    
    console.log(`\n📝 Final Quiz Coverage:`);
    console.log(`   - Lessons with quizzes: ${lessonsWithQuizzes.length}`);
    console.log(`   - Lessons without quizzes: ${lessonsWithoutQuizzes.length}`);
    console.log(`   - Coverage: ${Math.round((lessonsWithQuizzes.length / allLessons.length) * 100)}%`);
    
    if (lessonsWithoutQuizzes.length > 0) {
      console.log(`\n⚠️ Lessons without quizzes:`);
      lessonsWithoutQuizzes.forEach(lesson => {
        console.log(`   - ${lesson.title} (ID: ${lesson.id})`);
      });
    }

    // Step 4: Show sample data for verification
    console.log(`\n🔍 Sample Data Verification:`);
    
    const sampleCourses = await prisma.course.findMany({
      take: 3,
      include: {
        units: {
          include: {
            lessons: {
              include: {
                quizzes: true
              }
            }
          }
        }
      }
    });
    
    for (const course of sampleCourses) {
      console.log(`\n📖 Course: ${course.title}`);
      console.log(`   Units: ${course.units.length}`);
      let totalLessons = 0;
      let totalQuizzes = 0;
      
      for (const unit of course.units) {
        totalLessons += unit.lessons.length;
        for (const lesson of unit.lessons) {
          totalQuizzes += lesson.quizzes.length;
        }
      }
      
      console.log(`   Lessons: ${totalLessons}`);
      console.log(`   Quizzes: ${totalQuizzes}`);
    }
    
    // Final deployment readiness check
    if (courses > 0 && lessons > 0 && finalQuizzes > 0) {
      console.log(`\n🎉 DEPLOYMENT READY! ✅`);
      console.log(`✅ Database is properly seeded and ready for DigitalOcean deployment.`);
      console.log(`✅ All essential data structures are in place.`);
      console.log(`✅ Quiz content is available for ${lessonsWithQuizzes.length}/${allLessons.length} lessons.`);
      
      if (lessonsWithoutQuizzes.length === 0) {
        console.log(`✅ Perfect! All lessons have quiz content!`);
      } else {
        console.log(`⚠️ Note: ${lessonsWithoutQuizzes.length} lessons still need quiz content, but the system is functional.`);
      }
    } else {
      console.log(`\n❌ Deployment not ready. Please check the logs above.`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error during deployment verification:', error);
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
