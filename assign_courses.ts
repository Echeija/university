import { db } from './src/db/index.js';
import { courseAllocations } from './src/db/schema.js';

async function run() {
  const lecturer = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, 'lecturer@smartglobal.edu.ng')
  });
  
  if (lecturer) {
    try {
      await db.insert(courseAllocations).values([
        { courseId: 6, lecturerId: lecturer.id, academicYear: '2025/2026', semester: '1st' },
        { courseId: 7, lecturerId: lecturer.id, academicYear: '2025/2026', semester: '1st' }
      ]).onConflictDoNothing();
      console.log('Allocated courses to lecturer.');
    } catch (e) {
      console.log('Allocations failed:', e.message);
    }
  }
  process.exit(0);
}

run();
