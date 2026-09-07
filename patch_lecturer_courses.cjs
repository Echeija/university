const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Update first definition to allow Admin and filter by active session
const regex1 = /app\.get\("\/api\/lecturer\/courses", requireAuth, requireRole\(\['Lecturer'\]\), async \(req, res\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ error: 'Failed to fetch lecturer courses' \}\);\s*\}\s*\}\);/m;

const replacement1 = `app.get("/api/lecturer/courses", requireAuth, requireRole(['Lecturer', 'Administrator']), async (req, res) => {
    try {
      const lecturerId = (req as any).user.id;
      const userRole = (req as any).user.role;
      const { courses, studentCourses, courseAllocations, academicSessions } = await import('./src/db/schema');
      const { eq, sql, and } = await import('drizzle-orm');
      
      const [activeSession] = await db.select().from(academicSessions).where(eq(academicSessions.isActive, true));
      const currentSessionName = activeSession?.name || '2024/2025';

      let baseQuery = db.select({
        id: courses.id,
        code: courses.code,
        title: courses.title,
        credits: courses.credits,
        departmentId: courses.departmentId,
        semester: courses.semester,
        studentsCount: sql\`count(\${studentCourses.studentId})\`.mapWith(Number)
      })
      .from(courses)
      .innerJoin(courseAllocations, eq(courses.id, courseAllocations.courseId))
      .leftJoin(studentCourses, and(
          eq(courses.id, studentCourses.courseId),
          eq(studentCourses.status, 'registered')
      ));

      if (userRole !== 'Administrator') {
         baseQuery = baseQuery.where(and(
             eq(courseAllocations.lecturerId, lecturerId),
             eq(courseAllocations.academicYear, currentSessionName)
         ));
      } else {
         baseQuery = baseQuery.where(eq(courseAllocations.academicYear, currentSessionName));
      }

      const allCourses = await baseQuery.groupBy(courses.id, courseAllocations.id);
      
      res.json(allCourses);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch lecturer courses' });
    }
});`;

code = code.replace(regex1, replacement1);

// Remove the second definition
const regex2 = /app\.get\("\/api\/lecturer\/courses", requireAuth, requireRole\(\['Lecturer', 'Administrator'\]\), async \(req, res\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ error: "Failed to fetch lecturer courses" \}\);\s*\}\s*\}\);/m;
code = code.replace(regex2, '');

fs.writeFileSync('server.ts', code);
