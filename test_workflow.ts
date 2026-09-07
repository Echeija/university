import { db } from './src/db/index.js';
import { results } from './src/db/schema.js';
import { inArray } from 'drizzle-orm';

async function run() {
  const allResults = await db.select().from(results);
  console.log('Results before:', allResults.map(r => ({id: r.id, status: r.status, score: r.score})));
  
  if (allResults.length > 0) {
    // 1. Submit results (Lecturer -> HOD)
    await db.update(results).set({status: 'submitted'}).where(inArray(results.id, allResults.map(r => r.id)));
    
    // 2. Approve results (HOD -> Registrar)
    // The UI hits: /api/hod/results/approve 
    
    // Let's just simulate what the Registrar does to see if it works
    const res = await fetch('http://localhost:3000/api/registrar/results/publish', {
       method: 'POST',
       // We'll skip the actual fetch since auth is hard to bypass here, we'll just test by verifying code.
    });
  }
  process.exit(0);
}
run();
