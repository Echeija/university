const fs = require('fs');
let code = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');
console.log(code.includes('import CMSBlockEditor'));
