import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Megaphone,
  Calendar,
  Clock,
  Search,
  Filter,
  Trash2,
  Check,
  GraduationCap
} from 'lucide-react';
import SkeletonLoader from '../../components/SkeletonLoader';
import { 
  subscribeStudentGradeNotifications, 
  markGradeNotificationRead, 
  deleteGradeNotification 
} from '../../services/gradeNotificationService';

interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'announcement' | 'system' | 'academic';
  severity: 'high' | 'medium' | 'low';
  date: string;
  isRead: boolean;
  isFirestore?: boolean;
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    title: 'Upcoming Mid-Semester Exams',
    message: 'Mid-semester examinations will commence on the 15th of next month. Please check the portal for your personalized timetable.',
    type: 'academic',
    severity: 'high',
    date: '2026-07-28T10:00:00Z',
    isRead: false
  },
  {
    id: '2',
    title: 'Portal Maintenance Notice',
    message: 'The student portal will be down for scheduled maintenance this Saturday between 12:00 AM and 04:00 AM.',
    type: 'system',
    severity: 'medium',
    date: '2026-07-29T14:30:00Z',
    isRead: false
  },
  {
    id: '3',
    title: 'Course Registration Deadline',
    message: 'Late registration with penalty begins in 3 days. Ensure all your courses are properly registered before the deadline.',
    type: 'alert',
    severity: 'high',
    date: '2026-07-27T08:15:00Z',
    isRead: true
  },
  {
    id: '4',
    title: 'New Library Resources Available',
    message: 'We have added over 500 new e-books to the Computer Science and Engineering digital library sections.',
    type: 'announcement',
    severity: 'low',
    date: '2026-07-25T11:45:00Z',
    isRead: true
  },
  {
    id: '5',
    title: 'Tuition Fee Payment Reminder',
    message: 'A reminder that the second installment for tuition is due by the end of the month.',
    type: 'alert',
    severity: 'medium',
    date: '2026-07-20T09:00:00Z',
    isRead: true
  }
];

export default function AlertsNotifications() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [filter, setFilter] = useState<'all' | 'unread' | 'academic' | 'system'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Subscribe to real-time Firestore grade notifications
  useEffect(() => {
    if (!user || !user.id) return;

    const unsubscribe = subscribeStudentGradeNotifications(
      user.id,
      (firestoreNotifications) => {
        const gradeAlerts: Alert[] = firestoreNotifications.map(gn => ({
          id: gn.id || `gn-${Math.random()}`,
          title: gn.actionType === 'UPDATE_GRADE' 
            ? `Grade Updated: ${gn.courseCode}` 
            : `New Grade Posted: ${gn.courseCode}`,
          message: gn.message,
          type: 'academic',
          severity: 'high',
          date: gn.createdAt,
          isRead: gn.isRead,
          isFirestore: true
        }));

        setAlerts(prev => {
          // Keep static non-firestore alerts, merge with real-time firestore alerts
          const nonFirestore = prev.filter(a => !a.isFirestore);
          return [...gradeAlerts, ...nonFirestore];
        });
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  const handleMarkAsRead = async (id: string) => {
    const target = alerts.find(a => a.id === id);
    if (target?.isFirestore) {
      await markGradeNotificationRead(id);
    }
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isRead: true } : alert
    ));
  };

  const handleMarkAllAsRead = async () => {
    alerts.forEach(async (a) => {
      if (a.isFirestore && !a.isRead) {
        await markGradeNotificationRead(a.id);
      }
    });
    setAlerts(alerts.map(alert => ({ ...alert, isRead: true })));
  };

  const handleDelete = async (id: string) => {
    const target = alerts.find(a => a.id === id);
    if (target?.isFirestore) {
      await deleteGradeNotification(id);
    }
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          alert.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'unread') return matchesSearch && !alert.isRead;
    return matchesSearch && alert.type === filter;
  });

  const getIcon = (type: string) => {
    switch(type) {
      case 'academic': return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'system': return <Info className="w-5 h-5 text-blue-500" />;
      case 'alert': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'announcement': return <Megaphone className="w-5 h-5 text-emerald-500" />;
      default: return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const getSeverityStyle = (severity: string, isRead: boolean) => {
    if (isRead) return 'border-l-4 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400';
    
    switch(severity) {
      case 'high': return 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10 dark:border-red-500 text-slate-900 dark:text-white';
      case 'medium': return 'border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-500 text-slate-900 dark:text-white';
      default: return 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-500 text-slate-900 dark:text-white';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Alerts & Notifications
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Stay updated with your academic and system announcements.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200"
          >
            <CheckCircle className="w-4 h-4" />
            Mark all read
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
          />
        </div>
        
        <div className="flex overflow-x-auto pb-1 md:pb-0 hide-scrollbar gap-2">
          {['all', 'unread', 'academic', 'system'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap capitalize transition-colors ${
                filter === f 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {isLoading ? (
          <SkeletonLoader type="list" count={5} />
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
            <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Notifications Found</h3>
            <p className="text-slate-500 dark:text-slate-400">
              You are all caught up! Check back later for new alerts.
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div 
              key={alert.id}
              className={`p-5 rounded-xl shadow-sm transition-all duration-200 ${getSeverityStyle(alert.severity, alert.isRead)}`}
            >
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  {getIcon(alert.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className={`font-semibold text-lg truncate ${!alert.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      {alert.title}
                    </h3>
                    <span className="shrink-0 text-xs font-medium flex items-center gap-1 opacity-70">
                      <Clock className="w-3 h-3" />
                      {formatDate(alert.date)}
                    </span>
                  </div>
                  
                  <p className={`mt-1 text-sm ${!alert.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                    {alert.message}
                  </p>
                  
                  <div className="mt-4 flex items-center gap-4">
                    {!alert.isRead && (
                      <button 
                        onClick={() => handleMarkAsRead(alert.id)}
                        className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Mark as read
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(alert.id)}
                      className="text-xs font-medium text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Dismiss
                    </button>
                    
                    {/* Badge */}
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                      alert.type === 'academic' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                      alert.type === 'system' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                      alert.type === 'alert' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    }`}>
                      {alert.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
