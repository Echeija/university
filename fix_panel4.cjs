const fs = require('fs');
let code = fs.readFileSync('src/components/cms/AdminCMSPanel.tsx', 'utf8');

code = code.replace(
  /<button \n                        onClick=\{handleAddNew\}\n                        className="mt-4 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"\n                      >\n                        Create your first item\n                    <\/button>\}/,
  `{canEdit && <button 
                        onClick={handleAddNew}
                        className="mt-4 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        Create your first item
                      </button>}`
);

fs.writeFileSync('src/components/cms/AdminCMSPanel.tsx', code);
console.log('Fixed Create first item');
