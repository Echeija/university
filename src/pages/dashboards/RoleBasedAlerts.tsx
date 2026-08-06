import React, { useState, useEffect } from 'react';
import { AlertCircle, Info, Bell, X, BookOpen, Settings, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'urgent';
  icon?: React.ReactNode;
  time?: string;
}

export default function RoleBasedAlerts({ role }: { role: string }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Simulate real-time alerts based on role
    let initialAlerts: Alert[] = [];

    if (['Student', 'Applicant'].includes(role)) {
      initialAlerts = [
        {
          id: '1',
          title: 'Assignment Deadline',
          message: 'Advanced Mathematics 202 is due tomorrow at 11:59 PM.',
          type: 'warning',
          icon: <BookOpen className="w-5 h-5" />,
          time: 'Just now'
        },
        {
          id: '2',
          title: 'Course Registration',
          message: 'Registration for the new semester is now open.',
          type: 'info',
          icon: <Info className="w-5 h-5" />,
          time: '2 hours ago'
        }
      ];
    } else if (['Administrator', 'Admin', 'ICT Admin', 'Portal'].includes(role)) {
      initialAlerts = [
        {
          id: '1',
          title: 'System Update',
          message: 'Portal maintenance scheduled for 10:00 PM tonight.',
          type: 'warning',
          icon: <Settings className="w-5 h-5" />,
          time: '10 mins ago'
        },
        {
          id: '2',
          title: 'Security Alert',
          message: 'Multiple failed login attempts detected from IP 192.168.1.100.',
          type: 'urgent',
          icon: <ShieldAlert className="w-5 h-5" />,
          time: '1 hour ago'
        }
      ];
    } else if (['Lecturer', 'HOD', 'Dean'].includes(role)) {
      initialAlerts = [
        {
          id: '1',
          title: 'New Submissions',
          message: '15 students have submitted their physics lab reports.',
          type: 'info',
          icon: <Bell className="w-5 h-5" />,
          time: '5 mins ago'
        },
        {
          id: '2',
          title: 'Department Meeting',
          message: 'Faculty meeting at 2:00 PM in Room 301.',
          type: 'warning',
          icon: <AlertCircle className="w-5 h-5" />,
          time: '3 hours ago'
        }
      ];
    } else {
      initialAlerts = [
        {
          id: '1',
          title: 'Welcome',
          message: 'Check your pending tasks for the day.',
          type: 'info',
          icon: <Info className="w-5 h-5" />,
          time: 'Just now'
        }
      ];
    }

    setAlerts(initialAlerts);

    // Simulate receiving a real-time notification after some time
    const timer = setTimeout(() => {
      const newAlert: Alert = {
        id: Date.now().toString(),
        title: 'New Notification',
        message: 'You have a new message from the administration.',
        type: 'info',
        icon: <Bell className="w-5 h-5" />,
        time: 'Just now'
      };
      setAlerts(prev => [newAlert, ...prev]);
    }, 10000);

    return () => clearTimeout(timer);
  }, [role]);

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="mb-8 space-y-3">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={`relative p-4 pr-12 rounded-xl border flex gap-4 items-start ${
              alert.type === 'urgent'
                ? 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/30'
                : alert.type === 'warning'
                ? 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30'
                : 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30'
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${
              alert.type === 'urgent'
                ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400'
                : alert.type === 'warning'
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400'
                : 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
            }`}>
              {alert.icon || <Bell className="w-5 h-5" />}
            </div>
            
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-bold text-sm ${
                  alert.type === 'urgent'
                    ? 'text-red-900 dark:text-red-300'
                    : alert.type === 'warning'
                    ? 'text-amber-900 dark:text-amber-300'
                    : 'text-blue-900 dark:text-blue-300'
                }`}>
                  {alert.title}
                </h4>
                {alert.time && (
                  <span className={`text-xs ${
                    alert.type === 'urgent'
                      ? 'text-red-600/70 dark:text-red-400/70'
                      : alert.type === 'warning'
                      ? 'text-amber-600/70 dark:text-amber-400/70'
                      : 'text-blue-600/70 dark:text-blue-400/70'
                  }`}>
                    • {alert.time}
                  </span>
                )}
              </div>
              <p className={`text-sm ${
                alert.type === 'urgent'
                  ? 'text-red-800 dark:text-red-200'
                  : alert.type === 'warning'
                  ? 'text-amber-800 dark:text-amber-200'
                  : 'text-blue-800 dark:text-blue-200'
              }`}>
                {alert.message}
              </p>
            </div>

            <button
              onClick={() => dismissAlert(alert.id)}
              className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors opacity-70 hover:opacity-100 ${
                alert.type === 'urgent'
                  ? 'hover:bg-red-100 text-red-700 dark:hover:bg-red-900/50 dark:text-red-300'
                  : alert.type === 'warning'
                  ? 'hover:bg-amber-100 text-amber-700 dark:hover:bg-amber-900/50 dark:text-amber-300'
                  : 'hover:bg-blue-100 text-blue-700 dark:hover:bg-blue-900/50 dark:text-blue-300'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
