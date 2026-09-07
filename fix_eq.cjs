const fs = require('fs');
const file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

// Replace in each assignment route
const replacements = [
  {
    search: `const courseId = parseInt(req.params.courseId);\n      const courseAssignments = await db.select().from(schema.assignments).where(eq(schema.assignments.courseId, courseId));`,
    replace: `const { eq } = await import('drizzle-orm');\n      const courseId = parseInt(req.params.courseId);\n      const courseAssignments = await db.select().from(schema.assignments).where(eq(schema.assignments.courseId, courseId));`
  },
  {
    search: `const assignmentId = parseInt(req.params.assignmentId);\n      const submissions = await db.select(`,
    replace: `const { eq } = await import('drizzle-orm');\n      const assignmentId = parseInt(req.params.assignmentId);\n      const submissions = await db.select(`
  },
  {
    search: `const submissionId = parseInt(req.params.submissionId);\n      const { marksAwarded, feedback } = req.body;`,
    replace: `const { eq } = await import('drizzle-orm');\n      const submissionId = parseInt(req.params.submissionId);\n      const { marksAwarded, feedback } = req.body;`
  },
  {
    search: `const submissions = await db.select({\n        submission: schema.assignmentSubmissions,`,
    replace: `const { eq } = await import('drizzle-orm');\n      const submissions = await db.select({\n        submission: schema.assignmentSubmissions,`
  }
];

replacements.forEach(({ search, replace }) => {
  code = code.replace(search, replace);
});

fs.writeFileSync(file, code);
