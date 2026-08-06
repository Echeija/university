import { db } from './src/db/index.js';
import { facilities } from './src/db/schema.js';

async function main() {
  await db.insert(facilities).values([
    { name: 'Advanced Physics Lab', type: 'Laboratory', capacity: 30, location: 'Science Block A' },
    { name: 'Biotech Lab', type: 'Laboratory', capacity: 25, location: 'Science Block B' },
    { name: 'Main Library Study Room 1', type: 'Library', capacity: 8, location: 'Library Ground Floor' },
    { name: 'Main Library Study Room 2', type: 'Library', capacity: 6, location: 'Library First Floor' },
    { name: 'Indoor Basketball Court', type: 'Sports', capacity: 50, location: 'Sports Complex' },
    { name: 'Tennis Court 1', type: 'Sports', capacity: 4, location: 'Outdoor Sports Area' },
    { name: 'Computer Lab 3', type: 'Laboratory', capacity: 40, location: 'ICT Center' },
  ]).onConflictDoNothing();
  console.log("Seeded facilities!");
  process.exit(0);
}
main().catch(console.error);
