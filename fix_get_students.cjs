const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regexGetStudents = /const studentsInCourse = await db\.select\(\{[\s\S]*?\.leftJoin\(schema\.results, and\(\s*eq\(schema\.results\.studentId, schema\.users\.id\),\s*eq\(schema\.results\.courseId, courseId\)\s*\)\)/m;

const replacementGetStudents = `
      const [activeSession] = await db.select().from(schema.academicSessions).where(eq(schema.academicSessions.isActive, true));
      const [activeSemester] = await db.select().from(schema.semesters).where(and(eq(schema.semesters.sessionId, activeSession?.id), eq(schema.semesters.isActive, true)));
      
      const currentSessionName = activeSession?.name || '2024/2025';
      const currentSemesterName = activeSemester?.name || 'First';

      const studentsInCourse = await db.select({
        studentId: schema.users.id,
        name: schema.users.name,
        matricNo: schema.users.username,
        resultId: schema.results.id,
        caScore: schema.results.caScore,
        examScore: schema.results.examScore,
        score: schema.results.score,
        grade: schema.results.grade,
        status: schema.results.status,
      })
      .from(schema.studentCourses)
      .innerJoin(schema.users, eq(schema.studentCourses.studentId, schema.users.id))
      .leftJoin(schema.results, and(
        eq(schema.results.studentId, schema.users.id),
        eq(schema.results.courseId, courseId),
        eq(schema.results.academicSession, currentSessionName),
        eq(schema.results.semester, currentSemesterName)
      ))`;

code = code.replace(regexGetStudents, replacementGetStudents);
fs.writeFileSync('server.ts', code);
