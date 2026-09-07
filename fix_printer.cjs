const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboards/student/CourseRegistration.tsx', 'utf8');

if (!content.includes('Printer')) {
    content = content.replace("import { BookOpen,", "import { Printer, BookOpen,");
}
fs.writeFileSync('src/pages/dashboards/student/CourseRegistration.tsx', content);
console.log('Fixed CourseRegistration.tsx printer import');
