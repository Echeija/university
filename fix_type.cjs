const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace('status: targetStatus,', 'status: targetStatus as any,');
server = server.replace('score: totalScore // backwards compatibility', '');
server = server.replace('status: newStatus, returnReason: reason, approvedByHodId: actorId', 'status: newStatus as any, returnReason: reason, approvedByHodId: actorId');
// Registrar publish:
server = server.replace('status: \'returned\', returnReason: reason', 'status: \'returned\' as any, returnReason: reason');
server = server.replace('status: \'published\', approvedByRegistrarId: actorId', 'status: \'published\' as any, approvedByRegistrarId: actorId');

// Fix remaining missing schema
let missingRoutes = [
  '/api/lecturer/courses/allocations',
  '/api/lecturer/courses/:courseId/students',
  '/api/lecturer/courses/:courseId'
];

for (const route of missingRoutes) {
  const routeStart = server.indexOf(`app.get("${route}"`) > -1 
    ? server.indexOf(`app.get("${route}"`) 
    : server.indexOf(`app.post("${route}"`);
    
  if (routeStart > -1) {
    const tryIdx = server.indexOf('try {', routeStart);
    if (tryIdx > -1) {
      const injectString = `\n      const schema = await import('./src/db/schema');\n      const { db } = await import('./src/db');\n`;
      const block = server.substring(tryIdx, tryIdx + 200);
      if (!block.includes('const schema =')) {
        server = server.substring(0, tryIdx + 5) + injectString + server.substring(tryIdx + 5);
      }
    }
  }
}

fs.writeFileSync('server.ts', server);
console.log('Fixed types');
