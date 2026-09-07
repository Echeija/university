const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

// A function to inject `const schema = await import('./src/db/schema');` and `const { db } = await import('./src/db');`
// after `try {` in routes that use `schema.` but don't define it.

const routesToFix = [
  '/api/hod/results/pending',
  '/api/hod/results/course/:courseId',
  '/api/hod/results/approve',
  '/api/registrar/results/pending',
  '/api/registrar/results/publish'
];

for (const route of routesToFix) {
  const routeStart = server.indexOf(`app.get("${route}"`) > -1 
    ? server.indexOf(`app.get("${route}"`) 
    : server.indexOf(`app.post("${route}"`);
    
  if (routeStart > -1) {
    const tryIdx = server.indexOf('try {', routeStart);
    if (tryIdx > -1) {
      const injectString = `\n      const schema = await import('./src/db/schema');\n      const { db } = await import('./src/db');\n`;
      // Check if already injected
      const block = server.substring(tryIdx, tryIdx + 200);
      if (!block.includes('const schema =')) {
        server = server.substring(0, tryIdx + 5) + injectString + server.substring(tryIdx + 5);
      }
    }
  }
}

// Fix lecturer routes that were added as well
const lecturerRoutes = [
  '/api/lecturer/courses/:courseId/students-results',
  '/api/lecturer/courses/:courseId/results'
];

for (const route of lecturerRoutes) {
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

// Fix grading rules route
const gradingRoute = '/api/grading-rules';
const gRouteStart = server.indexOf(`app.get("${gradingRoute}"`);
if (gRouteStart > -1) {
  const tryIdx = server.indexOf('try {', gRouteStart);
  if (tryIdx > -1) {
    const injectString = `\n      const schema = await import('./src/db/schema');\n      const { db } = await import('./src/db');\n`;
    const block = server.substring(tryIdx, tryIdx + 200);
    if (!block.includes('const schema =')) {
      server = server.substring(0, tryIdx + 5) + injectString + server.substring(tryIdx + 5);
    }
  }
}

fs.writeFileSync('server.ts', server);
console.log('Fixed schema and db imports in server.ts');
