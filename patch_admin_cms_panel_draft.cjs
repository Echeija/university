const fs = require('fs');
let code = fs.readFileSync('src/components/cms/AdminCMSPanel.tsx', 'utf8');

// Inside renderCardContent
code = code.replace(
  /<div className="p-4 flex flex-col flex-1">\n\s*<div className="flex items-start justify-between gap-2 mb-2">/,
  `<div className="p-4 flex flex-col flex-1">
                          {item.status === 'Draft' && item.metadata?.draft && (
                            <div className="mb-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold w-fit">
                              <AlertTriangle className="w-3.5 h-3.5" /> Pending Approval
                            </div>
                          )}
                          <div className="flex items-start justify-between gap-2 mb-2">`
);

fs.writeFileSync('src/components/cms/AdminCMSPanel.tsx', code);
console.log('Patched AdminCMSPanel');
