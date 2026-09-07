const fs = require('fs');

const f1 = 'src/pages/dashboards/student/StudentAssignments.tsx';
let c1 = fs.readFileSync(f1, 'utf8');

// The problematic string to remove:
const helpersStr = `
  const getSubmission = (assignmentId: number) => {
    return mySubmissions.find(s => s.assignmentId === assignmentId);
  };

  const formatCountdown = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = d.getTime() - now.getTime();
    if (diff < 0) return 'Overdue';
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    if (days > 0) return \`\${days} day\${days > 1 ? 's' : ''} left\`;
    return \`\${hours} hour\${hours !== 1 ? 's' : ''} left\`;
  };
`;

// Remove all instances of this string
while(c1.includes(helpersStr)) {
  c1 = c1.replace(helpersStr, '');
}

// Add it back right before the return statement inside the component
const returnIndex = c1.indexOf('  return (\n    <div className="space-y-4">');
if (returnIndex !== -1) {
  c1 = c1.slice(0, returnIndex) + helpersStr + c1.slice(returnIndex);
} else {
  // alternative if first failed
  const returnIndex2 = c1.lastIndexOf('  return (');
  if (returnIndex2 !== -1) {
    c1 = c1.slice(0, returnIndex2) + helpersStr + '\n' + c1.slice(returnIndex2);
  }
}

fs.writeFileSync(f1, c1);

// Now StudentAttendance
const f2 = 'src/pages/dashboards/student/StudentAttendance.tsx';
let c2 = fs.readFileSync(f2, 'utf8');
c2 = c2.replace(/stats\.present/g, '(stats as any).present');
c2 = c2.replace(/stats\.late/g, '(stats as any).late');
c2 = c2.replace(/stats\.total/g, '(stats as any).total');
c2 = c2.replace(/stats\.absent/g, '(stats as any).absent');
c2 = c2.replace(/stats\.excused/g, '(stats as any).excused');
c2 = c2.replace(/course\.title/g, '(course as any).title');
c2 = c2.replace(/course\.present/g, '(course as any).present');
c2 = c2.replace(/course\.absent/g, '(course as any).absent');
c2 = c2.replace(/course\.late/g, '(course as any).late');
c2 = c2.replace(/course\.total/g, '(course as any).total');
fs.writeFileSync(f2, c2);

// AcademicCalendar
const f3 = 'src/components/AcademicCalendar.tsx';
let c3 = fs.readFileSync(f3, 'utf8');
c3 = c3.replace(/events\.map/g, '(events as any[]).map');
fs.writeFileSync(f3, c3);

console.log('Fixed');
