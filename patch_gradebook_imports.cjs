const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

const target = `      const { db } = await import('./src/db');`;
const replacement = `      const { db } = await import('./src/db');
      const { eq, and } = await import('drizzle-orm');`;

if (server.includes(target) && !server.substring(server.indexOf(target), server.indexOf(target)+200).includes('const { eq')) {
  server = server.replace(target, replacement);
}

fs.writeFileSync('server.ts', server);
console.log('patched imports');
