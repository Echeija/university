const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `      const { ResultCalculationService } = await import('./src/server/services/ResultCalculationService');
      const courseId = parseInt(req.params.courseId);
      const { students, isSubmit } = req.body; // students array with { studentId, caScore, examScore }, isSubmit boolean
        
      // Get course credit units for QP calculation
      const [course] = await db.select().from(schema.courses).where(eq(schema.courses.id, courseId));
      if (!course) return res.status(404).json({ error: "Course not found" });

      const actorId = (req as any).user.id;
      const targetStatus = isSubmit ? 'submitted' : 'draft';`;

const replacement = `      const { ResultCalculationService } = await import('./src/server/services/ResultCalculationService');
      const courseId = parseInt(req.params.courseId);
      const { students, isSubmit } = req.body; // students array with { studentId, caScore, examScore }, isSubmit boolean
        
      // Get course credit units for QP calculation
      const [course] = await db.select().from(schema.courses).where(eq(schema.courses.id, courseId));
      if (!course) return res.status(404).json({ error: "Course not found" });

      const actorId = (req as any).user.id;
      const actorRole = (req as any).user.role;

      if (actorRole !== 'Administrator') {
          const [allocation] = await db.select()
              .from(schema.courseAllocations)
              .where(
                  and(
                      eq(schema.courseAllocations.courseId, courseId),
                      eq(schema.courseAllocations.lecturerId, actorId)
                  )
              );
          if (!allocation) {
              return res.status(403).json({ error: "Unauthorized: You are not assigned to this course." });
          }
      }

      const targetStatus = isSubmit ? 'submitted' : 'draft';`;

// Using regex or simpler string replacement to avoid spacing issues
const targetRegex = /const \[course\] = await db\.select\(\)\.from\(schema\.courses\)\.where\(eq\(schema\.courses\.id, courseId\)\);\s*if \(!course\) return res\.status\(404\)\.json\({ error: "Course not found" }\);\s*const actorId = \(req as any\)\.user\.id;\s*const targetStatus = isSubmit \? 'submitted' : 'draft';/g;

const replacementString = `const [course] = await db.select().from(schema.courses).where(eq(schema.courses.id, courseId));
      if (!course) return res.status(404).json({ error: "Course not found" });

      const actorId = (req as any).user.id;
      const actorRole = (req as any).user.role;

      if (actorRole !== 'Administrator') {
          const [allocation] = await db.select()
              .from(schema.courseAllocations)
              .where(
                  and(
                      eq(schema.courseAllocations.courseId, courseId),
                      eq(schema.courseAllocations.lecturerId, actorId)
                  )
              );
          if (!allocation) {
              return res.status(403).json({ error: "Unauthorized: You are not assigned to this course." });
          }
      }

      const targetStatus = isSubmit ? 'submitted' : 'draft';`;

if (targetRegex.test(code)) {
    code = code.replace(targetRegex, replacementString);
    fs.writeFileSync('server.ts', code);
    console.log('Patched lecturer results route');
} else {
    console.log('Target not found for lecturer results using regex');
}
