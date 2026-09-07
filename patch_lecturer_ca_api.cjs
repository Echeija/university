const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const apiBlock = `
// Lecturer CA & Results API
app.get('/api/lecturer/assigned-courses', requireAuth, requireRole(['Lecturer']), async (req, res) => {
  try {
    const allocations = await db.select({
      id: schema.courseAllocations.id,
      courseId: schema.courses.id,
      courseCode: schema.courses.code,
      courseTitle: schema.courses.title,
      credits: schema.courses.credits,
      semester: schema.courseAllocations.semester,
      academicYear: schema.courseAllocations.academicYear
    })
    .from(schema.courseAllocations)
    .innerJoin(schema.courses, eq(schema.courseAllocations.courseId, schema.courses.id))
    .where(eq(schema.courseAllocations.lecturerId, req.user.id));
    
    res.json(allocations);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/lecturer/courses/:courseId/students', requireAuth, requireRole(['Lecturer']), async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    
    // First verify lecturer is assigned to this course
    const allocation = await db.query.courseAllocations.findFirst({
      where: and(
        eq(schema.courseAllocations.lecturerId, req.user.id),
        eq(schema.courseAllocations.courseId, courseId)
      )
    });
    
    if (!allocation) {
      return res.status(403).json({ error: 'Not authorized for this course' });
    }

    // Get students registered for this course
    const registeredStudents = await db.select({
      studentId: schema.users.id,
      name: schema.users.name,
      matricNo: schema.users.username, // using username as matric no
      department: schema.users.department
    })
    .from(schema.studentCourses)
    .innerJoin(schema.users, eq(schema.studentCourses.studentId, schema.users.id))
    .where(eq(schema.studentCourses.courseId, courseId));

    // Get existing results for these students
    const existingResults = await db.select()
    .from(schema.results)
    .where(eq(schema.results.courseId, courseId));

    const resultsMap = new Map();
    existingResults.forEach(r => resultsMap.set(r.studentId, r));

    const data = registeredStudents.map(student => {
      const result = resultsMap.get(student.studentId);
      return {
        ...student,
        resultId: result?.id || null,
        caScore: result?.caScore || 0,
        caBreakdown: result?.caBreakdown || {},
        examScore: result?.examScore || 0,
        score: result?.score || 0,
        status: result?.status || 'draft'
      };
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/lecturer/results/ca', requireAuth, requireRole(['Lecturer']), async (req, res) => {
  try {
    const { courseId, academicSession, semester, results: studentResults } = req.body;
    
    // Verify allocation
    const allocation = await db.query.courseAllocations.findFirst({
      where: and(
        eq(schema.courseAllocations.lecturerId, req.user.id),
        eq(schema.courseAllocations.courseId, courseId)
      )
    });
    
    if (!allocation) {
      return res.status(403).json({ error: 'Not authorized for this course' });
    }

    // Process each student's CA result
    for (const sr of studentResults) {
      // Check existing result
      const existing = await db.query.results.findFirst({
        where: and(
          eq(schema.results.studentId, sr.studentId),
          eq(schema.results.courseId, courseId)
        )
      });
      
      if (existing) {
        // Enforce status machine
        if (existing.status !== 'draft' && existing.status !== 'returned') {
          continue; // skip locked records
        }
        await db.update(schema.results)
          .set({
            caScore: sr.caScore,
            caBreakdown: sr.caBreakdown,
            updatedAt: new Date()
          })
          .where(eq(schema.results.id, existing.id));
      } else {
        await db.insert(schema.results).values({
          studentId: sr.studentId,
          courseId: courseId,
          academicSession: academicSession || '2025/2026',
          semester: semester || '1st',
          caScore: sr.caScore,
          caBreakdown: sr.caBreakdown,
          status: 'draft'
        });
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
`;

if (!content.includes('/api/lecturer/assigned-courses')) {
  content = content.replace('// Result Publish/Approve Logic', apiBlock + '\n// Result Publish/Approve Logic');
  fs.writeFileSync('server.ts', content);
  console.log('Added Lecturer CA API');
} else {
  console.log('API already exists');
}
