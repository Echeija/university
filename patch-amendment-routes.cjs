const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `app.use('/uploads', express.static(uploadDir));`;

const replacement = `// Result Amendment Request (Lecturer/HOD)
  app.post("/api/results/:id/amend/request", requireAuth, requireRole(['Lecturer', 'HOD', 'Administrator']), async (req, res) => {
    try {
        const resultId = parseInt(req.params.id);
        const { newCa, newExam, reason } = req.body;
        
        const [existingResult] = await db.select().from(schema.results).where(eq(schema.results.id, resultId));
        if (!existingResult) return res.status(404).json({ error: "Result not found" });

        // Create amendment record
        await db.insert(schema.resultAmendments).values({
            resultId: resultId,
            requestedById: (req as any).user.id,
            oldCa: existingResult.caScore,
            newCa: newCa,
            oldExam: existingResult.examScore,
            newExam: newExam,
            reason: reason,
            status: 'pending'
        });

        res.json({ message: "Amendment request submitted" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to submit request" });
    }
  });

  // Result Amendment Approval (Registrar/Admin)
  app.post("/api/admin/amendments/:id/approve", requireAuth, requireRole(['Registrar', 'Administrator']), async (req, res) => {
    try {
        const amendmentId = parseInt(req.params.id);
        const { action } = req.body; // 'approve' or 'reject'
        
        const [amendment] = await db.select().from(schema.resultAmendments).where(eq(schema.resultAmendments.id, amendmentId));
        if (!amendment) return res.status(404).json({ error: "Amendment not found" });

        if (action === 'reject') {
            await db.update(schema.resultAmendments).set({ status: 'rejected', approvedById: (req as any).user.id }).where(eq(schema.resultAmendments.id, amendmentId));
            return res.json({ message: "Amendment rejected" });
        }

        if (action === 'approve') {
            const { ResultCalculationService } = await import('./src/server/services/ResultCalculationService');
            
            // Get course
            const [result] = await db.select().from(schema.results).where(eq(schema.results.id, amendment.resultId));
            const [course] = await db.select().from(schema.courses).where(eq(schema.courses.id, result.courseId));
            
            const totalScore = ResultCalculationService.calculateTotalScore(amendment.newCa, amendment.newExam);
            const { grade, gradePoint, isPass } = await ResultCalculationService.calculateGradeFromDB(totalScore);
            const qualityPoint = ResultCalculationService.calculateQualityPoint(course.credits, gradePoint);

            // Update result
            await db.update(schema.results).set({
                caScore: amendment.newCa,
                examScore: amendment.newExam,
                score: totalScore,
                grade: grade,
                gradePoint: gradePoint,
                qualityPoint: qualityPoint
            }).where(eq(schema.results.id, amendment.resultId));

            // Mark amendment as approved
            await db.update(schema.resultAmendments).set({ status: 'approved', approvedById: (req as any).user.id }).where(eq(schema.resultAmendments.id, amendmentId));

            // Audit
            await db.insert(schema.resultAuditLogs).values({
                userId: (req as any).user.id,
                role: (req as any).user.role,
                studentId: result.studentId,
                courseId: result.courseId,
                action: 'Amendment Approved',
                reason: amendment.reason,
                oldCa: amendment.oldCa,
                newCa: amendment.newCa,
                oldExam: amendment.oldExam,
                newExam: amendment.newExam,
                oldGrade: result.grade,
                newGrade: grade,
                ipAddress: req.ip || req.headers['x-forwarded-for']?.toString()
            });

            // *CRITICAL STEP: RECALCULATE CGPA*
            if (result.status === 'published' || result.status === 'locked') {
                await ResultCalculationService.updateStudentGPAAndCGPA(result.studentId);
            }

            return res.json({ message: "Amendment approved and result updated" });
        }
        
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to process amendment" });
    }
  });

  app.use('/uploads', express.static(uploadDir));`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log('Successfully patched amendment routes');
} else {
    console.log('Target not found in server.ts');
}
