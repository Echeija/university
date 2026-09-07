const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `      if (action !== 'publish') {
        return res.status(400).json({ error: "Invalid action" });
      }

      // Publish
      await db.update(schema.results)
        .set({ status: 'published' as any, approvedByRegistrarId: actorId })
        .where(inArray(schema.results.id, resultIds));
      await logAction('Result Published');`;

const replacement = `      if (action === 'revoke') {
        await db.update(schema.results)
          .set({ status: 'registrar_approved' as any }) // Revert to approved, unpublished state
          .where(inArray(schema.results.id, resultIds));
        await logAction('Result Revoked');
        
        const publishedResults = await db.select({
            studentId: schema.results.studentId,
        }).from(schema.results).where(inArray(schema.results.id, resultIds));
        const uniqueStudents = Array.from(new Set(publishedResults.map(r => r.studentId)));
        for (const studentId of uniqueStudents) {
            await ResultCalculationService.updateStudentGPAAndCGPA(studentId);
        }
        
        return res.json({ message: 'Results revoked successfully' });
      }

      if (action !== 'publish') {
        return res.status(400).json({ error: "Invalid action" });
      }

      // Publish
      await db.update(schema.results)
        .set({ status: 'published' as any, approvedByRegistrarId: actorId })
        .where(inArray(schema.results.id, resultIds));
      await logAction('Result Published');`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log('Successfully patched registrar actions with revoke');
} else {
    console.log('Target not found in server.ts');
}
