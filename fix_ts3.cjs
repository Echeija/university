const fs = require('fs');

const f = 'src/pages/dashboards/student/StudentAssignments.tsx';
let content = fs.readFileSync(f, 'utf8');
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
content = content.replace('  return (', helpers);
content = content.replace('  return (', helpers); // just in case
fs.writeFileSync(f, content);

// For StudentAttendance, use sed equivalent:
let att = fs.readFileSync('src/pages/dashboards/student/StudentAttendance.tsx', 'utf8');
att = att.replace(/stats\.present/g, '(stats as any).present');
att = att.replace(/stats\.late/g, '(stats as any).late');
att = att.replace(/stats\.total/g, '(stats as any).total');
att = att.replace(/stats\.absent/g, '(stats as any).absent');
att = att.replace(/stats\.excused/g, '(stats as any).excused');
att = att.replace(/course\.title/g, '(course as any).title');
att = att.replace(/course\.present/g, '(course as any).present');
att = att.replace(/course\.absent/g, '(course as any).absent');
att = att.replace(/course\.late/g, '(course as any).late');
att = att.replace(/course\.total/g, '(course as any).total');
fs.writeFileSync('src/pages/dashboards/student/StudentAttendance.tsx', att);

let aca = fs.readFileSync('src/components/AcademicCalendar.tsx', 'utf8');
aca = aca.replace(/events\.map/g, '(events as any[]).map');
fs.writeFileSync('src/components/AcademicCalendar.tsx', aca);

let sc = fs.readFileSync('src/components/StudentCalendar.tsx', 'utf8');
sc = sc.replace(/key=\{([^}]+)\}/g, '');
fs.writeFileSync('src/components/StudentCalendar.tsx', sc);

let cms = fs.readFileSync('src/components/cms/AdminCMSPanel.tsx', 'utf8');
cms = cms.replace(/key=\{([^}]+)\}/g, '');
fs.writeFileSync('src/components/cms/AdminCMSPanel.tsx', cms);
