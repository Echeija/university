const fs = require('fs');

let code = fs.readFileSync('src/pages/dashboards/DashboardRouter.tsx', 'utf8');
code = code.replace("import { FileSpreadsheet, ClipboardList, BookText, FolderOpen, Megaphone, Microscope, BarChart3, supabase } from '../../lib/supabase';", "import { supabase } from '../../lib/supabase';");
code = code.replace("import { LogOut, ", "import { FileSpreadsheet, ClipboardList, BookText, FolderOpen, Megaphone, Microscope, BarChart3, LogOut, ");
fs.writeFileSync('src/pages/dashboards/DashboardRouter.tsx', code);

let code2 = fs.readFileSync('src/pages/dashboards/lecturer/LecturerDashboard.tsx', 'utf8');
code2 = code2.replace("import { FileSpreadsheet, ClipboardList, BookText, FolderOpen, Megaphone, Microscope, BarChart3, CheckSquare, Video, MessageSquare, supabase } from '../../../lib/supabase';", "import { supabase } from '../../../lib/supabase';");
code2 = code2.replace("import { Calendar,", "import { FileSpreadsheet, ClipboardList, BookText, FolderOpen, Megaphone, Microscope, BarChart3, CheckSquare, Video, MessageSquare, Calendar,");
fs.writeFileSync('src/pages/dashboards/lecturer/LecturerDashboard.tsx', code2);
