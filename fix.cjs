const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = 'import { eq, desc } from \'drizzle-orm\';\n' + code;
fs.writeFileSync('server.ts', code);
