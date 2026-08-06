import React, { useState, useEffect } from 'react';
import { Activity, Clock, FileText, Globe, Newspaper } from 'lucide-react';
import { cmsService } from '../../services/cmsService';

export default function AdminActivityLog() {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    setIsLoading(true);
    try {
      const data = await cmsService.getRecentActivity(15);
      setActivities(data);
    } catch (error) {
      if (error.message !== "Failed to fetch") console.error("Failed to fetch activity log:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (type: string) => {
    if (type.includes('Content Block')) return <Globe className="w-4 h-4 text-indigo-500" />;
    if (type.includes('News Article')) return <Newspaper className="w-4 h-4 text-emerald-500" />;
    return <FileText className="w-4 h-4 text-amber-500" />;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown Date';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          Recent Activity
        </h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          Recent CMS Activity
        </h2>
        <button 
          onClick={fetchActivity}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
        >
          Refresh
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <p>No recent activity found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent hidden"></div>
          
          <div className="relative space-y-4">
            {activities.map((activity, index) => (
              <div key={activity.id} className="relative flex items-start gap-4">
                <div className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                  {getIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {activity.title}
                    </p>
                    <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(activity.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {activity.type}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {activity.action} ({activity.status})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
