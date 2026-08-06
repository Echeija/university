const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboards/DashboardRouter.tsx', 'utf8');

code = code.replace(
  /case 'Administrator':\n\s*case 'ICT Admin':\n\s*case 'Portal':/g,
  `case 'Administrator':
      case 'Admin':
      case 'Content Manager':
      case 'ICT Admin':
      case 'Portal':`
);

fs.writeFileSync('src/pages/dashboards/DashboardRouter.tsx', code);
console.log('Patched Router');
