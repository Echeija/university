import React, { useState, useEffect } from 'react';
import { Activity, Plus, ShieldAlert, Bell, Sparkles, X, HeartPulse } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export default function ManageCampusWellnessFeed() {
  const { token } = useAuth();
  const { notify } = useNotification();
  const [feed, setFeed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Announcement',
    isPublished: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      notify({ title: 'Error', message: 'Title and content are required', type: 'error' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/clinic/wellness-feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Wellness post published', type: 'success' });
        setIsAdding(false);
        setFormData({ title: '', content: '', category: 'Announcement', isPublished: true });
        fetchFeed();
      } else {
        notify({ title: 'Error', message: 'Failed to publish post', type: 'error' });
      }
    } catch (e) {
      notify({ title: 'Error', message: 'An error occurred', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Alert': return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'Announcement': return <Bell className="w-4 h-4 text-indigo-500" />;
      case 'Tip': return <Sparkles className="w-4 h-4 text-emerald-500" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-rose-500" />
          Campus Wellness Feed Manager
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Post
          </button>
        )}
      </div>

      {isAdding ? (
        <form onSubmit={handleSave} className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-2 border-b border-slate-100 dark:border-slate-700 pb-2">
            <h4 className="font-medium text-slate-800 dark:text-slate-200">Publish New Update</h4>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
              <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-rose-500" placeholder="e.g. Seasonal Flu Vaccines Available" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
              <textarea rows={3} required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-rose-500" placeholder="Details of the announcement..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-rose-500">
                <option value="Announcement">Announcement</option>
                <option value="Alert">Alert (e.g. Health Advisory)</option>
                <option value="Tip">Wellness Tip</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors disabled:opacity-50">
              {isSubmitting ? 'Publishing...' : 'Publish to Feed'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              {[1, 2].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700 rounded-xl"></div>)}
            </div>
          ) : feed.length > 0 ? (
            feed.slice(0, 5).map(post => (
              <div key={post.id} className="p-3 border border-slate-100 dark:border-slate-700 rounded-lg flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    {getCategoryIcon(post.category)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{post.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-500">{post.category}</span>
                      <span className="text-[10px] text-slate-400">• Published</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">No recent wellness feed posts.</p>
          )}
        </div>
      )}
    </div>
  );
}
