import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './src/db/index.js';
import pkg from 'pg';

async function run() {
  console.log("Migrating");
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log("Done");
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
