const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboards/DashboardRouter.tsx', 'utf8');

// Add Complaints import
if (!content.includes('import Complaints')) {
  content = content.replace(
    "import ApplicantDashboardHome from './applicant/ApplicantDashboardHome';",
    "import ApplicantDashboardHome from './applicant/ApplicantDashboardHome';\nimport Complaints from './student/Complaints';"
  );
}

// Fix double Transcripts route
content = content.replace(
  "<Route path=\"/transcripts\" element={<TranscriptRequest />} />\n            <Route path=\"/transcripts\" element={<TranscriptRequests />} />",
  "<Route path=\"/transcripts\" element={<TranscriptRequests />} />"
);

// Add Complaints route
if (!content.includes('<Route path="/complaints"')) {
  content = content.replace(
    "<Route path=\"/transcripts\" element={<TranscriptRequests />} />",
    "<Route path=\"/transcripts\" element={<TranscriptRequests />} />\n            <Route path=\"/complaints\" element={<Complaints />} />"
  );
}

// Add Complaints to Student Sidebar
if (!content.includes('to="/dashboard/complaints"')) {
  const insertIndex = content.indexOf('Course Evaluations');
  if (insertIndex !== -1) {
    const linkToAdd = `
              <Link to="/dashboard/transcripts" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/transcripts') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <FileText className="w-5 h-5 opacity-75" />
                Transcripts
              </Link>
              <Link to="/dashboard/complaints" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/complaints') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <MessageSquare className="w-5 h-5 opacity-75" />
                Complaints
              </Link>`;
    content = content.replace(
      'Course Evaluations\n              </Link>',
      `Course Evaluations\n              </Link>${linkToAdd}`
    );
  }
}

// Update getPageTitle
if (!content.includes('/complaints\')')) {
  content = content.replace(
    "if (location.pathname.includes('/admissions')) return 'Admissions';",
    "if (location.pathname.includes('/admissions')) return 'Admissions';\n    if (location.pathname.includes('/complaints')) return 'Complaints';\n    if (location.pathname.includes('/student-profile')) return 'My Profile';"
  );
}

fs.writeFileSync('src/pages/dashboards/DashboardRouter.tsx', content);
