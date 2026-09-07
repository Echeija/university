const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboards/admin/ResultAmendments.tsx', 'utf8');
code = code.replace(/\\`/g, '`');
code = code.replace(/\\\$/g, '$');
fs.writeFileSync('src/pages/dashboards/admin/ResultAmendments.tsx', code);
