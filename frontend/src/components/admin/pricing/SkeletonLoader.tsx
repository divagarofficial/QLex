"use client";

export default function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Overview Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-900/60 border border-slate-800/80 p-4 space-y-3">
            <div className="h-3 w-20 bg-slate-800 rounded" />
            <div className="h-6 w-28 bg-slate-800 rounded" />
            <div className="h-3 w-16 bg-slate-800/60 rounded" />
          </div>
        ))}
      </div>

      {/* Main Cards Skeleton */}
      <div className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-4" />
      <div className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-4" />
      <div className="h-48 rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-4" />
    </div>
  );
}
