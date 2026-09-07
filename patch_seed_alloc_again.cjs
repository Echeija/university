const fs = require('fs');
let seed = fs.readFileSync('src/db/seed.ts', 'utf8');

const newSeedLogic = `
  const lecturer = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, 'lecturer@smartglobal.edu.ng')
  });

  if (lecturer && csc101 && csc102) {
    try {
      await db.insert(courseAllocations).values([
        { courseId: csc101.id, lecturerId: lecturer.id, academicYear: '2025/2026', semester: '1st' },
        { courseId: csc102.id, lecturerId: lecturer.id, academicYear: '2025/2026', semester: '1st' }
      ]);
      console.log('Allocated courses to lecturer.');
    } catch (e) {
      console.log('Allocations already exist or failed');
    }
  }

  console.log('Seeding complete!');
}
seed().catch((e) => { if (e.message !== "Failed to fetch") console.error(e) });
`;

seed = seed.replace(/console\.log\('Seeding complete!'\);\s*}\s*seed\(\)\.catch\(\(e\) => { if \(e\.message !== "Failed to fetch"\) console\.error\(e\) }\);/s, newSeedLogic);

fs.writeFileSync('src/db/seed.ts', seed);
console.log('Seed patched properly');
