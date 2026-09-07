import { db } from './src/db/index.js';
import { studentCourses } from './src/db/schema.js';

async function run() {
  const student = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, 'student@smartglobal.edu.ng')
  });
  
  if (student) {
    try {
      await db.insert(studentCourses).values([
        { courseId: 6, studentId: student.id, semester: '1st', status: 'registered' },
        { courseId: 7, studentId: student.id, semester: '1st', status: 'registered' }
      ]).onConflictDoNothing();
      console.log('Registered student in courses.');
    } catch (e) {
      console.log('Student registration failed:', e.message);
    }
  }
  process.exit(0);
}

run();
