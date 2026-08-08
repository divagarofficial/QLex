"use client";

export default function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Overview Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-900/60 border border-slate-800 p-4" />
        ))}
      </div>

      {/* Search & Filter Bar Skeleton */}
      <div className="h-12 rounded-2xl bg-slate-900/60 border border-slate-800" />

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800 p-5" />
        ))}
      </div>
    </div>
  );
}
