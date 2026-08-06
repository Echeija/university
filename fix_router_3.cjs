const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboards/DashboardRouter.tsx', 'utf8');

// Add Profile to sidebar
if (!content.includes('to="/dashboard/student-profile"')) {
  const insertIndex = content.indexOf('to="/dashboard/digital-id"');
  if (insertIndex !== -1) {
    const linkToAdd = `
              <Link to="/dashboard/student-profile" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/student-profile') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <User className="w-5 h-5 opacity-75" />
                My Profile
              </Link>`;
    content = content.replace(
      '<Link to="/dashboard/digital-id"',
      `${linkToAdd}\n              <Link to="/dashboard/digital-id"`
    );
  }
}

// Rename Calendar to Timetable
content = content.replace(
  '<Calendar className="w-5 h-5 opacity-75" />\n                Calendar',
  '<Calendar className="w-5 h-5 opacity-75" />\n                Timetable & Calendar'
);

// Ensure User icon is imported if we use it
if (!content.includes('User,') && !content.includes(' User ')) {
  content = content.replace(
    "import { Home, Building,",
    "import { Home, Building, User,"
  );
}

fs.writeFileSync('src/pages/dashboards/DashboardRouter.tsx', content);
