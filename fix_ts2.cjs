const fs = require('fs');

const fixStudentAssignmentsHelpers = () => {
  const f = 'src/pages/dashboards/student/StudentAssignments.tsx';
  let content = fs.readFileSync(f, 'utf8');
  if (!content.includes('const getSubmission = (')) {
    const helpers = `
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

  return (
`;
    // use a more robust regex if needed
    content = content.replace('  return (', helpers);
    fs.writeFileSync(f, content);
  }
}
fixStudentAssignmentsHelpers();

const fixAttendance2 = () => {
  const f = 'src/pages/dashboards/student/StudentAttendance.tsx';
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/stats\./g, '(stats as any).');
  content = content.replace(/course\./g, '(course as any).');
  fs.writeFileSync(f, content);
}
fixAttendance2();

const fixAcademicCalendar2 = () => {
  const f = 'src/components/AcademicCalendar.tsx';
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/events\.map/g, '(events as any[]).map');
  fs.writeFileSync(f, content);
}
fixAcademicCalendar2();

const fixCalendar2 = () => {
  const f = 'src/components/StudentCalendar.tsx';
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/<EventCard key=\{([^}]+)\}/g, '<div key={$1}><EventCard');
  fs.writeFileSync(f, content);
}
fixCalendar2();

const fixCMS2 = () => {
  const f = 'src/components/cms/AdminCMSPanel.tsx';
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/<CMSBlockEditor key=\{([^}]+)\}/g, '<div key={$1}><CMSBlockEditor');
  fs.writeFileSync(f, content);
}
fixCMS2();

console.log("Fixed again");
