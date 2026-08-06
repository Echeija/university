import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function LecturerPerformanceAnalytics() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
        <BarChart3 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Performance Analytics</h2>
        <p className="text-slate-500 dark:text-slate-400">View detailed analytics on student performance and course engagement.</p>
      </div>
    </div>
  );
}
