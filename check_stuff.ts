import { db } from './src/db/index.js';
async function run() {
  const csc101 = await db.query.courses.findFirst({ where: (c, { eq }) => eq(c.code, 'CSC101') });
  const lec = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, 'lecturer@smartglobal.edu.ng') });
  console.log("CSC101:", csc101);
  console.log("Lec:", lec);
  process.exit(0);
}
run();
