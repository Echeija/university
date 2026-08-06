const fs = require('fs');

function fixRouter() {
    let code = fs.readFileSync('src/pages/dashboards/DashboardRouter.tsx', 'utf8');
    
    // Fix supabase import
    code = code.replace("import { BarChart3, Megaphone, FolderOpen, BookText, supabase } from '../../lib/supabase';", "import { supabase } from '../../lib/supabase';");
    code = code.replace("import { Microscope, ClipboardList, FileSpreadsheet, supabase } from '../../lib/supabase';", "import { supabase } from '../../lib/supabase';"); // just in case
    
    // Add lucide imports
    if (!code.includes("BarChart3")) {
        code = code.replace("import {", "import { FileSpreadsheet, ClipboardList, BookText, FolderOpen, Megaphone, Microscope, BarChart3,");
    }
    fs.writeFileSync('src/pages/dashboards/DashboardRouter.tsx', code);
}

function fixDashboard() {
    let code = fs.readFileSync('src/pages/dashboards/lecturer/LecturerDashboard.tsx', 'utf8');
    
    // Add lucide imports
    if (!code.includes("BarChart3")) {
        code = code.replace("import {", "import { FileSpreadsheet, ClipboardList, BookText, FolderOpen, Megaphone, Microscope, BarChart3, CheckSquare, Video, MessageSquare,");
    }
    fs.writeFileSync('src/pages/dashboards/lecturer/LecturerDashboard.tsx', code);
}

fixRouter();
fixDashboard();
