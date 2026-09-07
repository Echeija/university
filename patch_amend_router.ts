import fs from 'fs';
let content = fs.readFileSync('src/pages/dashboards/DashboardRouter.tsx', 'utf8');

// Import
content = content.replace(
  /import ManageFaculties from '.\/admin\/ManageFaculties';/,
  `import ManageFaculties from './admin/ManageFaculties';\nimport ResultAmendments from './admin/ResultAmendments';`
);

// Add to sidebar
const sidebarLink = `
              <Link to="/dashboard/result-amendments" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/result-amendments') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <FileEdit className="w-5 h-5" />
                Amendments
              </Link>
`;

content = content.replace(
  /<Link to="\/dashboard\/result-audit"/,
  sidebarLink + '              <Link to="/dashboard/result-audit"'
);

// Add Route
content = content.replace(
  /<Route path="\/result-audit" element=\{<ResultAuditLogs \/>\} \/>/,
  `<Route path="/result-audit" element={<ResultAuditLogs />} />\n            <Route path="/result-amendments" element={<ResultAmendments />} />`
);

fs.writeFileSync('src/pages/dashboards/DashboardRouter.tsx', content);
