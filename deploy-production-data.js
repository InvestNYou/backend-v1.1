const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌊 Starting production database deployment...');
  
  try {
    // Step 1: Check current database state
    console.log('\n📊 Step 1: Checking current production database state...');
    
    const courses = await prisma.course.count();
    const units = await prisma.unit.count();
    const lessons = await prisma.lesson.count();
    const quizzes = await prisma.quiz.count();
    const dailyFacts = await prisma.dailyFact.count();
    
    console.log(`📊 Current Production Database State:`);
    console.log(`   - Courses: ${courses}`);
    console.log(`   - Units: ${units}`);
    console.log(`   - Lessons: ${lessons}`);
    console.log(`   - Quizzes: ${quizzes}`);
    console.log(`   - Daily Facts: ${dailyFacts}`);
    
    // Step 2: Run comprehensive seeding
    console.log('\n📚 Step 2: Running comprehensive database seeding...');
    
    // Import and run the seed script
    const { execSync } = require('child_process');
    
    try {
      console.log('🔄 Seeding courses, units, and lessons...');
      execSync('node src/scripts/seed-with-units.js', { stdio: 'inherit' });
      
      console.log('🔄 Seeding quizzes...');
      execSync('node src/scripts/seedquiz.js', { stdio: 'inherit' });
      
      console.log('✅ Seeding completed successfully!');
    } catch (error) {
      console.error('❌ Seeding failed:', error.message);
      throw error;
    }
    
    // Step 3: Final verification
    console.log('\n✅ Step 3: Final verification...');
    
    const finalCourses = await prisma.course.count();
    const finalUnits = await prisma.unit.count();
    const finalLessons = await prisma.lesson.count();
    const finalQuizzes = await prisma.quiz.count();
    const finalDailyFacts = await prisma.dailyFact.count();
    
    console.log(`📊 Final Production Database State:`);
    console.log(`   - Courses: ${finalCourses}`);
    console.log(`   - Units: ${finalUnits}`);
    console.log(`   - Lessons: ${finalLessons}`);
    console.log(`   - Quizzes: ${finalQuizzes}`);
    console.log(`   - Daily Facts: ${finalDailyFacts}`);
    
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
    
    console.log(`\n📝 Quiz Coverage:`);
    console.log(`   - Lessons with quizzes: ${lessonsWithQuizzes.length}`);
    console.log(`   - Lessons without quizzes: ${lessonsWithoutQuizzes.length}`);
    console.log(`   - Coverage: ${lessonsWithQuizzes.length > 0 ? (lessonsWithQuizzes.length / (lessonsWithQuizzes.length + lessonsWithoutQuizzes.length)) * 100 : 0}%`);
    
    if (lessonsWithoutQuizzes.length === 0) {
      console.log('\n🎉 PRODUCTION DEPLOYMENT SUCCESSFUL! ✅');
      console.log('✅ All courses, units, lessons, and quizzes are properly seeded');
      console.log('✅ Database is ready for production use');
    } else {
      console.log('\n⚠️ Some lessons are missing quizzes');
      console.log('Lessons without quizzes:');
      lessonsWithoutQuizzes.forEach(lesson => {
        console.log(`   - ${lesson.title}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Production deployment failed:', error);
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

