import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, Users, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { format } from 'date-fns';

export default function ClinicSurveyResultsWidget() {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentSurveys, setRecentSurveys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [statsRes, surveysRes] = await Promise.all([
        fetch('/api/clinic/surveys/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/clinic/surveys', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (statsRes.ok) setStats(await statsRes.json());
      if (surveysRes.ok) setRecentSurveys(await surveysRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="h-64 animate-pulse bg-slate-100 dark:bg-slate-700 rounded-xl"></div>;
  if (!stats || !stats.totalSurveys || stats.totalSurveys === '0') return null;

  const chartData = [
    { category: 'Wait Time', score: Number(stats.avgWaitTime) },
    { category: 'Cleanliness', score: Number(stats.avgCleanliness) },
    { category: 'Staff', score: Number(stats.avgStaff) },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Clinic Patient Satisfaction
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Based on {stats.totalSurveys} student ratings
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-bold text-lg">
            {Number(stats.avgOverall).toFixed(1)} <Star className="w-4 h-4 fill-current" />
          </div>
          <span className="text-xs text-slate-400 mt-1">Overall Rating</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-6 border-r border-slate-100 dark:border-slate-700">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Category Breakdown
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 5]} tickCount={6} tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis dataKey="category" type="category" tick={{fontSize: 11, fill: '#475569', fontWeight: 500}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="score" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="p-6 bg-slate-50/30 dark:bg-slate-800/30">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500" /> Recent Comments
          </h4>
          <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {recentSurveys.filter(s => s.comments).length > 0 ? (
              recentSurveys.filter(s => s.comments).slice(0, 5).map(survey => (
                <div key={survey.id} className="bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-100 dark:border-slate-600">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{survey.studentName || 'Anonymous'}</span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < survey.overallRating ? 'fill-current' : 'text-slate-200 dark:text-slate-600'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{survey.comments}"</p>
                  <p className="text-[10px] text-slate-400 mt-2">{format(new Date(survey.createdAt), 'MMM d, yyyy')}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 italic">No comments yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
