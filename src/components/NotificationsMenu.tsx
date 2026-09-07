import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: string;
  createdAt: string;
}

export default function NotificationsMenu() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { token, user } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: 'true' })));
    } catch (e) {
      console.error(e);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: 'true' } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => n.isRead === 'false').length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-full transition-colors relative"
      >
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-800"></span>
        )}
        <Bell className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
          <div className="flex flex-col border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Notifications</h3>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full font-medium">
                    {unreadCount} new
                  </span>
                )}
                <button 
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Mark all as read
                </button>
              </div>
            </div>
            <div className="flex px-2 pb-2 gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); setFilter('all'); }}
                className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${filter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
              >
                All
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setFilter('unread'); }}
                className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${filter === 'unread' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
              >
                Unread
              </button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 || (filter === 'unread' && unreadCount === 0) ? (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                No notifications yet.
              </div>
            ) : (
              notifications.filter(n => filter === 'all' || n.isRead === 'false').map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex gap-3 ${notification.isRead === 'false' ? 'bg-slate-50/50 dark:bg-slate-800' : 'opacity-70'}`}
                  onClick={() => notification.isRead === 'false' && markAsRead(notification.id)}
                >
                  <div className="shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notification.isRead === 'false' ? 'font-medium text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 whitespace-pre-line">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
