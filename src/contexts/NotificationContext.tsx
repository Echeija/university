import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  title: string;
  message?: string;
  type: NotificationType;
  duration?: number;
}

interface NotificationContextType {
  notify: (notification: Omit<Notification, 'id'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications((prev) => [...prev, newNotification]);

    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {notifications.map((n) => (
          <div 
            key={n.id} 
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border w-80 animate-in slide-in-from-right-full fade-in duration-300 ${
              n.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-800/50 dark:text-emerald-300' :
              n.type === 'error' ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/40 dark:border-red-800/50 dark:text-red-300' :
              n.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/40 dark:border-amber-800/50 dark:text-amber-300' :
              'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/40 dark:border-blue-800/50 dark:text-blue-300'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {n.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {n.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {n.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {n.type === 'info' && <Info className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">{n.title}</h4>
              {n.message && <p className="text-xs opacity-90 mt-1 whitespace-pre-line">{n.message}</p>}
            </div>
            <button 
              onClick={() => removeNotification(n.id)}
              className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
