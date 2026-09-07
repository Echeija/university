const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboards/DashboardRouter.tsx', 'utf8');

// Add to Routes
const lecturerRoutes = `<Route path="/performance-analytics" element={<LecturerPerformanceAnalytics />} />`;
const lecturerRoutesWithExams = `<Route path="/performance-analytics" element={<LecturerPerformanceAnalytics />} />\n            <Route path="/exams" element={<LecturerExamManagement />} />`;
content = content.replace(lecturerRoutes, lecturerRoutesWithExams);

const studentRoutes = `<Route path="/results" element={<AcademicResults />} />`;
const studentRoutesWithExams = `<Route path="/results" element={<AcademicResults />} />\n            <Route path="/exams" element={<StudentExams />} />`;
content = content.replace(studentRoutes, studentRoutesWithExams);

// Add to Sidebar (Lecturer)
const lecturerSidebar = `              <Link to="/dashboard/assigned-courses" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/assigned-courses') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <BookOpen className="w-5 h-5 opacity-75" />
                Assigned Courses
              </Link>`;
const lecturerSidebarWithExams = `              <Link to="/dashboard/assigned-courses" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/assigned-courses') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <BookOpen className="w-5 h-5 opacity-75" />
                Assigned Courses
              </Link>
              <Link to="/dashboard/exams" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/exams') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <Calendar className="w-5 h-5 opacity-75" />
                Exam Management
              </Link>
              <Link to="/dashboard/continuous-assessment" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/continuous-assessment') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <FileCheck className="w-5 h-5 opacity-75" />
                CA Management
              </Link>`;
content = content.replace(lecturerSidebar, lecturerSidebarWithExams);

// Add to Sidebar (Student)
const studentSidebar = `              <Link to="/dashboard/results" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/results') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <GraduationCap className="w-5 h-5 opacity-75" />
                Academic Results
              </Link>`;
const studentSidebarWithExams = `              <Link to="/dashboard/results" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/results') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <GraduationCap className="w-5 h-5 opacity-75" />
                Academic Results
              </Link>
              <Link to="/dashboard/exams" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/exams') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <Calendar className="w-5 h-5 opacity-75" />
                My Exams
              </Link>`;
content = content.replace(studentSidebar, studentSidebarWithExams);

fs.writeFileSync('src/pages/dashboards/DashboardRouter.tsx', content);
console.log('Exams and CA hooked into routing and sidebar');
