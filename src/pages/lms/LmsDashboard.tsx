import { motion } from 'motion/react';
import { BookOpen, Video, Clock, CheckCircle, FileText, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function LmsDashboard() {
  const { user } = useAuth();
  
  const stats = [
    { label: user?.role === 'Student' ? 'Enrolled Courses' : 'Active Courses', value: '4', icon: <BookOpen className="w-6 h-6 text-indigo-600" />, bg: 'bg-indigo-50' },
    { label: 'Upcoming Classes', value: '2', icon: <Video className="w-6 h-6 text-emerald-600" />, bg: 'bg-emerald-50' },
    { label: user?.role === 'Student' ? 'Pending Assignments' : 'Assignments to Grade', value: '3', icon: <FileText className="w-6 h-6 text-rose-600" />, bg: 'bg-rose-50' },
    { label: user?.role === 'Student' ? 'Completed Quizzes' : 'Quizzes Published', value: '12', icon: <CheckCircle className="w-6 h-6 text-purple-600" />, bg: 'bg-purple-50' },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name || user?.role || 'Student'}! 👋</h1>
        <p className="text-slate-600 mt-1">Here's what's happening in your classes today.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4"
          >
            <div className={`w-14 h-14 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Today's Live Classes</h2>
              <Link to="/lms/live" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</Link>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-indigo-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Video className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Advanced Algorithms</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 10:00 AM - 11:30 AM
                    </p>
                  </div>
                </div>
                <Link to="/lms/live" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                  Join Now
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Announcements</h2>
            <div className="space-y-4">
              <div className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <h4 className="font-semibold text-slate-900">Midterm Exam Schedule Posted</h4>
                <p className="text-sm text-slate-500 mt-1">Check the calendar for your upcoming exams.</p>
                <p className="text-xs text-slate-400 mt-2">2 hours ago</p>
              </div>
              <div className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <h4 className="font-semibold text-slate-900">Guest Lecture: AI Ethics</h4>
                <p className="text-sm text-slate-500 mt-1">Join us this Friday for a special lecture on AI.</p>
                <p className="text-xs text-slate-400 mt-2">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
