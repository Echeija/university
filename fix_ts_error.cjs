const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /let baseQuery = db\.select\(\{[\s\S]*?\}\)[\s\S]*?if \(userRole === 'Lecturer'\) \{[\s\S]*?\} else \{[\s\S]*?\}[\s\S]*?const allCourses = await baseQuery\.groupBy\(schema\.courses\.id, schema\.courseAllocations\.id\);/m;

const replacement = `const whereClause = userRole === 'Lecturer'
         ? and(eq(schema.courseAllocations.lecturerId, userId), eq(schema.courseAllocations.academicYear, currentSessionName))
         : eq(schema.courseAllocations.academicYear, currentSessionName);

      const allCourses = await db.select({
        id: schema.courses.id,
        code: schema.courses.code,
        title: schema.courses.title,
        credits: schema.courses.credits,
        departmentId: schema.courses.departmentId,
        semester: schema.courses.semester,
        studentsCount: sql\`count(\${schema.studentCourses.studentId})\`.mapWith(Number)
      })
      .from(schema.courses)
      .innerJoin(schema.courseAllocations, eq(schema.courses.id, schema.courseAllocations.courseId))
      .leftJoin(schema.studentCourses, and(
          eq(schema.courses.id, schema.studentCourses.courseId),
          eq(schema.studentCourses.status, 'registered')
      ))
      .where(whereClause)
      .groupBy(schema.courses.id, schema.courseAllocations.id);`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
