import { db } from './src/db/index.js';
import { courseAllocations } from './src/db/schema.js';
async function run() {
  const allocs = await db.select().from(courseAllocations);
  console.log(allocs);
  process.exit(0);
}
run();
