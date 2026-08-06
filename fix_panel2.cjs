const fs = require('fs');
let code = fs.readFileSync('src/components/cms/AdminCMSPanel.tsx', 'utf8');

code = code.replace(
  /<button \n                              onClick=\{\(e\) => \{ e\.stopPropagation\(\); handleDelete\(item\.id\); \}\}\n                              className="p-1\.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900\/30 transition-colors"\n                            >\n                              <Trash2 className="w-4 h-4" \/>\n                                <\/button>\}/,
  `{canEdit && <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                              className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>}`
);

fs.writeFileSync('src/components/cms/AdminCMSPanel.tsx', code);
console.log('Fixed Trash2');
