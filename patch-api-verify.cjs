const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `app.get("/api/admin/transcripts/student"`;

const replacement = `app.post("/api/admin/transcripts/generate", requireAuth, requireRole(['Administrator', 'Registrar', 'Admin']), async (req, res) => {
    try {
        const { matricNumber } = req.body;
        if (!matricNumber) {
            return res.status(400).json({ error: 'Matric number is required' });
        }

        const [student] = await db.select().from(schema.users).where(eq(schema.users.username, String(matricNumber)));
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const crypto = require('crypto');
        const verificationCode = crypto.randomBytes(16).toString('hex');
        
        const [transcriptRecord] = await db.insert(schema.transcripts).values({
            studentId: student.id,
            generatedById: (req as any).user.id,
            verificationCode: verificationCode,
            status: 'valid'
        }).returning();

        const transcriptNumber = \`TR-\${new Date().getFullYear()}-\${String(transcriptRecord.id).padStart(5, '0')}\`;

        const [institutionNameSettings] = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, 'institution_name'));
        const [institutionLogoSettings] = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, 'institution_logo'));

        // Fetch all results for the student
        const studentResults = await db.select({
            id: schema.results.id,
            academicSession: schema.results.academicSession,
            semester: schema.results.semester,
            caScore: schema.results.caScore,
            examScore: schema.results.examScore,
            score: schema.results.score,
            grade: schema.results.grade,
            gradePoint: schema.results.gradePoint,
            qualityPoint: schema.results.qualityPoint,
            courseCode: schema.courses.code,
            courseTitle: schema.courses.title,
            courseCredits: schema.courses.credits,
            courseType: schema.courses.type
        })
        .from(schema.results)
        .innerJoin(schema.courses, eq(schema.results.courseId, schema.courses.id))
        .where(
            and(
                eq(schema.results.studentId, student.id),
                eq(schema.results.status, 'published')
            )
        );

        // Fetch semester GPAs
        const semesterGpas = await db.select().from(schema.semesterGpaRecords).where(eq(schema.semesterGpaRecords.studentId, student.id));
        
        // Group results by session and semester
        const groupedResults = {};
        studentResults.forEach(result => {
            const key = \`\${result.academicSession} - \${result.semester}\`;
            if (!groupedResults[key]) {
                const gpaRecord = semesterGpas.find(g => g.academicSession === result.academicSession && g.semester === result.semester);
                groupedResults[key] = {
                    session: result.academicSession,
                    semester: result.semester,
                    gpa: gpaRecord ? gpaRecord.gpa : 0,
                    totalCreditUnits: gpaRecord ? gpaRecord.totalCreditUnits : 0,
                    totalEarnedCredits: gpaRecord ? gpaRecord.totalEarnedCredits : 0,
                    courses: []
                };
            }
            groupedResults[key].courses.push({
                code: result.courseCode,
                title: result.courseTitle,
                credits: result.courseCredits,
                score: result.score,
                grade: result.grade,
                gradePoint: result.gradePoint,
                qualityPoint: result.qualityPoint,
                type: result.courseType
            });
        });

        const sessionsArray = Object.values(groupedResults).sort((a: any, b: any) => {
            if (a.session === b.session) return a.semester.localeCompare(b.semester);
            return a.session.localeCompare(b.session);
        });

        const [cgpaRecord] = await db.select().from(schema.cgpaRecords).where(eq(schema.cgpaRecords.studentId, student.id));

        const responsePayload = {
            metadata: {
                transcriptNumber,
                verificationCode,
                generatedAt: transcriptRecord.createdAt
            },
            institution: {
                name: institutionNameSettings?.value || '',
                logo: institutionLogoSettings?.value || ''
            },
            student: {
                name: student.name,
                matricNumber: student.username,
                programme: student.department || '',
                department: student.department || '',
                faculty: student.faculty || ''
            },
            sessions: sessionsArray,
            summary: {
                totalEarnedCredits: cgpaRecord ? cgpaRecord.totalEarnedCredits : 0,
                totalCreditUnits: cgpaRecord ? cgpaRecord.totalCreditUnits : 0,
                totalQualityPoints: cgpaRecord ? cgpaRecord.totalQualityPoints : 0,
                cgpa: cgpaRecord ? cgpaRecord.cgpa : 0,
                classification: ''
            }
        };
        
        if (cgpaRecord) {
            const { ResultCalculationService } = await import('./src/server/services/ResultCalculationService');
            const settingsRows = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, 'degree_classification_rules'));
            let rules = [];
            if (settingsRows.length > 0) rules = JSON.parse(settingsRows[0].value);
            responsePayload.summary.classification = ResultCalculationService.calculateDegreeClassification(cgpaRecord.cgpa, rules);
        }
        
        res.json(responsePayload);

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to generate transcript' });
    }
});

app.get("/api/public/verify-transcript/:code", async (req, res) => {
    try {
        const { code } = req.params;
        const [transcriptRecord] = await db.select().from(schema.transcripts).where(eq(schema.transcripts.verificationCode, code));
        
        if (!transcriptRecord) {
            return res.status(404).json({ error: 'Invalid or missing verification code' });
        }

        if (transcriptRecord.status !== 'valid') {
            return res.status(400).json({ error: 'This transcript has been revoked' });
        }

        const [student] = await db.select().from(schema.users).where(eq(schema.users.id, transcriptRecord.studentId));
        if (!student) {
            return res.status(404).json({ error: 'Student record not found' });
        }

        const transcriptNumber = \`TR-\${new Date(transcriptRecord.createdAt).getFullYear()}-\${String(transcriptRecord.id).padStart(5, '0')}\`;

        const [cgpaRecord] = await db.select().from(schema.cgpaRecords).where(eq(schema.cgpaRecords.studentId, student.id));
        let classification = '';
        if (cgpaRecord) {
            const { ResultCalculationService } = await import('./src/server/services/ResultCalculationService');
            const settingsRows = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, 'degree_classification_rules'));
            let rules = [];
            if (settingsRows.length > 0) rules = JSON.parse(settingsRows[0].value);
            classification = ResultCalculationService.calculateDegreeClassification(cgpaRecord.cgpa, rules);
        }

        res.json({
            valid: true,
            transcriptNumber,
            generatedAt: transcriptRecord.createdAt,
            student: {
                name: student.name,
                matricNumber: student.username,
                programme: student.department || '',
            },
            summary: {
                cgpa: cgpaRecord ? cgpaRecord.cgpa : 0,
                classification: classification
            }
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Verification failed' });
    }
});

app.get("/api/admin/transcripts/student"`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log('Successfully patched server.ts with verify route');
} else {
    console.log('Target not found in server.ts');
}
