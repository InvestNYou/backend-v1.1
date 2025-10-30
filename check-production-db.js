const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking production database status...');
  
  try {
    // Test database connection
    console.log('🔄 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check what's in the database
    console.log('\n📊 Database Contents:');
    
    const courses = await prisma.course.findMany({
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
    
    console.log(`\n📚 Courses (${courses.length}):`);
    courses.forEach(course => {
      console.log(`   - ${course.title} (ID: ${course.id})`);
      console.log(`     Units: ${course.units.length}`);
      course.units.forEach(unit => {
        console.log(`       - ${unit.title} (${unit.lessons.length} lessons)`);
        unit.lessons.forEach(lesson => {
          console.log(`         - ${lesson.title} (${lesson.quizzes.length} quizzes)`);
        });
      });
    });
    
    const dailyFacts = await prisma.dailyFact.count();
    console.log(`\n📰 Daily Facts: ${dailyFacts}`);
    
    const users = await prisma.user.count();
    console.log(`👥 Users: ${users}`);
    
    // Test a simple query that the courses API uses
    console.log('\n🧪 Testing courses API query...');
    try {
      const testCourses = await prisma.$queryRaw`SELECT * FROM courses ORDER BY "order" ASC`;
      console.log(`✅ Courses query successful: ${testCourses.length} courses found`);
      
      if (testCourses.length > 0) {
        console.log('Sample course:', testCourses[0]);
      }
    } catch (error) {
      console.error('❌ Courses query failed:', error.message);
    }
    
    // Test units query
    try {
      const testUnits = await prisma.$queryRaw`SELECT * FROM units ORDER BY "order" ASC`;
      console.log(`✅ Units query successful: ${testUnits.length} units found`);
    } catch (error) {
      console.error('❌ Units query failed:', error.message);
    }
    
    // Test lessons query
    try {
      const testLessons = await prisma.$queryRaw`SELECT * FROM lessons ORDER BY "order" ASC`;
      console.log(`✅ Lessons query successful: ${testLessons.length} lessons found`);
    } catch (error) {
      console.error('❌ Lessons query failed:', error.message);
    }
    
    // Test quizzes query
    try {
      const testQuizzes = await prisma.$queryRaw`SELECT * FROM quizzes`;
      console.log(`✅ Quizzes query successful: ${testQuizzes.length} quizzes found`);
    } catch (error) {
      console.error('❌ Quizzes query failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
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

