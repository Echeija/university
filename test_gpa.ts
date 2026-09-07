import { db } from './src/db/index.js';
import { results, semesterGpaRecords, cgpaRecords } from './src/db/schema.js';
import { ResultCalculationService } from './src/server/services/ResultCalculationService.js';
import { eq, inArray } from 'drizzle-orm';

async function run() {
  console.log('Testing GPA calculation engine...');

  const student = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, 'student@smartglobal.edu.ng')
  });

  if (!student) {
    console.log('Student not found.');
    process.exit(1);
  }

  // Ensure they have some results
  let allResults = await db.select().from(results).where(eq(results.studentId, student.id));
  console.log('Total results for student:', allResults.length);

  // If no results, let's create a few dummy ones
  if (allResults.length === 0) {
    console.log('No results found, please run the previous result creation workflow.');
    process.exit(1);
  }

  // Publish all their results
  const resultIdsToPublish = allResults.map(r => r.id);
  await db.update(results).set({status: 'published'}).where(inArray(results.id, resultIdsToPublish));

  // Run calculation engine
  await ResultCalculationService.updateStudentGPAAndCGPA(student.id);

  // Check the DB records
  const semesters = await db.select().from(semesterGpaRecords).where(eq(semesterGpaRecords.studentId, student.id));
  const cgpa = await db.select().from(cgpaRecords).where(eq(cgpaRecords.studentId, student.id));

  console.log('Semester GPAs:', semesters);
  console.log('Cumulative GPA:', cgpa);

  process.exit(0);
}

run();
