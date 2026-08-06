const fs = require('fs');
let code = fs.readFileSync('src/components/cms/AdminCMSPanel.tsx', 'utf8');

const importStatement = `import { Link } from 'react-router-dom';\n`;
if (!code.includes('import { Link }')) {
    code = code.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\n" + importStatement);
}

const oldHeader = `            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="font-bold text-slate-800 dark:text-slate-200">
                Manage: {activeTab}
              </h2>
              <button 
                onClick={handleAddNew}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add New Item
              </button>
            </div>`;

const newHeader = `            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                Manage: {activeTab}
                {['Home', 'About', 'Admissions'].includes(activeTab) && (
                  <Link 
                    to={activeTab === 'Home' ? '/' : \`/\${activeTab.toLowerCase()}\`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded text-xs font-bold transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    Live Page Editor
                  </Link>
                )}
              </h2>
              <button 
                onClick={handleAddNew}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add New Item
              </button>
            </div>`;

code = code.replace(oldHeader, newHeader);
fs.writeFileSync('src/components/cms/AdminCMSPanel.tsx', code);
console.log("Updated AdminCMSPanel with Live Page Editor link");
