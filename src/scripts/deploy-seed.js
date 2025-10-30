const { PrismaClient } = require('@prisma/client');
const ManualQuizContentGenerator = require('./manualQuizContent');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting comprehensive database seeding for deployment...');
  
  try {
    // Step 1: Seed all courses, units, and lessons
    console.log('\n📚 Step 1: Seeding courses, units, and lessons...');
    const { execSync } = require('child_process');
    execSync('node src/scripts/seed-with-units.js', { stdio: 'inherit' });
    
    // Step 2: Seed all quizzes with manual content
    console.log('\n📝 Step 2: Seeding quizzes with manual AI-generated content...');
    execSync('node src/scripts/seedquiz.js', { stdio: 'inherit' });
    
    // Step 3: Verify all data is properly seeded
    console.log('\n✅ Step 3: Verifying seeded data...');
    
    const courses = await prisma.course.count();
    const units = await prisma.unit.count();
    const lessons = await prisma.lesson.count();
    const quizzes = await prisma.quiz.count();
    const dailyFacts = await prisma.dailyFact.count();
    
    console.log(`📊 Database Summary:`);
    console.log(`   - Courses: ${courses}`);
    console.log(`   - Units: ${units}`);
    console.log(`   - Lessons: ${lessons}`);
    console.log(`   - Quizzes: ${quizzes}`);
    console.log(`   - Daily Facts: ${dailyFacts}`);
    
    // Step 4: Check quiz coverage
    const lessonsWithQuizzes = await prisma.lesson.findMany({
      where: {
        quizzes: {
          some: {}
        }
      },
      include: {
        quizzes: true
      }
    });
    
    const lessonsWithoutQuizzes = await prisma.lesson.findMany({
      where: {
        quizzes: {
          none: {}
        }
      }
    });
    
    console.log(`\n📝 Quiz Coverage:`);
    console.log(`   - Lessons with quizzes: ${lessonsWithQuizzes.length}`);
    console.log(`   - Lessons without quizzes: ${lessonsWithoutQuizzes.length}`);
    
    if (lessonsWithoutQuizzes.length > 0) {
      console.log(`\n⚠️ Lessons without quizzes:`);
      lessonsWithoutQuizzes.forEach(lesson => {
        console.log(`   - ${lesson.title} (ID: ${lesson.id})`);
      });
    }
    
    // Step 5: Show sample data
    console.log(`\n🔍 Sample Data:`);
    
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
    
    // Step 6: Check manual quiz content availability
    const availableManualQuizzes = ManualQuizContentGenerator.getAvailableLessonTitles();
    console.log(`\n🤖 Manual AI-Generated Quiz Content:`);
    console.log(`   - Available for ${availableManualQuizzes.length} lessons`);
    console.log(`   - Coverage: ${Math.round((availableManualQuizzes.length / lessons) * 100)}%`);
    
    // Step 7: Final verification
    if (courses > 0 && units > 0 && lessons > 0 && quizzes > 0) {
      console.log(`\n🎉 Deployment seeding completed successfully!`);
      console.log(`✅ All essential data is seeded and ready for DigitalOcean deployment.`);
      
      if (lessonsWithoutQuizzes.length === 0) {
        console.log(`✅ All lessons have quiz content!`);
      } else {
        console.log(`⚠️ ${lessonsWithoutQuizzes.length} lessons still need quiz content.`);
      }
    } else {
      console.log(`\n❌ Seeding incomplete. Please check the logs above.`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error during deployment seeding:', error);
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
