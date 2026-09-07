const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetRegex = /const \{ name, email, role, password \} = req\.body;\s*const \{ users \} = await import\('\.\/src\/db\/schema'\);\s*const \{ AuditLogger \} = await import\('\.\/src\/services\/AuditLogger'\);/g;

const replacementString = `const { name, email, role, password } = req.body;
      const { users } = await import('./src/db/schema');
      const { AuditLogger } = await import('./src/services/AuditLogger');
      
      const actorRole = (req as any).user.role;
      if (actorRole !== 'Administrator' && role === 'Administrator') {
          return res.status(403).json({ error: "Unauthorized: Cannot create Administrator" });
      }`;

if (targetRegex.test(code)) {
    code = code.replace(targetRegex, replacementString);
    fs.writeFileSync('server.ts', code);
    console.log('Patched role escalation in create using regex');
} else {
    console.log('Target not found for role escalation create using regex');
}
