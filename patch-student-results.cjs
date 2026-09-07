const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `      const academicResults = await db.select({
        id: results.id,
        course: courses,
        score: results.score,
        grade: results.grade,
        semester: results.semester,
      }).from(results)
        .leftJoin(courses, eq(results.courseId, courses.id))
        .where(eq(results.studentId, userId));`;

const replacement = `      const academicResults = await db.select({
        id: results.id,
        course: courses,
        score: results.score,
        grade: results.grade,
        semester: results.semester,
      }).from(results)
        .leftJoin(courses, eq(results.courseId, courses.id))
        .where(
          and(
            eq(results.studentId, userId),
            eq(results.status, 'published')
          )
        );`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log('Patched student results route');
} else {
    console.log('Target not found for student results');
}
