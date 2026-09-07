import React, { useState, useEffect } from 'react';
import { Target, Trophy, BookOpen, CheckCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function CourseProgressWidget() {
  const { token } = useAuth();
  const [progressData, setProgressData] = useState({
    totalRegisteredCredits: 0,
    earnedCredits: 0,
    passedSubjects: 0,
    totalRegisteredSubjects: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, [token]);

  const fetchProgress = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/student/progress', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setProgressData(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const { totalRegisteredCredits, earnedCredits, passedSubjects, totalRegisteredSubjects } = progressData;
  
  // Calculate percentage
  const percentage = totalRegisteredCredits > 0 
    ? Math.round((earnedCredits / totalRegisteredCredits) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Target className="w-32 h-32 text-indigo-500" />
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Degree Progress</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Course completion tracking</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {percentage}%
            </span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span className="text-slate-600 dark:text-slate-300">Credits Earned</span>
            <span className="text-slate-800 dark:text-slate-200">{earnedCredits} / {totalRegisteredCredits || '-'}</span>
          </div>
          <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/20 -skew-x-12 translate-x-4"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Passed Subjects</span>
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {passedSubjects} <span className="text-sm font-medium text-slate-400">/ {totalRegisteredSubjects}</span>
            </div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/30">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Earned Credits</span>
            </div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {earnedCredits}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
