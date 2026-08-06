import * as fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

const target1 = `const { facilities } = await import('./src/db/schema.js');`;
const replacement1 = `const { facilities } = await import('./src/db/schema.js');
      const { db } = await import('./src/db/index.js');`;

const target2 = `const { facilityBookings } = await import('./src/db/schema.js');`;
const replacement2 = `const { facilityBookings } = await import('./src/db/schema.js');
      const { db } = await import('./src/db/index.js');`;

const target3 = `const { facilityBookings, facilities } = await import('./src/db/schema.js');`;
const replacement3 = `const { facilityBookings, facilities } = await import('./src/db/schema.js');
      const { db } = await import('./src/db/index.js');`;

// The target2 appears multiple times, so using regex to replace globally might be tricky.
// We can just use String.prototype.replace globally for all the specific schema imports.
content = content.replace(/const \{ facilities \} = await import\('\.\/src\/db\/schema\.js'\);/g, replacement1);
content = content.replace(/const \{ facilityBookings \} = await import\('\.\/src\/db\/schema\.js'\);/g, replacement2);
content = content.replace(/const \{ facilityBookings, facilities \} = await import\('\.\/src\/db\/schema\.js'\);/g, replacement3);

fs.writeFileSync('server.ts', content);
console.log('Fixed server.ts db imports');
