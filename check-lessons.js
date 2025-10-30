const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkLessons() {
  try {
    const lessons = await prisma.lesson.findMany({
      include: {
        unit: {
          include: {
            course: true
          }
        }
      },
      take: 10
    });

    console.log('Lessons found:');
    lessons.forEach(l => {
      console.log(`- ${l.title} (ID: ${l.id}) - ${l.unit?.course?.title || 'No course'}`);
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkLessons();
