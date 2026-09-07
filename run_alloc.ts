import { db } from './src/db/index.js';
import { courseAllocations, courses, users, gradingRules } from './src/db/schema.js';

async function run() {
  const lecturer = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, 'lecturer@smartglobal.edu.ng')
  });
  
  const csc101 = await db.query.courses.findFirst({
    where: (c, { eq }) => eq(c.code, 'CSC101')
  });

  const csc102 = await db.query.courses.findFirst({
    where: (c, { eq }) => eq(c.code, 'CSC102')
  });

  if (lecturer && csc101 && csc102) {
    try {
      await db.insert(courseAllocations).values([
        { courseId: csc101.id, lecturerId: lecturer.id, academicYear: '2025/2026', semester: '1st' },
        { courseId: csc102.id, lecturerId: lecturer.id, academicYear: '2025/2026', semester: '1st' }
      ]).onConflictDoNothing();
      console.log('Allocated courses to lecturer.');
    } catch (e) {
      console.log('Allocations failed:', e.message);
    }
  }
  
  try {
     await db.insert(gradingRules).values([
      { minScore: 70, maxScore: 100, grade: 'A', gradePoint: 5.0, description: 'Excellent', isPass: true },
      { minScore: 60, maxScore: 69.99, grade: 'B', gradePoint: 4.0, description: 'Very Good', isPass: true },
      { minScore: 50, maxScore: 59.99, grade: 'C', gradePoint: 3.0, description: 'Good', isPass: true },
      { minScore: 45, maxScore: 49.99, grade: 'D', gradePoint: 2.0, description: 'Average', isPass: true },
      { minScore: 40, maxScore: 44.99, grade: 'E', gradePoint: 1.0, description: 'Pass', isPass: true },
      { minScore: 0, maxScore: 39.99, grade: 'F', gradePoint: 0.0, description: 'Fail', isPass: false }
    ]).onConflictDoNothing();
    console.log('Grading rules inserted.');
  } catch(e) {
     console.log('Rules failed:', e.message);
  }
  
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
