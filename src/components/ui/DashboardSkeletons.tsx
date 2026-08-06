import React from 'react';
import { Skeleton } from './Skeleton';

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>
      <Skeleton className="w-12 h-12 rounded-xl" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
      <Skeleton className="h-6 w-40 mb-4" />
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}

export function ActivityListSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="space-y-4 mt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 py-2 border-b border-slate-50 dark:border-slate-700 last:border-0">
            <Skeleton className="w-2 h-2 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
