async function run() {
  const { db } = await import('./src/db/index.js');
  const schema = await import('./src/db/schema.js');
  const { eq } = await import('drizzle-orm');
  await db.update(schema.courseAllocations).set({ academicYear: '2024/2025' });
  console.log("Updated allocations!");
}
run();
