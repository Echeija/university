const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetRegex = /const pendingCourses = await db\.select\(\{\s*courseId: schema\.courses\.id,\s*courseCode: schema\.courses\.code,\s*courseTitle: schema\.courses\.title,\s*credits: schema\.courses\.credits,\s*semester: schema\.courses\.semester,\s*submittedCount: sql<number>`count\(\*\)`\.mapWith\(Number\),\s*\}\)\s*\.from\(schema\.results\)\s*\.innerJoin\(schema\.courses, eq\(schema\.results\.courseId, schema\.courses\.id\)\)\s*\.where\(eq\(schema\.results\.status, 'submitted'\)\)\s*\.groupBy\(schema\.courses\.id, schema\.courses\.code, schema\.courses\.title, schema\.courses\.credits, schema\.courses\.semester\);/g;

const replacementString = `let departmentCondition = undefined;
      const actorRole = (req as any).user.role;
      const actorDepartment = (req as any).user.department;
      
      if (actorRole !== 'Administrator' && actorDepartment) {
          const [dept] = await db.select().from(schema.departments).where(eq(schema.departments.name, actorDepartment));
          if (dept) {
              departmentCondition = eq(schema.courses.departmentId, dept.id);
          } else {
              // If HOD has a department string but it doesn't match any department in DB, return empty
              return res.json([]);
          }
      }

      const pendingCourses = await db.select({
        courseId: schema.courses.id,
        courseCode: schema.courses.code,
        courseTitle: schema.courses.title,
        credits: schema.courses.credits,
        semester: schema.courses.semester,
        submittedCount: sql<number>\`count(*)\`.mapWith(Number),
      })
      .from(schema.results)
      .innerJoin(schema.courses, eq(schema.results.courseId, schema.courses.id))
      .where(
          and(
              eq(schema.results.status, 'submitted'),
              departmentCondition
          )
      )
      .groupBy(schema.courses.id, schema.courses.code, schema.courses.title, schema.courses.credits, schema.courses.semester);`;

if (targetRegex.test(code)) {
    code = code.replace(targetRegex, replacementString);
    fs.writeFileSync('server.ts', code);
    console.log('Patched HOD pending results route');
} else {
    console.log('Target not found for HOD pending results using regex');
}
