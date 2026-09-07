const fs = require('fs');
let seed = fs.readFileSync('src/db/seed.ts', 'utf8');

seed = seed.replace(/cgpaRecords } from '.\/schema';/, "cgpaRecords, courseAllocations } from './schema';");

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
    } catch (e) {
      console.log('Allocations already exist or failed');
    }
  }

  console.log('Database seeded successfully!');
};

seed()
`;

seed = seed.replace(`  console.log('Database seeded successfully!');\n};\n\nseed()`, newSeedLogic);

// Sometimes seed ends differently. Let's do a safer replace.
seed = seed.replace(/console\.log\('Database seeded successfully!'\);\s*};\s*seed\(\)\s*\.catch.*$/s, newSeedLogic + `\n  .catch((e) => {\n    console.error(e);\n    process.exit(1);\n  });\n`);

fs.writeFileSync('src/db/seed.ts', seed);
console.log('Seed patched');
