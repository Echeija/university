import { db } from './src/db/index.js';
async function run() {
  const courses = await db.query.courses.findMany();
  console.log(courses);
  process.exit(0);
}
run();
