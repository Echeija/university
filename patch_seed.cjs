const fs = require('fs');
let content = fs.readFileSync('src/db/seed.ts', 'utf8');

const seedSessions = `
  console.log('Seeding development data...');
  
  // 0. Academic Sessions & Semesters
  const sessionRes = await db.insert(schema.academicSessions).values([
    { name: '2023/2024', isActive: false, isAdmissionActive: false },
    { name: '2024/2025', isActive: true, isAdmissionActive: true }
  ]).returning();
  
  const oldSessionId = sessionRes[0].id;
  const newSessionId = sessionRes[1].id;
  
  await db.insert(schema.semesters).values([
    { sessionId: oldSessionId, name: 'First', isActive: false },
    { sessionId: oldSessionId, name: 'Second', isActive: false },
    { sessionId: newSessionId, name: 'First', isActive: true },
    { sessionId: newSessionId, name: 'Second', isActive: false }
  ]);
`;

content = content.replace(/console\.log\('Seeding development data\.\.\.'\);/, seedSessions);

fs.writeFileSync('src/db/seed.ts', content);
