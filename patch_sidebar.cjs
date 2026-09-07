const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboards/DashboardRouter.tsx', 'utf8');

// Add for HOD
const hodTarget = `<Link to="/dashboard/department"`;
const hodInsert = `
              <Link to="/dashboard/approve-results" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/approve-results') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <CheckSquare className="w-5 h-5 opacity-75" />
                Approve Results
              </Link>
`;

if (content.includes(hodTarget) && !content.includes('/dashboard/approve-results" className=')) {
  content = content.replace(hodTarget, hodInsert.trim() + '\n              ' + hodTarget);
}

// Check if Registrar section exists
const registrarSection = `role === 'Registrar'`;
if (content.includes(registrarSection)) {
  // Add to registrar section
  const registrarTarget = `<Link to="/dashboard/admissions"`;
  const registrarInsert = `
              <Link to="/dashboard/publish-results" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/publish-results') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <FileCheck className="w-5 h-5 opacity-75" />
                Publish Results
              </Link>
  `;
  if (content.includes(registrarTarget) && !content.includes('/dashboard/publish-results" className=')) {
    content = content.replace(registrarTarget, registrarInsert.trim() + '\n              ' + registrarTarget);
  }
} else {
    // If Registrar section doesn't exist, we might need to add it or it's under something else.
    console.log("Registrar section not found directly. Let's see what exists.");
}

// Check if CheckSquare, FileCheck are imported from lucide-react
if (content.includes("import {") && content.includes("lucide-react")) {
    if(!content.includes("CheckSquare,")) content = content.replace("lucide-react';", "CheckSquare, lucide-react';");
    if(!content.includes("FileCheck,")) content = content.replace("lucide-react';", "FileCheck, lucide-react';");
}

fs.writeFileSync('src/pages/dashboards/DashboardRouter.tsx', content);
console.log('patched sidebar');
