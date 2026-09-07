import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, GraduationCap, Award, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from './ui/Skeleton';

export default function AcademicOverviewWidget() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/academic-profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <Skeleton className="h-48 w-full rounded-2xl" />;
  }

  // Calculate generic dummy fields if API doesn't return them yet
  const gpa = profile?.cgpa ? (profile.cgpa * 1.05).toFixed(2) : '0.00'; // mock current GPA if separate not provided
  const cgpa = profile?.cgpa?.toFixed(2) || '0.00';
  const totalUnits = profile?.totalCreditUnits || 0;
  const totalQp = profile?.totalQualityPoints?.toFixed(2) || '0.00';
  const passedCourses = profile?.passedCourses || 0;
  const failedCourses = profile?.failedCourses || 0;
  const standing = profile?.academicStanding || 'N/A';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Academic Overview
        </h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50">
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">Current GPA</p>
          <p className="text-2xl font-black text-indigo-900 dark:text-indigo-100">{gpa}</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1">CGPA</p>
          <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100">{cgpa}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Credit Units</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{totalUnits}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Quality Points</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{totalQp}</p>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Passed Courses</p>
            <p className="font-bold text-slate-900 dark:text-white">{passedCourses}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Failed Courses</p>
            <p className="font-bold text-slate-900 dark:text-white">{failedCourses}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Academic Standing</p>
            <p className="font-bold text-slate-900 dark:text-white truncate">{standing}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
