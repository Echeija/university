const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

const examEndpoints = `
  // EXAM SCHEDULES
  app.get("/api/exams", requireAuth, async (req, res) => {
    try {
      const { examSchedules, courses, users } = await import('./src/db/schema');
      const { db } = await import('./src/db');
      const { eq } = await import('drizzle-orm');
      
      const exams = await db.select({
        id: examSchedules.id,
        examDate: examSchedules.examDate,
        startTime: examSchedules.startTime,
        endTime: examSchedules.endTime,
        venue: examSchedules.venue,
        status: examSchedules.status,
        instructions: examSchedules.instructions,
        courseCode: courses.code,
        courseTitle: courses.title,
        invigilatorName: users.name,
      })
      .from(examSchedules)
      .innerJoin(courses, eq(examSchedules.courseId, courses.id))
      .leftJoin(users, eq(examSchedules.invigilatorId, users.id));
      
      res.json(exams);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch exams" });
    }
  });

  app.post("/api/lecturer/exams", requireAuth, requireRole(['Lecturer', 'Administrator']), async (req, res) => {
    try {
      const { examSchedules } = await import('./src/db/schema');
      const { db } = await import('./src/db');
      const { courseId, examDate, startTime, endTime, venue, invigilatorId, instructions } = req.body;
      
      const newExam = await db.insert(examSchedules).values({
        courseId, examDate, startTime, endTime, venue, invigilatorId, instructions,
        createdAt: new Date()
      }).returning();
      
      res.json(newExam[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to schedule exam" });
    }
  });

  app.delete("/api/lecturer/exams/:id", requireAuth, requireRole(['Lecturer', 'Administrator']), async (req, res) => {
    try {
      const { examSchedules } = await import('./src/db/schema');
      const { db } = await import('./src/db');
      const { eq } = await import('drizzle-orm');
      await db.delete(examSchedules).where(eq(examSchedules.id, parseInt(req.params.id)));
      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to delete exam" });
    }
  });

  app.get("/api/student/exams", requireAuth, requireRole(['Student']), async (req, res) => {
    try {
      const studentId = (req as any).user.id;
      const { examSchedules, courses, studentCourses, users } = await import('./src/db/schema');
      const { db } = await import('./src/db');
      const { eq, and } = await import('drizzle-orm');
      
      const exams = await db.select({
        id: examSchedules.id,
        examDate: examSchedules.examDate,
        startTime: examSchedules.startTime,
        endTime: examSchedules.endTime,
        venue: examSchedules.venue,
        status: examSchedules.status,
        instructions: examSchedules.instructions,
        courseCode: courses.code,
        courseTitle: courses.title,
        invigilatorName: users.name,
      })
      .from(examSchedules)
      .innerJoin(courses, eq(examSchedules.courseId, courses.id))
      .innerJoin(studentCourses, eq(courses.id, studentCourses.courseId))
      .leftJoin(users, eq(examSchedules.invigilatorId, users.id))
      .where(and(eq(studentCourses.studentId, studentId), eq(studentCourses.status, 'registered')));
      
      res.json(exams);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch student exams" });
    }
  });

  app.get("/api/lecturer/courses", requireAuth, requireRole(['Lecturer', 'Administrator']), async (req, res) => {
    try {
      const lecturerId = (req as any).user.id;
      const { courses, courseAllocations } = await import('./src/db/schema');
      const { db } = await import('./src/db');
      const { eq } = await import('drizzle-orm');
      
      const myCourses = await db.select({
        id: courses.id,
        code: courses.code,
        title: courses.title
      })
      .from(courses)
      .innerJoin(courseAllocations, eq(courses.id, courseAllocations.courseId))
      .where(eq(courseAllocations.lecturerId, lecturerId));
      
      res.json(myCourses);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch lecturer courses" });
    }
  });
`;

if (!server.includes('/api/exams')) {
  server = server.replace('  // Catch-all for missing API routes', examEndpoints + '\n  // Catch-all for missing API routes');
  fs.writeFileSync('server.ts', server);
  console.log('Exam endpoints added.');
} else {
  console.log('Exam endpoints already exist.');
}
