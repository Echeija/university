const fs = require('fs');
let code = fs.readFileSync('src/server/services/ResultCalculationService.ts', 'utf8');

const target = `    // Update semester records
    for (const [key, data] of Object.entries(semesterData)) {`;

const replacement = `    // Update semester records
    const activeSemesterKeys = Object.keys(semesterData);
    const existingSemesters = await db.select().from(semesterGpaRecords).where(eq(semesterGpaRecords.studentId, studentId));
    
    // Remove semesters that no longer have any published results
    for (const record of existingSemesters) {
        const key = \`\${record.academicSession}|\${record.semester}\`;
        if (!activeSemesterKeys.includes(key)) {
            await db.delete(semesterGpaRecords).where(eq(semesterGpaRecords.id, record.id));
        }
    }

    for (const [key, data] of Object.entries(semesterData)) {`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/server/services/ResultCalculationService.ts', code);
    console.log('Fixed GPA deletion bug');
} else {
    console.log('Target not found');
}
