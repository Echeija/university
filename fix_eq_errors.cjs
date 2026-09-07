const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// The issue is `const { eq, and } = await import('drizzle-orm');` was injected too many times or conflicts with existing ones.
// We can use a regex to fix blocks where it's declared twice in a row, or remove the one we injected earlier on one line.
content = content.replace(/const { db } = await import\('\.\/src\/db'\); const { eq, and } = await import\('drizzle-orm'\);/g, "const { db } = await import('./src/db');");

fs.writeFileSync('server.ts', content);
console.log('fixed eq/and redeclarations');
