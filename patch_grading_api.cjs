const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// 1. Replace the GET grading_rules to include auto-seeding
const newGetRules = `app.get('/api/settings/grading_rules', requireAuth, async (req, res) => {
  try {
    let rules = await db.select().from(schema.gradingRules).orderBy(desc(schema.gradingRules.minScore));
    
    // Auto-seed default 5-point system if none exists
    if (rules.length === 0) {
      const defaults = [
        { minScore: 70, maxScore: 100, grade: 'A', gradePoint: 5, description: 'Excellent', isPass: true },
        { minScore: 60, maxScore: 69.99, grade: 'B', gradePoint: 4, description: 'Very Good', isPass: true },
        { minScore: 50, maxScore: 59.99, grade: 'C', gradePoint: 3, description: 'Good', isPass: true },
        { minScore: 45, maxScore: 49.99, grade: 'D', gradePoint: 2, description: 'Pass', isPass: true },
        { minScore: 40, maxScore: 44.99, grade: 'E', gradePoint: 1, description: 'Poor Pass', isPass: true },
        { minScore: 0, maxScore: 39.99, grade: 'F', gradePoint: 0, description: 'Fail', isPass: false }
      ];
      await db.insert(schema.gradingRules).values(defaults);
      rules = await db.select().from(schema.gradingRules).orderBy(desc(schema.gradingRules.minScore));
    }
    
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/settings/grading_rules', requireAuth, requireRole(['Administrator', 'Admin']), async (req, res) => {
  try {
    await db.insert(schema.gradingRules).values(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/settings/grading_rules/:id', requireAuth, requireRole(['Administrator', 'Admin']), async (req, res) => {
  try {
    await db.update(schema.gradingRules).set(req.body).where(eq(schema.gradingRules.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/settings/grading_rules/:id', requireAuth, requireRole(['Administrator', 'Admin']), async (req, res) => {
  try {
    await db.delete(schema.gradingRules).where(eq(schema.gradingRules.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});`;

// Replace old GET rules with the new block
const oldGetRegex = /app\.get\('\/api\/settings\/grading_rules'[\s\S]*?\}\);/;
if (content.match(oldGetRegex)) {
  content = content.replace(oldGetRegex, newGetRules);
}

// 2. Enhance the Exam Put route to calculate Grade and QP automatically
const newExamPut = `app.put('/api/lecturer/results/exam', requireAuth, requireRole(['Lecturer']), async (req, res) => {
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

    // Fetch rules & course credits for calculation
    const rules = await db.select().from(schema.gradingRules);
    const course = await db.query.courses.findFirst({ where: eq(schema.courses.id, courseId) });
    const credits = course ? course.credits : 0;

    // Process each student's Exam result
    for (const sr of studentResults) {
      const existing = await db.query.results.findFirst({
        where: and(
          eq(schema.results.studentId, sr.studentId),
          eq(schema.results.courseId, courseId)
        )
      });
      
      let finalScore = sr.score;
      let grade = 'N/A';
      let gradePoint = 0;
      let qualityPoint = 0;

      // Ensure total score is calculated properly in case client sent partials
      if (existing) {
         finalScore = (existing.caScore || 0) + (sr.examScore || 0);
      } else {
         finalScore = sr.examScore || 0;
      }

      // Find matching grade rule
      const matchedRule = rules.find(r => finalScore >= r.minScore && finalScore <= r.maxScore);
      if (matchedRule) {
        grade = matchedRule.grade;
        gradePoint = matchedRule.gradePoint;
        qualityPoint = gradePoint * credits;
      }

      if (existing) {
        if (existing.status !== 'draft' && existing.status !== 'returned') {
          continue; // skip locked records
        }
        await db.update(schema.results)
          .set({
            examScore: sr.examScore,
            score: finalScore,
            grade: grade,
            gradePoint: gradePoint,
            qualityPoint: qualityPoint,
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
          score: finalScore,
          grade: grade,
          gradePoint: gradePoint,
          qualityPoint: qualityPoint,
          status: 'draft'
        });
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});`;

const oldExamPutRegex = /app\.put\('\/api\/lecturer\/results\/exam'[\s\S]*?\}\);/g;
const matches = content.match(oldExamPutRegex);
if (matches && matches.length > 0) {
  // Take the first match in case of multiple (should only be one)
  content = content.replace(matches[0], newExamPut);
}

fs.writeFileSync('server.ts', content);
console.log('Grading API and Exam Auto-Calculation injected.');
