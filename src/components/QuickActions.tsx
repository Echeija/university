import { BookOpen, FileText, Settings, CreditCard, GraduationCap, Download, Video, CheckSquare, ScanLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { ElementType } from 'react';

interface QuickAction {
  name: string;
  icon: ElementType;
  path: string;
  color: string;
  bg: string;
  onClick?: () => void;
}

export default function QuickActions() {
  const { notify } = useNotification();

  const handleAction = (actionName: string) => {
    notify({
      title: 'Action Initiated',
      message: `Navigating to ${actionName}...`,
      type: 'info'
    });
  };

  const actions: QuickAction[] = [
    { name: 'Degree Audit', icon: CheckSquare, path: '/dashboard/degree-audit', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
    { name: 'Digital ID Card', icon: ScanLine, path: '/dashboard/digital-id', color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/40' },
    { name: 'Course Registration', icon: BookOpen, path: '/dashboard/courses', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { name: 'Virtual Classes', icon: Video, path: '/dashboard/virtual-classes', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30' },
    { name: 'Academic Results', icon: GraduationCap, path: '/dashboard/results', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
    { name: 'My Attendance', icon: CheckSquare, path: '/dashboard/my-attendance', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
    { name: 'Transcript Request', icon: FileText, path: '/dashboard/transcripts', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30' },
    { name: 'Resource Library', icon: Download, path: '/dashboard/resources', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/30' },
    { name: 'Fee Payments', icon: CreditCard, path: '/dashboard/payments', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/30' },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mt-6">
      <h3 className="font-bold text-xl text-slate-800 dark:text-white mb-6">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action) => (
          action.onClick ? (
            <button
              key={action.name}
              onClick={action.onClick}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group"
            >
              <div className={`w-12 h-12 rounded-full ${action.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon className={`w-6 h-6 ${action.color}`} />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">{action.name}</span>
            </button>
          ) : (
            <Link
              key={action.name}
              to={action.path}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group"
            >
              <div className={`w-12 h-12 rounded-full ${action.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon className={`w-6 h-6 ${action.color}`} />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">{action.name}</span>
            </Link>
          )
        ))}
      </div>
    </div>
  );
}
