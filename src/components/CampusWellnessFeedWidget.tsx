import React, { useState, useEffect } from 'react';
import { HeartPulse, Bell, Info, ShieldAlert, Sparkles, ChevronRight, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

export default function CampusWellnessFeedWidget() {
  const { token } = useAuth();
  const [feed, setFeed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, [token]);

  const fetchFeed = async () => {
    try {
      const res = await fetch('/api/clinic/wellness-feed', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setFeed(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Alert': return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'Announcement': return <Bell className="w-5 h-5 text-indigo-500" />;
      case 'Tip': return <Sparkles className="w-5 h-5 text-emerald-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Alert': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Announcement': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Tip': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Activity className="w-5 h-5 text-rose-500" />
          Campus Wellness Feed
        </h3>
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center">
          View All <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-slate-100 dark:bg-slate-700 rounded-xl"></div>
            ))}
          </div>
        ) : feed.length > 0 ? (
          feed.map(post => (
            <div key={post.id} className="p-4 border border-slate-100 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getCategoryIcon(post.category)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      {format(new Date(post.createdAt), 'MMM d')}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">{post.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{post.content}</p>
                  
                  {post.authorName && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <HeartPulse className="w-3.5 h-3.5" /> By {post.authorName}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <HeartPulse className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium mb-1">No recent wellness updates</p>
            <p className="text-sm text-slate-400">Check back later for clinic announcements</p>
          </div>
        )}
      </div>
    </div>
  );
}
