const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /const resultData = \{\s*studentId: student\.studentId,\s*courseId,\s*academicSession: '2025\/2026', \/\/ Ideally from active session setting\s*semester: course\.semester \|\| '1st',\s*caScore,\s*caBreakdown,\s*examScore,\s*score: totalScore,\s*grade,\s*gradePoint,\s*qualityPoint,\s*status: targetStatus as any,\s*\};/m;

const replacement = `
        const [activeSession] = await db.select().from(schema.academicSessions).where(eq(schema.academicSessions.isActive, true));
        const [activeSemester] = await db.select().from(schema.semesters).where(and(eq(schema.semesters.sessionId, activeSession?.id), eq(schema.semesters.isActive, true)));
        
        const resultData = {
          studentId: student.studentId,
          courseId,
          academicSession: activeSession?.name || '2024/2025',
          semester: activeSemester?.name || course.semester || 'First',
          caScore,
          caBreakdown,
          examScore,
          score: totalScore,
          grade,
          gradePoint,
          qualityPoint,
          status: targetStatus as any,
        };`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
