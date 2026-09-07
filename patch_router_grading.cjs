const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboards/DashboardRouter.tsx', 'utf8');

if (!content.includes('import GradingSettings')) {
  content = content.replace("import AcademicSettings from './admin/AcademicSettings';", "import AcademicSettings from './admin/AcademicSettings';\nimport GradingSettings from './admin/GradingSettings';");
}

if (!content.includes('/dashboard/grading-settings')) {
  // Add Sidebar link under Administrator
  const sidebarLink = `              <Link to="/dashboard/grading-settings" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/grading-settings') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <CheckSquare className="w-5 h-5 opacity-75" />
                Grading Rules
              </Link>`;
  content = content.replace('<Link to="/dashboard/settings"', sidebarLink + '\n              <Link to="/dashboard/settings"');
  
  // Add Route
  const routeLink = `<Route path="/grading-settings" element={<GradingSettings />} />`;
  content = content.replace('<Route path="/settings"', routeLink + '\n            <Route path="/settings"');
}

fs.writeFileSync('src/pages/dashboards/DashboardRouter.tsx', content);
console.log('Patched GradingSettings into router');
