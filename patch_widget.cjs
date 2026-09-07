const fs = require('fs');

let file = fs.readFileSync('src/components/CourseEnrollmentWidget.tsx', 'utf8');

const oldFilter = `  const filteredCourses = courses.filter(course => 
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );`;

const newFilter = `  const filteredCourses = courses.filter(course => 
    course.semester === '1st' &&
    (course.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );`;

if (file.includes(oldFilter)) {
  file = file.replace(oldFilter, newFilter);
  fs.writeFileSync('src/components/CourseEnrollmentWidget.tsx', file);
  console.log('CourseEnrollmentWidget patched.');
} else {
  console.log('Target not found in CourseEnrollmentWidget.');
}
