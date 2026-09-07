const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace the first one
const regex1 = /app\.get\("\/api\/lecturer\/courses", requireAuth, requireRole\(\['Lecturer'\]\), async \(req, res\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ error: 'Failed to fetch lecturer courses' \}\);\s*\}\s*\}\);/;

const replacement1 = `app.get("/api/lecturer/courses", requireAuth, requireRole(['Lecturer', 'Administrator', 'HOD', 'Dean']), async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
      
      const [activeSession] = await db.select().from(schema.academicSessions).where(eq(schema.academicSessions.isActive, true));
      const currentSessionName = activeSession?.name || '2024/2025';

      let baseQuery = db.select({
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
      ));

      if (userRole === 'Lecturer') {
         baseQuery = baseQuery.where(and(
             eq(schema.courseAllocations.lecturerId, userId),
             eq(schema.courseAllocations.academicYear, currentSessionName)
         ));
      } else {
         baseQuery = baseQuery.where(eq(schema.courseAllocations.academicYear, currentSessionName));
      }

      const allCourses = await baseQuery.groupBy(schema.courses.id, schema.courseAllocations.id);
      
      res.json(allCourses);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch lecturer courses' });
    }
});`;

code = code.replace(regex1, replacement1);

// Replace the second one (using double quotes in error)
const regex2 = /app\.get\("\/api\/lecturer\/courses", requireAuth, requireRole\(\['Lecturer', 'Administrator'\]\), async \(req, res\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ error: "Failed to fetch lecturer courses" \}\);\s*\}\s*\}\);/;
code = code.replace(regex2, '');

fs.writeFileSync('server.ts', code);
