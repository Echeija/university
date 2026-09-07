const fs = require('fs');

const routerFile = 'src/pages/dashboards/DashboardRouter.tsx';
let code = fs.readFileSync(routerFile, 'utf8');

// Imports
if (!code.includes('import ResultApproval')) {
  code = code.replace(
    'import AcademicDashboard from \'./academic/AcademicDashboard\';',
    'import AcademicDashboard from \'./academic/AcademicDashboard\';\nimport ResultApproval from \'./hod/ResultApproval\';\nimport ResultPublication from \'./registrar/ResultPublication\';'
  );
}

// Routes
if (!code.includes('<Route path="/approve-results"')) {
  code = code.replace(
    '<Route path="/academic" element={<AcademicDashboard />} />',
    '<Route path="/academic" element={<AcademicDashboard />} />\n            <Route path="/approve-results" element={<ResultApproval />} />\n            <Route path="/publish-results" element={<ResultPublication />} />'
  );
}

// HOD Sidebar
if (!code.includes('to="/dashboard/approve-results"')) {
  code = code.replace(
    /role === 'HOD' && \(\s*<>\s*<Link to="\/dashboard\/department"/,
    `role === 'HOD' && (
            <>
              <Link to="/dashboard/approve-results" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/approve-results') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <BookOpen className="w-5 h-5 opacity-75" />
                Approve Results
              </Link>
              <Link to="/dashboard/department"`
  );
}

// Registrar Sidebar
if (!code.includes('to="/dashboard/publish-results"')) {
  code = code.replace(
    /role === 'Registrar' && \(\s*<>\s*<Link to="\/dashboard\/admissions"/,
    `role === 'Registrar' && (
            <>
              <Link to="/dashboard/publish-results" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/publish-results') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <CheckCircle2 className="w-5 h-5 opacity-75" />
                Publish Results
              </Link>
              <Link to="/dashboard/admissions"`
  );
}

fs.writeFileSync(routerFile, code);
console.log('Router updated.');
