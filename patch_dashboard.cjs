const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboards/student/StudentDashboard.tsx', 'utf8');

// We need to add state for CGPA and fetch it.
const fetchCode = `  const [cgpa, setCgpa] = React.useState<number | null>(null);
  const { token } = useAuth();
  React.useEffect(() => {
    fetch('/api/student/academic-profile', { headers: { Authorization: \`Bearer \${token}\` } })
      .then(res => res.json())
      .then(data => {
        if (data && data.cgpa !== undefined) setCgpa(data.cgpa);
      })
      .catch(e => console.error(e));
  }, [token]);`;

if (!content.includes('setCgpa')) {
  content = content.replace('  const { user } = useAuth();', fetchCode.replace('  const { token } = useAuth();', '  const { user, token } = useAuth();'));
}

content = content.replace('<p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">3.76</p>', '<p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{cgpa !== null ? cgpa.toFixed(2) : \'-\'}</p>');
content = content.replace('<p className="font-bold text-lg">3.76</p>', '<p className="font-bold text-lg">{cgpa !== null ? cgpa.toFixed(2) : \'-\'}</p>');

fs.writeFileSync('src/pages/dashboards/student/StudentDashboard.tsx', content);
console.log('Patched StudentDashboard.tsx');
