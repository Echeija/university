import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HelpCircle, Database, BookOpen, Video, LayoutDashboard, FileEdit, 
  BarChart, Calendar, MessageSquare, Bell, User, Menu, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AnimatedOutlet from '../../components/AnimatedOutlet';

export default function LmsLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const role = user?.role || 'Student';
  const isAdminOrLecturer = ['Administrator', 'Admin', 'Lecturer'].includes(role);

  const navItems = [
    { name: 'Dashboard', path: '/lms', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'My Courses', path: '/lms/courses', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'Live Classes', path: '/lms/live', icon: <Video className="w-5 h-5" /> },
    { name: 'Assignments', path: '/lms/assignments', icon: <FileEdit className="w-5 h-5" /> },
    ...(isAdminOrLecturer ? [
      { name: 'Quiz Builder', path: '/lms/quiz-builder', icon: <HelpCircle className="w-5 h-5" /> },
      { name: 'Question Bank', path: '/lms/question-bank', icon: <Database className="w-5 h-5" /> },
      { name: 'Analytics', path: '/lms/analytics', icon: <BarChart className="w-5 h-5" /> },
    ] : []),
    { name: 'Calendar', path: '/lms/calendar', icon: <Calendar className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <BookOpen className="w-6 h-6" />
            <span>LMS Portal</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/lms' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-slate-900 transition-colors font-medium">
            <span className="text-xl">🔙</span>
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 sticky top-0 z-30">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 lg:hidden text-center font-bold text-slate-900">
            LMS
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full relative transition-colors">
              <MessageSquare className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 border border-indigo-200 cursor-pointer">
              <User className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatedOutlet />
        </main>
      </div>
    </div>
  );
}
