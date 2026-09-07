const fs = require('fs');

const routerFile = 'src/pages/dashboards/DashboardRouter.tsx';
let code = fs.readFileSync(routerFile, 'utf8');

if (!code.includes('import StudentAssignments')) {
  // Add import
  code = code.replace(
    'import AcademicResults from \'./student/AcademicResults\';',
    'import AcademicResults from \'./student/AcademicResults\';\nimport StudentAssignments from \'./student/StudentAssignments\';'
  );
  
  // Add Route
  code = code.replace(
    '<Route path="/student-profile" element={<StudentProfile />} />',
    '<Route path="/student-profile" element={<StudentProfile />} />\n            <Route path="/assignments" element={<StudentAssignments />} />'
  );
  
  // Add sidebar link (for Student role)
  // Look for CourseRegistration link to add it after
  code = code.replace(
    /<Link to="\/dashboard\/courses".*?Course Registration\s*<\/Link>/s,
    match => `${match}\n              <Link to="/dashboard/assignments" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/assignments') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>\n                <BookText className="w-5 h-5 opacity-75" />\n                Assignments\n              </Link>`
  );

  fs.writeFileSync(routerFile, code);
  console.log('Student assignments route added.');
} else {
  console.log('Route already exists.');
}
