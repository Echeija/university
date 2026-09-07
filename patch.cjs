const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `      if (action === 'return') {
        await db.update(schema.results)
          .set({ status: 'returned' as any, returnReason: reason })
          .where(inArray(schema.results.id, resultIds));
        return res.json({ message: 'Results returned to Lecturer' });
      }

      // Publish
      await db.update(schema.results)
        .set({ status: 'published' as any, approvedByRegistrarId: actorId })
        .where(inArray(schema.results.id, resultIds));`;

const replacement = `      if (action === 'return') {
        await db.update(schema.results)
          .set({ status: 'returned' as any, returnReason: reason })
          .where(inArray(schema.results.id, resultIds));
        return res.json({ message: 'Results returned to Lecturer' });
      }
      
      if (action === 'approve') {
        await db.update(schema.results)
          .set({ status: 'registrar_approved' as any, approvedByRegistrarId: actorId })
          .where(inArray(schema.results.id, resultIds));
        return res.json({ message: 'Results approved successfully.' });
      }

      if (action === 'lock') {
        await db.update(schema.results)
          .set({ status: 'locked' as any })
          .where(inArray(schema.results.id, resultIds));
        return res.json({ message: 'Results locked successfully.' });
      }

      if (action !== 'publish') {
        return res.status(400).json({ error: "Invalid action" });
      }

      // Publish
      await db.update(schema.results)
        .set({ status: 'published' as any, approvedByRegistrarId: actorId })
        .where(inArray(schema.results.id, resultIds));`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log('Patched server.ts');
} else {
    console.log('Target not found in server.ts');
}
