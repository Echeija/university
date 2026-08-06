const fs = require('fs');

function fixRouter() {
    let code = fs.readFileSync('src/pages/dashboards/DashboardRouter.tsx', 'utf8');
    
    // De-duplicate imports
    code = code.replace(
        "import { FileSpreadsheet, ClipboardList, BookText, FolderOpen, Megaphone, Microscope, BarChart3, LogOut, Microscope, Layout, User, Briefcase, Pill, Activity, ScanLine, Building, ClipboardList, CheckSquare, Calendar, Home, Users, Settings, BookOpen, GraduationCap, CreditCard, LayoutTemplate, FileSpreadsheet, FileText, Network, Book, ShieldAlert, Moon, Sun, MonitorPlay, Video, Star, MessageSquare, PenSquare, Eye, Type } from 'lucide-react';",
        "import { BookText, FolderOpen, Megaphone, BarChart3, LogOut, Microscope, Layout, User, Briefcase, Pill, Activity, ScanLine, Building, ClipboardList, CheckSquare, Calendar, Home, Users, Settings, BookOpen, GraduationCap, CreditCard, LayoutTemplate, FileSpreadsheet, FileText, Network, Book, ShieldAlert, Moon, Sun, MonitorPlay, Video, Star, MessageSquare, PenSquare, Eye, Type } from 'lucide-react';"
    );
    
    fs.writeFileSync('src/pages/dashboards/DashboardRouter.tsx', code);
}

function fixDashboard() {
    let code = fs.readFileSync('src/pages/dashboards/lecturer/LecturerDashboard.tsx', 'utf8');
    
    // Add missing lucide imports
    code = code.replace(
        "import { BookOpen, Users, ClipboardEdit, Calendar, Clock, CheckCircle2, AlertCircle, ChevronRight, Printer, X, Download } from 'lucide-react';",
        "import { FileSpreadsheet, ClipboardList, BookText, FolderOpen, Megaphone, Microscope, BarChart3, CheckSquare, Video, MessageSquare, BookOpen, Users, ClipboardEdit, Calendar, Clock, CheckCircle2, AlertCircle, ChevronRight, Printer, X, Download } from 'lucide-react';"
    );
    
    fs.writeFileSync('src/pages/dashboards/lecturer/LecturerDashboard.tsx', code);
}

fixRouter();
fixDashboard();
