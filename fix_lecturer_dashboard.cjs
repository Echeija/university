const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboards/lecturer/LecturerDashboard.tsx', 'utf8');

// See what we can inject or modify
const quickActionsStr = `<div className="mt-6">\n        <FacilityBookingSystem />\n      </div>`;
const newQuickActions = `<div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/dashboard/assigned-courses" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:shadow-md transition-all text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 group">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-center">Course Allocation</span>
        </Link>
        <Link to="/dashboard/attendance" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:shadow-md transition-all text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 group">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
            <CheckSquare className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-center">Attendance</span>
        </Link>
        <Link to="/dashboard/result-upload" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:shadow-md transition-all text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 group">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-center">Result Upload</span>
        </Link>
        <Link to="/dashboard/continuous-assessment" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:shadow-md transition-all text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 group">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
            <ClipboardList className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-center">Continuous Assessment</span>
        </Link>
        <Link to="/dashboard/assignments" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:shadow-md transition-all text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 group">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
            <BookText className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-center">Assignments</span>
        </Link>
        <Link to="/dashboard/teaching-materials" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:shadow-md transition-all text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 group">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
            <FolderOpen className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-center">Teaching Materials</span>
        </Link>
        <Link to="/dashboard/video-upload" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:shadow-md transition-all text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 group">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
            <Video className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-center">Video Upload</span>
        </Link>
        <Link to="/dashboard/class-management" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:shadow-md transition-all text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 group">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
            <Users className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-center">Class Management</span>
        </Link>
        <Link to="/dashboard/announcements" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:shadow-md transition-all text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 group">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
            <Megaphone className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-center">Announcements</span>
        </Link>
        <Link to="/dashboard/messages" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:shadow-md transition-all text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 group">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
            <MessageSquare className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-center">Messaging</span>
        </Link>
        <Link to="/dashboard/research" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:shadow-md transition-all text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 group">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
            <Microscope className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-center">Research</span>
        </Link>
        <Link to="/dashboard/performance-analytics" className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:shadow-md transition-all text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 group">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
            <BarChart3 className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm text-center">Performance Analytics</span>
        </Link>
      </div>`;

if (code.includes(quickActionsStr)) {
    code = code.replace(quickActionsStr, newQuickActions);
    
    const iconsToImport = ['FileSpreadsheet', 'ClipboardList', 'BookText', 'FolderOpen', 'Megaphone', 'Microscope', 'BarChart3'];
    for (let icon of iconsToImport) {
        if (!code.includes(icon)) {
            code = code.replace("import {", `import { ${icon},`);
        }
    }

    fs.writeFileSync('src/pages/dashboards/lecturer/LecturerDashboard.tsx', code);
    console.log("Updated LecturerDashboard.tsx");
} else {
    console.log("Could not find quick actions section to replace in LecturerDashboard.tsx");
}
