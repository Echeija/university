const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const apiBlock = `
  app.get("/api/admin/academic-settings", requireAuth, requireRole(['Administrator', 'Registrar', 'Admin']), async (req, res) => {
    try {
        const gradingRulesData = await db.select().from(schema.gradingRules);
        const settings = await db.select().from(schema.systemSettings);
        
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        res.json({
            gradingRules: gradingRulesData,
            caMax: settingsMap['ca_max'] || '30',
            examMax: settingsMap['exam_max'] || '70',
            degreeClassification: settingsMap['degree_classification_rules'] ? JSON.parse(settingsMap['degree_classification_rules']) : [],
            academicStanding: settingsMap['academic_standing_rules'] ? JSON.parse(settingsMap['academic_standing_rules']) : [],
            repeatCoursePolicy: settingsMap['repeat_course_policy'] || 'Best Attempt Counts',
            gpaDecimalPlaces: settingsMap['gpa_decimal_places'] || '2',
            cgpaDecimalPlaces: settingsMap['cgpa_decimal_places'] || '2',
            resultApprovalWorkflow: settingsMap['result_approval_workflow'] || 'HOD -> Registrar',
            transcriptSettings: settingsMap['transcript_settings'] ? JSON.parse(settingsMap['transcript_settings']) : { registrarName: '', registrarSignature: '', customNotes: '' },
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to get academic settings' });
    }
  });

  app.put("/api/admin/academic-settings", requireAuth, requireRole(['Administrator', 'Registrar', 'Admin']), async (req, res) => {
    try {
        const { 
            gradingRules, caMax, examMax, degreeClassification, academicStanding, 
            repeatCoursePolicy, gpaDecimalPlaces, cgpaDecimalPlaces, 
            resultApprovalWorkflow, transcriptSettings 
        } = req.body;
        
        // 1. Update Grading Rules
        if (gradingRules && Array.isArray(gradingRules)) {
            await db.delete(schema.gradingRules);
            if (gradingRules.length > 0) {
                // Ensure no IDs are passed to insert
                const toInsert = gradingRules.map(r => ({
                    minScore: Number(r.minScore),
                    maxScore: Number(r.maxScore),
                    grade: String(r.grade),
                    gradePoint: Number(r.gradePoint),
                    description: String(r.description),
                    isPass: Boolean(r.isPass)
                }));
                await db.insert(schema.gradingRules).values(toInsert);
            }
        }
        
        // 2. Update System Settings
        const updateSetting = async (key: string, value: string) => {
            const [existing] = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, key));
            if (existing) {
                await db.update(schema.systemSettings).set({ value }).where(eq(schema.systemSettings.key, key));
            } else {
                await db.insert(schema.systemSettings).values({ key, value });
            }
        };

        if (caMax !== undefined) await updateSetting('ca_max', caMax.toString());
        if (examMax !== undefined) await updateSetting('exam_max', examMax.toString());
        if (degreeClassification) await updateSetting('degree_classification_rules', JSON.stringify(degreeClassification));
        if (academicStanding) await updateSetting('academic_standing_rules', JSON.stringify(academicStanding));
        if (repeatCoursePolicy) await updateSetting('repeat_course_policy', repeatCoursePolicy);
        if (gpaDecimalPlaces !== undefined) await updateSetting('gpa_decimal_places', gpaDecimalPlaces.toString());
        if (cgpaDecimalPlaces !== undefined) await updateSetting('cgpa_decimal_places', cgpaDecimalPlaces.toString());
        if (resultApprovalWorkflow) await updateSetting('result_approval_workflow', resultApprovalWorkflow);
        if (transcriptSettings) await updateSetting('transcript_settings', JSON.stringify(transcriptSettings));

        // Let's trigger a background recalculation of CGPA if standing or policy changed
        if (academicStanding || repeatCoursePolicy) {
             const studentsWithResults = await db.select({ studentId: schema.results.studentId }).from(schema.results).where(eq(schema.results.status, 'published')).groupBy(schema.results.studentId);
             const { ResultCalculationService } = await import('./src/server/services/ResultCalculationService');
             for (const record of studentsWithResults) {
                 await ResultCalculationService.updateStudentGPAAndCGPA(record.studentId);
             }
        }

        res.json({ message: 'Academic settings updated successfully' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update academic settings' });
    }
  });
`;

if (!code.includes('/api/admin/academic-settings')) {
    code = code.replace(/app\.get\("\/api\/admin\/settings\/academic_standing"/, apiBlock + '\n\n  app.get("/api/admin/settings/academic_standing"');
    fs.writeFileSync('server.ts', code);
    console.log('Added /api/admin/academic-settings');
} else {
    console.log('Already exists');
}
