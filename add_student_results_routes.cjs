const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

const newRoutes = `
  // ACADEMIC RESULT MODULE: STUDENT PORTAL
  app.get("/api/student/academic-profile", requireAuth, requireRole(['Student']), async (req, res) => {
    try {
      const { eq } = await import('drizzle-orm');
      const studentId = (req as any).user.id;
      
      const [cgpaRecord] = await db.select().from(schema.cgpaRecords).where(eq(schema.cgpaRecords.studentId, studentId));
      
      const [user] = await db.select().from(schema.users).where(eq(schema.users.id, studentId));

      res.json({
        cgpa: cgpaRecord ? cgpaRecord.cgpa : 0,
        totalCreditUnits: cgpaRecord ? cgpaRecord.totalCreditUnits : 0,
        totalQualityPoints: cgpaRecord ? cgpaRecord.totalQualityPoints : 0,
        academicStanding: cgpaRecord ? cgpaRecord.academicStanding : 'No Standing Yet',
        degreeClassification: cgpaRecord ? (await import('./src/server/services/ResultCalculationService')).ResultCalculationService.calculateDegreeClassification(cgpaRecord.cgpa) : 'N/A',
        user: {
          name: user.name,
          matricNo: user.username,
          department: user.department || 'Computer Science',
          faculty: user.faculty || 'Science'
        }
      });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Failed to load academic profile" });
    }
  });

  app.get("/api/student/transcript", requireAuth, requireRole(['Student', 'Registrar', 'Administrator']), async (req, res) => {
    try {
      const { eq, and } = await import('drizzle-orm');
      const studentId = (req as any).user.role === 'Student' ? (req as any).user.id : parseInt(req.query.studentId as string);
      
      if (!studentId) return res.status(400).json({ error: "Student ID required" });

      const publishedResults = await db.select({
        id: schema.results.id,
        courseCode: schema.courses.code,
        courseTitle: schema.courses.title,
        credits: schema.courses.credits,
        caScore: schema.results.caScore,
        examScore: schema.results.examScore,
        totalScore: schema.results.totalScore,
        grade: schema.results.grade,
        gradePoint: schema.results.gradePoint,
        qualityPoint: schema.results.qualityPoint,
        academicSession: schema.results.academicSession,
        semester: schema.results.semester
      })
      .from(schema.results)
      .innerJoin(schema.courses, eq(schema.results.courseId, schema.courses.id))
      .where(and(
        eq(schema.results.studentId, studentId),
        eq(schema.results.status, 'published')
      ));

      const semesterRecords = await db.select().from(schema.semesterGpaRecords).where(eq(schema.semesterGpaRecords.studentId, studentId));
      const [cgpaRecord] = await db.select().from(schema.cgpaRecords).where(eq(schema.cgpaRecords.studentId, studentId));

      res.json({
        results: publishedResults,
        semesters: semesterRecords,
        cumulative: cgpaRecord
      });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: "Failed to load transcript data" });
    }
  });
`;

if (!server.includes('ACADEMIC RESULT MODULE: STUDENT PORTAL')) {
  server = server.replace(
    '  app.use(\'/uploads\', express.static(uploadDir));',
    newRoutes + '\\n  app.use(\'/uploads\', express.static(uploadDir));'
  );
  fs.writeFileSync('server.ts', server);
  console.log('Student result routes added.');
} else {
  console.log('Routes already exist.');
}
