const fs = require('fs');
let seed = fs.readFileSync('src/db/seed.ts', 'utf8');

const importRegex = /import { (.*?) } from '.\/schema';/;
seed = seed.replace(importRegex, "import { $1, gradingRules, semesterGpaRecords, cgpaRecords } from './schema';");

const oldResultsSeed = `  await db.insert(results).values([
    { studentId: student.id, courseId: csc101.id, score: 75, grade: 'A', semester: '1st' },
    { studentId: student.id, courseId: csc102.id, score: 68, grade: 'B', semester: '1st' }
  ]);`;

const newResultsSeed = `  // Grading Rules
  await db.insert(gradingRules).values([
    { minScore: 70, maxScore: 100, grade: 'A', gradePoint: 5.0, description: 'Excellent', isPass: true },
    { minScore: 60, maxScore: 69, grade: 'B', gradePoint: 4.0, description: 'Very Good', isPass: true },
    { minScore: 50, maxScore: 59, grade: 'C', gradePoint: 3.0, description: 'Good', isPass: true },
    { minScore: 45, maxScore: 49, grade: 'D', gradePoint: 2.0, description: 'Average', isPass: true },
    { minScore: 40, maxScore: 44, grade: 'E', gradePoint: 1.0, description: 'Pass', isPass: true },
    { minScore: 0, maxScore: 39, grade: 'F', gradePoint: 0.0, description: 'Fail', isPass: false }
  ]).onConflictDoNothing();

  await db.insert(results).values([
    { studentId: student.id, courseId: csc101.id, caScore: 25, examScore: 50, score: 75, grade: 'A', gradePoint: 5.0, qualityPoint: 15.0, semester: '1st', academicSession: '2025/2026', status: 'published' },
    { studentId: student.id, courseId: csc102.id, caScore: 28, examScore: 40, score: 68, grade: 'B', gradePoint: 4.0, qualityPoint: 8.0, semester: '1st', academicSession: '2025/2026', status: 'published' }
  ]);

  await db.insert(semesterGpaRecords).values([
    { studentId: student.id, academicSession: '2025/2026', semester: '1st', totalCreditUnits: 5, totalQualityPoints: 23.0, gpa: 4.60 }
  ]);

  await db.insert(cgpaRecords).values([
    { studentId: student.id, totalCreditUnits: 5, totalQualityPoints: 23.0, cgpa: 4.60, academicStanding: 'Good Standing' }
  ]);`;

seed = seed.replace(oldResultsSeed, newResultsSeed);
fs.writeFileSync('src/db/seed.ts', seed);
console.log('Seed updated');
