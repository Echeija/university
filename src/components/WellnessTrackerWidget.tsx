import React, { useState, useEffect } from 'react';
import { Activity, Droplets, Moon, Utensils, Heart, Plus, TrendingUp, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { format, subDays } from 'date-fns';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function WellnessTrackerWidget() {
  const { token, user } = useAuth();
  const { notify } = useNotification();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLogging, setIsLogging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    mood: 3,
    sleepHours: 7,
    nutritionQuality: 3,
    waterIntake: 4,
    exerciseMinutes: 30,
    notes: ''
  });

  useEffect(() => {
    fetchLogs();
  }, [token]);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/wellness', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.reverse()); // Reverse to get oldest to newest for chart
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/wellness', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        notify({ title: 'Success', message: 'Wellness log saved', type: 'success' });
        setIsLogging(false);
        fetchLogs();
      } else {
        notify({ title: 'Error', message: 'Failed to save log', type: 'error' });
      }
    } catch (e) {
      notify({ title: 'Error', message: 'An error occurred', type: 'error' });
    }
  };

  // Prepare chart data (last 7 days if available)
  const chartData = logs.slice(-7).map(log => ({
    date: format(new Date(log.date), 'MMM d'),
    mood: log.mood * 20, // scale to 100
    sleep: log.sleepHours * 10, // scale assuming 10 is max ideal
    exercise: log.exerciseMinutes
  }));

  const todayLog = logs.length > 0 && new Date(logs[logs.length - 1].date).toDateString() === new Date().toDateString() 
    ? logs[logs.length - 1] 
    : null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500" />
          My Wellness Tracker
        </h3>
        {!todayLog && !isLogging && (
          <button
            onClick={() => setIsLogging(true)}
            className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Log Today
          </button>
        )}
      </div>

      {isLogging ? (
        <form onSubmit={handleSave} className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-2 border-b border-slate-100 pb-2">
            <h4 className="font-medium text-slate-800 dark:text-slate-200">Daily Check-in</h4>
            <button type="button" onClick={() => setIsLogging(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Heart className="w-4 h-4 text-rose-500" /> Mood (1-5)
              </label>
              <input type="range" min="1" max="5" value={formData.mood} onChange={e => setFormData({...formData, mood: parseInt(e.target.value)})} className="w-full" />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Terrible</span>
                <span>Excellent</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Moon className="w-4 h-4 text-indigo-500" /> Sleep (Hours)
              </label>
              <input type="number" min="0" max="24" value={formData.sleepHours} onChange={e => setFormData({...formData, sleepHours: parseInt(e.target.value)})} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Utensils className="w-4 h-4 text-emerald-500" /> Nutrition (1-5)
              </label>
              <input type="range" min="1" max="5" value={formData.nutritionQuality} onChange={e => setFormData({...formData, nutritionQuality: parseInt(e.target.value)})} className="w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Droplets className="w-4 h-4 text-blue-500" /> Water (Glasses)
              </label>
              <input type="number" min="0" value={formData.waterIntake} onChange={e => setFormData({...formData, waterIntake: parseInt(e.target.value)})} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                <Activity className="w-4 h-4 text-orange-500" /> Exercise (Minutes)
              </label>
              <input type="number" min="0" value={formData.exerciseMinutes} onChange={e => setFormData({...formData, exerciseMinutes: parseInt(e.target.value)})} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500" />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Journal/Notes</label>
              <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500" placeholder="How are you feeling today?" />
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button type="submit" className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors">
              Save Entry
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {chartData.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                  <div className="flex items-center gap-2 text-rose-600 mb-1"><Heart className="w-4 h-4"/> <span className="text-xs font-semibold">Avg Mood</span></div>
                  <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
                    {Math.round(logs.slice(-7).reduce((acc, log) => acc + log.mood, 0) / Math.min(logs.length, 7) * 10) / 10} / 5
                  </div>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                  <div className="flex items-center gap-2 text-indigo-600 mb-1"><Moon className="w-4 h-4"/> <span className="text-xs font-semibold">Avg Sleep</span></div>
                  <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
                    {Math.round(logs.slice(-7).reduce((acc, log) => acc + log.sleepHours, 0) / Math.min(logs.length, 7) * 10) / 10} h
                  </div>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                  <div className="flex items-center gap-2 text-orange-600 mb-1"><Activity className="w-4 h-4"/> <span className="text-xs font-semibold">Avg Ex.</span></div>
                  <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
                    {Math.round(logs.slice(-7).reduce((acc, log) => acc + log.exerciseMinutes, 0) / Math.min(logs.length, 7))} m
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-600 mb-1"><Utensils className="w-4 h-4"/> <span className="text-xs font-semibold">Avg Nutri.</span></div>
                  <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
                    {Math.round(logs.slice(-7).reduce((acc, log) => acc + log.nutritionQuality, 0) / Math.min(logs.length, 7) * 10) / 10} / 5
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Weekly Trends
                </h4>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="mood" name="Mood Score" stroke="#f43f5e" fillOpacity={1} fill="url(#colorMood)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium mb-1">No wellness data yet</p>
              <p className="text-sm text-slate-400 mb-4">Start logging daily to see your health trends</p>
              <button
                onClick={() => setIsLogging(true)}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors"
              >
                Log First Entry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
