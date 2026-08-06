import React from 'react';

interface SkeletonProps {
  type?: 'card' | 'table' | 'list' | 'text' | 'profile';
  count?: number;
  className?: string;
}

export default function SkeletonLoader({ type = 'card', count = 1, className = '' }: SkeletonProps) {
  const elements = Array.from({ length: count }, (_, i) => i);

  if (type === 'table') {
    return (
      <div className={`w-full ${className}`}>
        <div className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
          <div className="h-14 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 animate-pulse"></div>
          {elements.map((key) => (
            <div key={key} className="flex p-4 border-b border-slate-100 dark:border-slate-700/50 animate-pulse items-center">
              <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-700 rounded mr-4"></div>
              <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-700 rounded mr-4"></div>
              <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-700 rounded mr-4 hidden md:block"></div>
              <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-700 rounded hidden lg:block"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 ${className}`}>
        {elements.map((key) => (
          <div key={key} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 animate-pulse">
            <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-700 mb-4"></div>
            <div className="h-5 w-1/2 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
            <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-600 rounded"></div>
            <div className="mt-6 flex justify-between">
              <div className="h-8 w-20 bg-slate-100 dark:bg-slate-600 rounded"></div>
              <div className="h-8 w-20 bg-slate-100 dark:bg-slate-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 animate-pulse ${className}`}>
        <div className="flex items-center gap-6 mb-6">
          <div className="h-20 w-20 rounded-full bg-slate-200 dark:bg-slate-700"></div>
          <div className="flex-1">
            <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
            <div className="h-4 w-1/4 bg-slate-100 dark:bg-slate-600 rounded"></div>
          </div>
        </div>
        <div className="space-y-3 mt-6">
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-700 rounded"></div>
          <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-700 rounded"></div>
          <div className="h-4 w-4/6 bg-slate-100 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className={`space-y-4 ${className}`}>
        {elements.map((key) => (
          <div key={key} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex gap-4 animate-pulse">
            <div className="h-12 w-12 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0"></div>
            <div className="flex-1 py-1">
              <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
              <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {elements.map((key) => (
        <div key={key} className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
      ))}
    </div>
  );
}
