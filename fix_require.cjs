const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Add import if not exists
if (!code.includes("import crypto from 'crypto';")) {
  code = "import crypto from 'crypto';\n" + code;
}

// Remove inline require
code = code.replace(/const crypto = require\('crypto'\);/g, '');

fs.writeFileSync('server.ts', code);
console.log("Fixed require in server.ts");
