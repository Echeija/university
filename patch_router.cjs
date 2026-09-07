const fs = require('fs');

let router = fs.readFileSync('src/pages/dashboards/DashboardRouter.tsx', 'utf8');

// Imports
const importStudentExams = `import StudentExams from './student/StudentExams';\nimport LecturerExamManagement from './lecturer/LecturerExamManagement';\n`;
if (!router.includes('StudentExams')) {
  router = router.replace("import SemesterRegistration from './student/SemesterRegistration';", "import SemesterRegistration from './student/SemesterRegistration';\n" + importStudentExams);
}

// Routes
if (!router.includes('path="exams"')) {
  router = router.replace('{/* Student Routes */}', `{/* Student Routes */}\n            <Route path="exams" element={<StudentExams />} />`);
  router = router.replace('{/* Lecturer Routes */}', `{/* Lecturer Routes */}\n            <Route path="manage-exams" element={<LecturerExamManagement />} />`);
}

// Sidebars
const studentSidebar = `              <Link to="/dashboard/course-registration" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/course-registration') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800/50'}\`}>
                <BookOpen className="w-5 h-5 opacity-75" />
                Course Registration
              </Link>`;
const studentSidebarNew = studentSidebar + `
              <Link to="/dashboard/exams" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/exams') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800/50'}\`}>
                <Calendar className="w-5 h-5 opacity-75" />
                My Exams
              </Link>`;
router = router.replace(studentSidebar, studentSidebarNew);

const lecturerSidebar = `              <Link to="/dashboard/students" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/students') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800/50'}\`}>
                <Users className="w-5 h-5 opacity-75" />
                My Students
              </Link>`;
const lecturerSidebarNew = lecturerSidebar + `
              <Link to="/dashboard/manage-exams" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/manage-exams') ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800/50'}\`}>
                <Calendar className="w-5 h-5 opacity-75" />
                Exam Management
              </Link>`;
router = router.replace(lecturerSidebar, lecturerSidebarNew);

fs.writeFileSync('src/pages/dashboards/DashboardRouter.tsx', router);
console.log('Router patched.');
