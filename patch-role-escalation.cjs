const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `const updateData: any = { name, email, role };
      if (password) updateData.password = password;`;

const replacement = `const actorRole = (req as any).user.role;
      // Prevent role escalation
      let finalRole = role;
      if (actorRole !== 'Administrator' && role === 'Administrator') {
          return res.status(403).json({ error: "Unauthorized: Cannot escalate to Administrator" });
      }
      
      const updateData: any = { name, email, role: finalRole };
      if (password) updateData.password = password;`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log('Patched role escalation in update');
} else {
    console.log('Target not found for role escalation update');
}

const target2 = `const { users } = await import('./src/db/schema');
      
      // Ensure unique email
      const existingUser = await db.select().from(users).where(eq(users.email, email));`;

const replacement2 = `const { users } = await import('./src/db/schema');
      
      const actorRole = (req as any).user.role;
      if (actorRole !== 'Administrator' && role === 'Administrator') {
          return res.status(403).json({ error: "Unauthorized: Cannot create Administrator" });
      }

      // Ensure unique email
      const existingUser = await db.select().from(users).where(eq(users.email, email));`;

if (code.includes(target2)) {
    code = code.replace(target2, replacement2);
    fs.writeFileSync('server.ts', code);
    console.log('Patched role escalation in create');
} else {
    console.log('Target not found for role escalation create');
}
