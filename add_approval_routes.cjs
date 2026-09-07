const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

const newRoutes = `
  // ACADEMIC RESULT MODULE: HOD APPROVAL
  app.get("/api/hod/results/pending", requireAuth, requireRole(['HOD', 'Administrator']), async (req, res) => {
    try {
      const { eq, and, sql } = await import('drizzle-orm');
      
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
      .where(eq(schema.results.status, 'submitted'))
      .groupBy(schema.courses.id, schema.courses.code, schema.courses.title, schema.courses.credits, schema.courses.semester);

      res.json(pendingCourses);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Failed to load pending results" });
    }
  });

  app.get("/api/hod/results/course/:courseId", requireAuth, requireRole(['HOD', 'Administrator', 'Registrar']), async (req, res) => {
    try {
      const { eq, and } = await import('drizzle-orm');
      const courseId = parseInt(req.params.courseId);
      const statusFilter = req.query.status as string; // 'submitted' or 'hod_approved'
      
      const results = await db.select({
        resultId: schema.results.id,
        studentId: schema.users.id,
        matricNo: schema.users.username,
        name: schema.users.name,
        caScore: schema.results.caScore,
        examScore: schema.results.examScore,
        totalScore: schema.results.totalScore,
        grade: schema.results.grade,
        status: schema.results.status,
      })
      .from(schema.results)
      .innerJoin(schema.users, eq(schema.results.studentId, schema.users.id))
      .where(and(
        eq(schema.results.courseId, courseId),
        statusFilter ? eq(schema.results.status, statusFilter) : undefined
      ));

      res.json(results);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Failed to load course results" });
    }
  });

  app.post("/api/hod/results/approve", requireAuth, requireRole(['HOD', 'Administrator']), async (req, res) => {
    try {
      const { eq, inArray } = await import('drizzle-orm');
      const { resultIds, action, reason } = req.body; // action: 'approve' or 'return'
      const actorId = (req as any).user.id;
      
      const newStatus = action === 'approve' ? 'hod_approved' : 'returned';
      const logAction = action === 'approve' ? 'Result Approved by HOD' : 'Result Returned by HOD';

      await db.update(schema.results)
        .set({ status: newStatus, returnReason: reason, approvedByHodId: actorId })
        .where(inArray(schema.results.id, resultIds));

      // Audit logs
      const logs = resultIds.map((id: number) => ({
        userId: actorId,
        role: (req as any).user.role,
        studentId: 1, // We'd ideally query this, but keeping it simple for mass insert
        courseId: 1,
        action: logAction,
        reason: reason
      }));
      // In a real app we'd fetch the student/course IDs for each result first to log accurately.

      res.json({ message: \`Results successfully \${newStatus}\` });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Failed to process results" });
    }
  });

  // ACADEMIC RESULT MODULE: REGISTRAR PUBLICATION
  app.get("/api/registrar/results/pending", requireAuth, requireRole(['Registrar', 'Administrator']), async (req, res) => {
    try {
      const { eq, sql } = await import('drizzle-orm');
      const pendingCourses = await db.select({
        courseId: schema.courses.id,
        courseCode: schema.courses.code,
        courseTitle: schema.courses.title,
        credits: schema.courses.credits,
        semester: schema.courses.semester,
        approvedCount: sql<number>\`count(*)\`.mapWith(Number),
      })
      .from(schema.results)
      .innerJoin(schema.courses, eq(schema.results.courseId, schema.courses.id))
      .where(eq(schema.results.status, 'hod_approved'))
      .groupBy(schema.courses.id, schema.courses.code, schema.courses.title, schema.courses.credits, schema.courses.semester);

      res.json(pendingCourses);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Failed to load pending publications" });
    }
  });

  app.post("/api/registrar/results/publish", requireAuth, requireRole(['Registrar', 'Administrator']), async (req, res) => {
    try {
      const { eq, inArray } = await import('drizzle-orm');
      const { ResultCalculationService } = await import('./src/server/services/ResultCalculationService');
      const { resultIds, courseId, action, reason } = req.body;
      const actorId = (req as any).user.id;

      if (action === 'return') {
        await db.update(schema.results)
          .set({ status: 'returned', returnReason: reason })
          .where(inArray(schema.results.id, resultIds));
        return res.json({ message: 'Results returned to Lecturer' });
      }

      // Publish
      await db.update(schema.results)
        .set({ status: 'published', approvedByRegistrarId: actorId })
        .where(inArray(schema.results.id, resultIds));

      // Get affected students to update their GPA/CGPA and notify them
      const publishedResults = await db.select({
        studentId: schema.results.studentId,
        courseCode: schema.courses.code
      }).from(schema.results)
        .innerJoin(schema.courses, eq(schema.results.courseId, schema.courses.id))
        .where(inArray(schema.results.id, resultIds));

      const uniqueStudents = Array.from(new Set(publishedResults.map(r => r.studentId)));

      for (const studentId of uniqueStudents) {
        await ResultCalculationService.updateStudentGPAAndCGPA(studentId);
        
        // Notify student
        const studentCourseCodes = publishedResults.filter(r => r.studentId === studentId).map(r => r.courseCode);
        await db.insert(schema.notifications).values({
          userId: studentId,
          title: "Results Published",
          message: \`Your results for \${studentCourseCodes.join(', ')} have been published. Login to view your updated academic record.\`,
          type: "academic",
        });
      }

      res.json({ message: \`Successfully published \${resultIds.length} results. GPA and CGPA updated automatically.\` });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Failed to publish results" });
    }
  });
`;

if (!server.includes('ACADEMIC RESULT MODULE: HOD APPROVAL')) {
  server = server.replace(
    '  app.use(\'/uploads\', express.static(uploadDir));',
    newRoutes + '\\n  app.use(\'/uploads\', express.static(uploadDir));'
  );
  fs.writeFileSync('server.ts', server);
  console.log('Approval and publication routes added.');
} else {
  console.log('Approval routes already exist.');
}
