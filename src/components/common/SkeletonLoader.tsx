import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 space-y-4 animate-pulse">
      <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-1/3" />
      <div className="h-6 bg-stone-200 dark:bg-stone-800 rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-full" />
        <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-5/6" />
      </div>
      <div className="h-10 bg-stone-200 dark:bg-stone-800 rounded-xl w-full" />
    </div>
  );
};

export const StylistSkeleton: React.FC = () => {
  return (
    <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-xl border border-amber-200 dark:border-amber-900/40 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-amber-200 dark:bg-amber-900/60 rounded w-2/5" />
        <div className="h-4 bg-amber-200 dark:bg-amber-900/60 rounded w-1/5" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-full" />
        <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-4/5" />
      </div>
      <div className="h-8 bg-amber-300/40 dark:bg-amber-900/40 rounded-lg w-full" />
    </div>
  );
};
