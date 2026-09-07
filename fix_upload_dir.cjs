const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

const oldCode = `const receiptsDir = path.join(process.cwd(), 'uploads', 'receipts');`;
const newCode = `const receiptsDir = path.join(uploadDir, 'receipts');`;

if (server.includes(oldCode)) {
  server = server.replace(oldCode, newCode);
  fs.writeFileSync('server.ts', server);
  console.log('Fixed receiptsDir path.');
} else {
  console.log('Could not find oldCode');
}
