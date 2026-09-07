const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const apiBlock = `
app.get('/api/settings/grading_rules', requireAuth, async (req, res) => {
  try {
    const rules = await db.select().from(schema.gradingRules).orderBy(desc(schema.gradingRules.minScore));
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/lecturer/results/exam', requireAuth, requireRole(['Lecturer']), async (req, res) => {
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

    // Process each student's Exam result
    for (const sr of studentResults) {
      const existing = await db.query.results.findFirst({
        where: and(
          eq(schema.results.studentId, sr.studentId),
          eq(schema.results.courseId, courseId)
        )
      });
      
      if (existing) {
        if (existing.status !== 'draft' && existing.status !== 'returned') {
          continue; // skip locked records
        }
        await db.update(schema.results)
          .set({
            examScore: sr.examScore,
            score: sr.score, // Total score
            updatedAt: new Date()
          })
          .where(eq(schema.results.id, existing.id));
      } else {
        await db.insert(schema.results).values({
          studentId: sr.studentId,
          courseId: courseId,
          academicSession: academicSession || '2025/2026',
          semester: semester || '1st',
          caScore: 0,
          examScore: sr.examScore,
          score: sr.score,
          status: 'draft'
        });
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/lecturer/results/submit', requireAuth, requireRole(['Lecturer']), async (req, res) => {
  try {
    const { courseId } = req.body;
    
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
    
    // Update all draft/returned results to submitted
    await db.update(schema.results)
      .set({ status: 'submitted', updatedAt: new Date() })
      .where(
        and(
          eq(schema.results.courseId, courseId),
          inArray(schema.results.status, ['draft', 'returned'])
        )
      );
      
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
`;

if (!content.includes('/api/lecturer/results/exam')) {
  content = content.replace('// Lecturer CA & Results API', '// Lecturer CA & Results API\n' + apiBlock);
  fs.writeFileSync('server.ts', content);
  console.log('Added Lecturer Exam API');
} else {
  console.log('API already exists');
}
