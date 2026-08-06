const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboards/DashboardRouter.tsx', 'utf8');

const oldLecturerSection = `          {role === 'Lecturer' && (
            <>
              <Link to="/dashboard/attendance" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/attendance') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <CheckSquare className="w-5 h-5 opacity-75" />
                Attendance Tracking
              </Link>
              <Link to="/dashboard/documents" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/documents') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <FileText className="w-5 h-5 opacity-75" />
                Document Repository
              </Link>
              <Link to="/dashboard/messages" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/messages') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <MessageSquare className="w-5 h-5 opacity-75" />
                Messages
              </Link>
              <Link to="/dashboard/lms" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/lms') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <MonitorPlay className="w-5 h-5 opacity-75" />
                Learning Portal
              </Link>
              <Link to="/dashboard/calendar" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/calendar') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <Calendar className="w-5 h-5 opacity-75" />
                Calendar
              </Link>
              <Link to="/dashboard/virtual-classes" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/virtual-classes') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <Video className="w-5 h-5 opacity-75" />
                Virtual Classes
              </Link>
              
              <Link to="/dashboard/evaluation-reports" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/evaluation-reports') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <Star className="w-5 h-5 opacity-75" />
                Evaluation Reports
              </Link>
              <Link to="/dashboard/assigned-courses" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/assigned-courses') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <BookOpen className="w-5 h-5 opacity-75" />
                Assigned Courses
              </Link>
              {/* Grading will be accessed via courses, but can have a global link or not */}
            </>
          )}`;

const newLecturerSection = `          {role === 'Lecturer' && (
            <>
              <Link to="/dashboard/assigned-courses" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/assigned-courses') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <BookOpen className="w-5 h-5 opacity-75" />
                Course Allocation
              </Link>
              <Link to="/dashboard/attendance" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/attendance') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <CheckSquare className="w-5 h-5 opacity-75" />
                Attendance
              </Link>
              <Link to="/dashboard/result-upload" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/result-upload') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <FileSpreadsheet className="w-5 h-5 opacity-75" />
                Result Upload
              </Link>
              <Link to="/dashboard/continuous-assessment" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/continuous-assessment') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <ClipboardList className="w-5 h-5 opacity-75" />
                Continuous Assessment
              </Link>
              <Link to="/dashboard/assignments" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/assignments') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <BookText className="w-5 h-5 opacity-75" />
                Assignments
              </Link>
              <Link to="/dashboard/teaching-materials" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/teaching-materials') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <FolderOpen className="w-5 h-5 opacity-75" />
                Teaching Materials
              </Link>
              <Link to="/dashboard/video-upload" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/video-upload') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <Video className="w-5 h-5 opacity-75" />
                Video Upload
              </Link>
              <Link to="/dashboard/class-management" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/class-management') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <Users className="w-5 h-5 opacity-75" />
                Class Management
              </Link>
              <Link to="/dashboard/announcements" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/announcements') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <Megaphone className="w-5 h-5 opacity-75" />
                Announcements
              </Link>
              <Link to="/dashboard/messages" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/messages') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <MessageSquare className="w-5 h-5 opacity-75" />
                Messaging
              </Link>
              <Link to="/dashboard/research" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/research') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <Microscope className="w-5 h-5 opacity-75" />
                Research
              </Link>
              <Link to="/dashboard/performance-analytics" className={\`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors \${isActive('/dashboard/performance-analytics') ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-800/50'}\`}>
                <BarChart3 className="w-5 h-5 opacity-75" />
                Performance Analytics
              </Link>
            </>
          )}`;

if (code.includes('Virtual Classes') && code.includes('Evaluation Reports')) {
    code = code.replace(oldLecturerSection, newLecturerSection);
    
    // Make sure we have the imports for lucide icons
    const iconsToImport = ['FileSpreadsheet', 'ClipboardList', 'BookText', 'FolderOpen', 'Megaphone', 'Microscope', 'BarChart3'];
    for (let icon of iconsToImport) {
        if (!code.includes(icon)) {
            code = code.replace("import {", `import { ${icon},`);
        }
    }

    fs.writeFileSync('src/pages/dashboards/DashboardRouter.tsx', code);
    console.log('Sidebar updated');
} else {
    console.log('Could not find Lecturer section to replace');
}
