const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const getRoute = `
  app.get("/api/admin/amendments", requireAuth, requireRole(['Registrar', 'Administrator', 'HOD', 'Lecturer']), async (req, res) => {
    try {
        const { resultAmendments, results, courses, users } = await import('./src/db/schema');
        const { desc, eq } = await import('drizzle-orm');
        
        let query = db.select({
            id: resultAmendments.id,
            oldCa: resultAmendments.oldCa,
            newCa: resultAmendments.newCa,
            oldExam: resultAmendments.oldExam,
            newExam: resultAmendments.newExam,
            reason: resultAmendments.reason,
            status: resultAmendments.status,
            createdAt: resultAmendments.createdAt,
            requestedBy: {
                id: users.id,
                name: users.name,
                email: users.email
            },
            course: {
                code: courses.code,
                title: courses.title
            }
        }).from(resultAmendments)
        .leftJoin(results, eq(resultAmendments.resultId, results.id))
        .leftJoin(courses, eq(results.courseId, courses.id))
        .leftJoin(users, eq(resultAmendments.requestedById, users.id))
        .orderBy(desc(resultAmendments.createdAt));

        const data = await query;
        res.json(data);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch amendments" });
    }
  });
`;

code = code.replace(
  /app\.post\("\/api\/admin\/amendments\/:id\/approve"/,
  getRoute + '\n  app.post("/api/admin/amendments/:id/approve"'
);

fs.writeFileSync('server.ts', code);
