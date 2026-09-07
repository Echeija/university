import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const studentGenerateRoute = `
  app.post("/api/student/transcripts/generate", requireAuth, requireRole(['Student']), async (req, res) => {
    try {
        const studentId = (req as any).user.id;
        const crypto = require('crypto');
        const verificationCode = crypto.randomBytes(16).toString('hex');
        
        const [transcriptRecord] = await db.insert(schema.transcripts).values({
            studentId: studentId,
            generatedById: studentId,
            verificationCode: verificationCode,
            status: 'valid'
        }).returning();

        res.json({ verificationCode });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to register transcript for verification' });
    }
  });
`;

content = content.replace(
  /app\.get\("\/api\/public\/verify-transcript\/:code"/,
  studentGenerateRoute + '\napp.get("/api/public/verify-transcript/:code"'
);

fs.writeFileSync('server.ts', content);
