const fs = require('fs');
let code = fs.readFileSync('src/components/cms/AdminCMSPanel.tsx', 'utf8');

code = code.replace(
  /<button\n                            onClick=\{\(\) => handleEdit\(item\)\}\n                            className="absolute top-2 right-2 p-2 bg-white\/90 dark:bg-slate-800\/90 text-indigo-600 dark:text-indigo-400 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-indigo-50 dark:hover:bg-indigo-900\/30"\n                            title="Edit Content"\n                          >\n                            <Edit className="w-4 h-4" \/>\n                                <\/button>\}/,
  `{canEdit && <button 
                            onClick={() => handleEdit(item)}
                            className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-slate-800/90 text-indigo-600 dark:text-indigo-400 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                            title="Edit Content"
                          >
                            <Edit className="w-4 h-4" />
                          </button>}`
);

fs.writeFileSync('src/components/cms/AdminCMSPanel.tsx', code);
console.log('Fixed Edit button');
