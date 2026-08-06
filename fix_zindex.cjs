const fs = require('fs');
let code = fs.readFileSync('src/components/cms/CMSBlockEditor.tsx', 'utf8');

code = code.replace(/opacity-0 group-hover:opacity-100 transition-opacity z-10/g, 'z-50 shadow-md ring-2 ring-indigo-500/20 opacity-50 group-hover:opacity-100');
fs.writeFileSync('src/components/cms/CMSBlockEditor.tsx', code);
console.log('Fixed edit button visibility');
