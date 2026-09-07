const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboards/DashboardRouter.tsx', 'utf8');

if (!content.includes('import AcademicSettings')) {
  content = content.replace("import SystemSettings from './admin/SystemSettings';", "import SystemSettings from './admin/SystemSettings';\nimport AcademicSettings from './admin/AcademicSettings';");
}

if (!content.includes('/dashboard/academic-settings')) {
  // Add Sidebar link under Administrator
  const sidebarLink = `              <Link to="/dashboard/academic-settings" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/academic-settings') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <Settings className="w-5 h-5 opacity-75" />
                Academic Settings
              </Link>`;
  content = content.replace('<Link to="/dashboard/settings"', sidebarLink + '\n              <Link to="/dashboard/settings"');
  
  // Add Route
  const routeLink = `<Route path="/academic-settings" element={<AcademicSettings />} />`;
  content = content.replace('<Route path="/settings"', routeLink + '\n            <Route path="/settings"');
}

fs.writeFileSync('src/pages/dashboards/DashboardRouter.tsx', content);
console.log('Patched AcademicSettings into router');
