const fs = require('fs');
let code = fs.readFileSync('src/components/cms/AdminCMSPanel.tsx', 'utf8');

code = code.replace(
  /<button \n                onClick=\{handleAddNew\}\n                className="flex items-center gap-2 px-3 py-1\.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"\n              >\n                <Plus className="w-4 h-4" \/> Add New Item\n                <\/button>\}/,
  `{canEdit && <button 
                onClick={handleAddNew}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add New Item
              </button>}`
);

fs.writeFileSync('src/components/cms/AdminCMSPanel.tsx', code);
console.log('Fixed Add New');
