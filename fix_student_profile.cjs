const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboards/student/StudentProfile.tsx', 'utf8');

code = code.replace(
  "setFormData(data);",
  "setFormData(prev => ({ ...prev, ...data }));"
);

fs.writeFileSync('src/pages/dashboards/student/StudentProfile.tsx', code);
console.log("Fixed setFormData in StudentProfile");
