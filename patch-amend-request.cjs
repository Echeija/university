const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetRegex = /const \[existingResult\] = await db\.select\(\)\.from\(schema\.results\)\.where\(eq\(schema\.results\.id, resultId\)\);\s*if \(!existingResult\) return res\.status\(404\)\.json\({ error: "Result not found" }\);/g;

const replacementString = `const [existingResult] = await db.select().from(schema.results).where(eq(schema.results.id, resultId));
        if (!existingResult) return res.status(404).json({ error: "Result not found" });

        const actorRole = (req as any).user.role;
        const actorId = (req as any).user.id;
        const actorDepartment = (req as any).user.department;

        if (actorRole !== 'Administrator') {
            if (actorRole === 'Lecturer') {
                const [allocation] = await db.select().from(schema.courseAllocations).where(
                    and(eq(schema.courseAllocations.courseId, existingResult.courseId), eq(schema.courseAllocations.lecturerId, actorId))
                );
                if (!allocation) return res.status(403).json({ error: "Unauthorized: You are not assigned to this course." });
            } else if (actorRole === 'HOD') {
                const [course] = await db.select({ departmentName: schema.departments.name })
                    .from(schema.courses)
                    .leftJoin(schema.departments, eq(schema.courses.departmentId, schema.departments.id))
                    .where(eq(schema.courses.id, existingResult.courseId));
                if (!course || course.departmentName !== actorDepartment) {
                    return res.status(403).json({ error: "Unauthorized: Course not in your department." });
                }
            }
        }`;

if (targetRegex.test(code)) {
    code = code.replace(targetRegex, replacementString);
    fs.writeFileSync('server.ts', code);
    console.log('Patched amend request route');
} else {
    console.log('Target not found for amend request route using regex');
}
