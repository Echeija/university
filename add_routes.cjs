const fs = require('fs');

const serverFile = 'server.ts';
let code = fs.readFileSync(serverFile, 'utf8');

const routesToAdd = `
  // ASSIGNMENTS ROUTES

  // Get assignments for a course (student or lecturer)
  app.get("/api/courses/:courseId/assignments", requireAuth, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const courseAssignments = await db.select().from(schema.assignments).where(eq(schema.assignments.courseId, courseId));
      res.json(courseAssignments);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch assignments" });
    }
  });

  // Create an assignment (lecturer)
  app.post("/api/courses/:courseId/assignments", requireAuth, requireRole(['Lecturer', 'Administrator']), async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const { title, description, dueDate, totalMarks } = req.body;
      const [newAssignment] = await db.insert(schema.assignments).values({
        courseId,
        lecturerId: req.user.id,
        title,
        description,
        dueDate: new Date(dueDate),
        totalMarks: parseInt(totalMarks),
      }).returning();
      res.status(201).json(newAssignment);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to create assignment" });
    }
  });

  // Submit an assignment (student)
  app.post("/api/assignments/:assignmentId/submit", requireAuth, requireRole(['Student']), async (req, res) => {
    try {
      const assignmentId = parseInt(req.params.assignmentId);
      const { fileUrl, fileName } = req.body;
      const [submission] = await db.insert(schema.assignmentSubmissions).values({
        assignmentId,
        studentId: req.user.id,
        fileUrl,
        fileName,
        status: 'submitted'
      }).returning();
      res.status(201).json(submission);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to submit assignment" });
    }
  });

  // Get submissions for an assignment (lecturer)
  app.get("/api/assignments/:assignmentId/submissions", requireAuth, requireRole(['Lecturer', 'Administrator']), async (req, res) => {
    try {
      const assignmentId = parseInt(req.params.assignmentId);
      const submissions = await db.select({
        submission: schema.assignmentSubmissions,
        student: {
          id: schema.users.id,
          name: schema.users.name,
          username: schema.users.username,
        }
      })
      .from(schema.assignmentSubmissions)
      .innerJoin(schema.users, eq(schema.assignmentSubmissions.studentId, schema.users.id))
      .where(eq(schema.assignmentSubmissions.assignmentId, assignmentId));
      
      res.json(submissions.map(s => ({ ...s.submission, student: s.student })));
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  });

  // Grade a submission (lecturer)
  app.post("/api/submissions/:submissionId/grade", requireAuth, requireRole(['Lecturer', 'Administrator']), async (req, res) => {
    try {
      const submissionId = parseInt(req.params.submissionId);
      const { marksAwarded, feedback } = req.body;
      const [updated] = await db.update(schema.assignmentSubmissions)
        .set({ marksAwarded: parseInt(marksAwarded), feedback, status: 'graded' })
        .where(eq(schema.assignmentSubmissions.id, submissionId))
        .returning();
      res.json(updated);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to grade submission" });
    }
  });
  
  // Get student's own submissions
  app.get("/api/student/submissions", requireAuth, requireRole(['Student']), async (req, res) => {
    try {
      const submissions = await db.select({
        submission: schema.assignmentSubmissions,
        assignment: schema.assignments
      })
      .from(schema.assignmentSubmissions)
      .innerJoin(schema.assignments, eq(schema.assignmentSubmissions.assignmentId, schema.assignments.id))
      .where(eq(schema.assignmentSubmissions.studentId, req.user.id));
      
      res.json(submissions.map(s => ({ ...s.submission, assignment: s.assignment })));
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch student submissions" });
    }
  });
`;

if (!code.includes('ASSIGMENTS ROUTES') && !code.includes('ASSIGNMENTS ROUTES')) {
  // Find a good place to insert, like before the catch-all
  code = code.replace(
    '  app.use(\'/uploads\', express.static(uploadDir));',
    routesToAdd + '\n  app.use(\'/uploads\', express.static(uploadDir));'
  );
  fs.writeFileSync(serverFile, code);
  console.log('Routes added successfully.');
} else {
  console.log('Routes already exist.');
}
