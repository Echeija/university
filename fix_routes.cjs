const fs = require('fs');

const routerFile = 'src/pages/dashboards/DashboardRouter.tsx';
let code = fs.readFileSync(routerFile, 'utf8');

code = code.replace(
  /<Route path="\/assignments" element=\{<StudentAssignments \/>\} \/>/g,
  ''
);

code = code.replace(
  /<Route path="\/assignments" element=\{<LecturerAssignments \/>\} \/>/g,
  '<Route path="/assignments" element={role === \'Lecturer\' ? <LecturerAssignments /> : <StudentAssignments />} />'
);

fs.writeFileSync(routerFile, code);
