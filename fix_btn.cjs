const fs = require('fs');
let code = fs.readFileSync('src/components/cms/CMSBlockEditor.tsx', 'utf8');

code = code.replace(/className="absolute top-2 right-2 p-2 bg-white\/90 dark:bg-slate-800\/90 text-indigo-600 dark:text-indigo-400 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 z-50 shadow-md ring-2 ring-indigo-500\/20 opacity-50 group-hover:opacity-100 hover:bg-indigo-50 dark:hover:bg-indigo-900\/30"/g, 
  'className="absolute top-4 right-4 p-3 bg-indigo-600 text-white rounded-xl shadow-xl z-50 opacity-100 hover:bg-indigo-700 transition-colors flex items-center justify-center cursor-pointer"');
fs.writeFileSync('src/components/cms/CMSBlockEditor.tsx', code);
console.log('Fixed button styling');
