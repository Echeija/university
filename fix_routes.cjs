const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboards/DashboardRouter.tsx', 'utf8');

const routeSection = `            <Route path="/live-lecture" element={<LiveLecture />} />
            <Route path="/result-upload" element={<LecturerResultUpload />} />
            <Route path="/continuous-assessment" element={<LecturerContinuousAssessment />} />
            <Route path="/assignments" element={<LecturerAssignments />} />
            <Route path="/teaching-materials" element={<LecturerTeachingMaterials />} />
            <Route path="/video-upload" element={<LecturerVideoUpload />} />
            <Route path="/class-management" element={<LecturerClassManagement />} />
            <Route path="/announcements" element={<LecturerAnnouncements />} />
            <Route path="/research" element={<LecturerResearch />} />
            <Route path="/performance-analytics" element={<LecturerPerformanceAnalytics />} />`;

code = code.replace('<Route path="/live-lecture" element={<LiveLecture />} />', routeSection);

const newImports = `
import LecturerResultUpload from './lecturer/LecturerResultUpload';
import LecturerContinuousAssessment from './lecturer/LecturerContinuousAssessment';
import LecturerAssignments from './lecturer/LecturerAssignments';
import LecturerTeachingMaterials from './lecturer/LecturerTeachingMaterials';
import LecturerVideoUpload from './lecturer/LecturerVideoUpload';
import LecturerClassManagement from './lecturer/LecturerClassManagement';
import LecturerAnnouncements from './lecturer/LecturerAnnouncements';
import LecturerResearch from './lecturer/LecturerResearch';
import LecturerPerformanceAnalytics from './lecturer/LecturerPerformanceAnalytics';
`;

code = code.replace("import LiveLecture from './LiveLecture';", "import LiveLecture from './LiveLecture';" + newImports);

fs.writeFileSync('src/pages/dashboards/DashboardRouter.tsx', code);
