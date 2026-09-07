const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// There are a lot of missing db, schema, eq, and imports.
// Let's just add them globally at the top of server.ts instead of dynamically importing them inside every route!
// This will fix ALL the issues!

const globalImports = `import { db } from './src/db/index.js';
import * as schema from './src/db/schema.js';
import { eq, and, desc, inArray, sql } from 'drizzle-orm';
`;

// But wait, server.ts already imports express. We can just add these at the top.
if (!content.includes("import { db } from './src/db/index.js';")) {
    content = content.replace('import express from "express";', globalImports + 'import express from "express";');
}

// Now we need to remove the dynamic imports that might be redeclaring things.
content = content.replace(/const \{ db \} = await import\('\.\/src\/db'\);/g, '');
content = content.replace(/const \{ db \} = await import\('\.\.\/\.\.\/db'\);/g, '');
content = content.replace(/const \{ eq, and \} = await import\('drizzle-orm'\);/g, '');
content = content.replace(/const \{ eq \} = await import\('drizzle-orm'\);/g, '');
content = content.replace(/const \{ eq, inArray \} = await import\('drizzle-orm'\);/g, '');
content = content.replace(/const \{ eq, and, sql \} = await import\('drizzle-orm'\);/g, '');
content = content.replace(/const \{ eq, desc \} = await import\('drizzle-orm'\);/g, '');
content = content.replace(/const schema = await import\('\.\/src\/db\/schema'\);/g, '');
content = content.replace(/const schema = await import\('\.\.\/\.\.\/db\/schema'\);/g, '');

fs.writeFileSync('server.ts', content);
console.log('Fixed server.ts imports globally!');
