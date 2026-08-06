import React from 'react';
import { BookText } from 'lucide-react';

export default function LecturerAssignments() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
        <BookText className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Assignments</h2>
        <p className="text-slate-500 dark:text-slate-400">Create, collect, and grade student assignments.</p>
      </div>
    </div>
  );
}
