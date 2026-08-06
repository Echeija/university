import React from 'react';
import { Video } from 'lucide-react';

export default function LecturerVideoUpload() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center">
        <Video className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Video Upload</h2>
        <p className="text-slate-500 dark:text-slate-400">Upload recorded lectures and supplementary video materials.</p>
      </div>
    </div>
  );
}
