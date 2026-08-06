const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboards/DashboardRouter.tsx', 'utf8');

// Add SemesterRegistration import
if (!content.includes('import SemesterRegistration')) {
  content = content.replace(
    "import Complaints from './student/Complaints';",
    "import Complaints from './student/Complaints';\nimport SemesterRegistration from './student/SemesterRegistration';"
  );
}

// Add SemesterRegistration route
if (!content.includes('<Route path="/semester-registration"')) {
  content = content.replace(
    "<Route path=\"/complaints\" element={<Complaints />} />",
    "<Route path=\"/complaints\" element={<Complaints />} />\n            <Route path=\"/semester-registration\" element={<SemesterRegistration />} />"
  );
}

// Add SemesterRegistration to Student Sidebar before Course Registration
if (!content.includes('to="/dashboard/semester-registration"')) {
  const insertIndex = content.indexOf('Course Registration\n              </Link>');
  if (insertIndex !== -1) {
    const linkToAdd = `
              <Link to="/dashboard/semester-registration" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/semester-registration') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <Book className="w-5 h-5 opacity-75" />
                Semester Registration
              </Link>`;
    content = content.replace(
      'Course Registration\n              </Link>',
      `Course Registration\n              </Link>${linkToAdd}`
    );
  }
}

// Update getPageTitle for semester-registration
if (!content.includes('/semester-registration\')')) {
  content = content.replace(
    "if (location.pathname.includes('/complaints')) return 'Complaints';",
    "if (location.pathname.includes('/complaints')) return 'Complaints';\n    if (location.pathname.includes('/semester-registration')) return 'Semester Registration';"
  );
}

fs.writeFileSync('src/pages/dashboards/DashboardRouter.tsx', content);
