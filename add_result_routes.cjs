const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

const newRoutes = `
  // ACADEMIC RESULT MODULE: LECTURER
  
  // Get course students for result entry
  app.get("/api/lecturer/courses/:courseId/students-results", requireAuth, requireRole(['Lecturer', 'Administrator']), async (req, res) => {
    try {
      const { eq, and } = await import('drizzle-orm');
      const courseId = parseInt(req.params.courseId);
      
      const studentsInCourse = await db.select({
        studentId: schema.users.id,
        name: schema.users.name,
        matricNo: schema.users.username,
        resultId: schema.results.id,
        caScore: schema.results.caScore,
        examScore: schema.results.examScore,
        totalScore: schema.results.totalScore,
        grade: schema.results.grade,
        status: schema.results.status,
      })
      .from(schema.studentCourses)
      .innerJoin(schema.users, eq(schema.studentCourses.studentId, schema.users.id))
      .leftJoin(schema.results, and(
        eq(schema.results.studentId, schema.users.id),
        eq(schema.results.courseId, courseId)
      ))
      .where(and(
        eq(schema.studentCourses.courseId, courseId),
        eq(schema.studentCourses.status, 'registered')
      ));

      res.json(studentsInCourse);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Failed to load students" });
    }
  });

  // Save/Submit Course Results
  app.post("/api/lecturer/courses/:courseId/results", requireAuth, requireRole(['Lecturer', 'Administrator']), async (req, res) => {
    try {
      const { eq, and } = await import('drizzle-orm');
      const { ResultCalculationService } = await import('./src/server/services/ResultCalculationService');
      const courseId = parseInt(req.params.courseId);
      const { students, isSubmit } = req.body; // students array with { studentId, caScore, examScore }, isSubmit boolean
      
      // Get course credit units for QP calculation
      const [course] = await db.select().from(schema.courses).where(eq(schema.courses.id, courseId));
      if (!course) return res.status(404).json({ error: "Course not found" });

      const actorId = (req as any).user.id;
      const targetStatus = isSubmit ? 'submitted' : 'draft';

      let processedCount = 0;

      for (const student of students) {
        // Find existing result to check status
        const [existing] = await db.select().from(schema.results).where(and(
          eq(schema.results.studentId, student.studentId),
          eq(schema.results.courseId, courseId)
        ));

        // Skip if locked or approved
        if (existing && ['hod_approved', 'registrar_approved', 'published', 'locked'].includes(existing.status)) {
          continue;
        }

        const caScore = student.caScore === '' || student.caScore === null ? null : Number(student.caScore);
        const examScore = student.examScore === '' || student.examScore === null ? null : Number(student.examScore);
        
        const totalScore = ResultCalculationService.calculateTotalScore(caScore, examScore);
        const { grade, gradePoint, isPass } = await ResultCalculationService.calculateGrade(totalScore);
        const qualityPoint = ResultCalculationService.calculateQualityPoint(course.credits, gradePoint);

        const resultData = {
          studentId: student.studentId,
          courseId,
          academicSession: '2025/2026', // Ideally from active session setting
          semester: course.semester || '1st',
          caScore,
          examScore,
          totalScore,
          grade,
          gradePoint,
          qualityPoint,
          status: targetStatus,
          score: totalScore // backwards compatibility
        };

        if (existing) {
          // Update
          await db.update(schema.results)
            .set(resultData)
            .where(eq(schema.results.id, existing.id));

          // Log Audit
          await db.insert(schema.resultAuditLogs).values({
            userId: actorId,
            role: (req as any).user.role,
            studentId: student.studentId,
            courseId,
            action: isSubmit ? 'Result Submitted' : 'Result Edited',
            oldCa: existing.caScore,
            newCa: caScore,
            oldExam: existing.examScore,
            newExam: examScore,
            oldGrade: existing.grade,
            newGrade: grade,
          });
        } else {
          // Insert
          await db.insert(schema.results).values(resultData);
          
          await db.insert(schema.resultAuditLogs).values({
            userId: actorId,
            role: (req as any).user.role,
            studentId: student.studentId,
            courseId,
            action: isSubmit ? 'Result Submitted' : 'Result Created',
            newCa: caScore,
            newExam: examScore,
            newGrade: grade,
          });
        }
        processedCount++;
      }

      res.json({ message: \`Successfully \${isSubmit ? 'submitted' : 'saved'} \${processedCount} results.\` });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Failed to process results" });
    }
  });
`;

if (!server.includes('ACADEMIC RESULT MODULE: LECTURER')) {
  server = server.replace(
    '  app.use(\'/uploads\', express.static(uploadDir));',
    newRoutes + '\\n  app.use(\'/uploads\', express.static(uploadDir));'
  );
  fs.writeFileSync('server.ts', server);
  console.log('Result routes added.');
} else {
  console.log('Result routes already exist.');
}
