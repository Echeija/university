import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Import new LMS components
const lmsImports = `
import LmsLayout from './pages/lms/LmsLayout';
import LmsDashboard from './pages/lms/LmsDashboard';
import LmsCourses from './pages/lms/LmsCourses';
import LmsLiveClass from './pages/lms/LmsLiveClass';
import LmsAssignments from './pages/lms/LmsAssignments';
import LmsAnalytics from './pages/lms/LmsAnalytics';
import LmsCalendar from './pages/lms/LmsCalendar';
`;

content = content.replace(/(import DashboardRouter from '\.\/pages\/dashboards\/DashboardRouter';)/, "$1\n" + lmsImports);

// Add LMS routes under ProtectedRoute or as separate routes. 
// Since users might want to view it without strict dashboard auth yet, let's put it as a separate protected or public route for demonstration.
const lmsRoutes = `
              {/* LMS Routes */}
              <Route path="/lms" element={<LmsLayout />}>
                <Route index element={<LmsDashboard />} />
                <Route path="courses" element={<LmsCourses />} />
                <Route path="live" element={<LmsLiveClass />} />
                <Route path="assignments" element={<LmsAssignments />} />
                <Route path="analytics" element={<LmsAnalytics />} />
                <Route path="calendar" element={<LmsCalendar />} />
              </Route>
`;

content = content.replace(/(\{\/\* Protected Dashboard Routes \*\/\})/, lmsRoutes + "\n              $1");

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx updated for LMS');
