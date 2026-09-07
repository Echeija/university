async function run() {
  const { db } = await import('./src/db/index.js');
  const schema = await import('./src/db/schema.js');
  
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
  
  console.log("Seeded sessions and semesters");
}
run();
