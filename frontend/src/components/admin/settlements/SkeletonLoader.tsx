"use client";

export default function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Overview Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-slate-900/60 border border-slate-800/80 p-4 space-y-3"
          >
            <div className="h-3 w-24 bg-slate-800 rounded" />
            <div className="h-6 w-32 bg-slate-800 rounded" />
            <div className="h-3 w-20 bg-slate-800/60 rounded" />
          </div>
        ))}
      </div>

      {/* Analytics Bar Skeleton */}
      <div className="h-20 rounded-2xl bg-slate-900/60 border border-slate-800/80 p-4" />

      {/* Search & Filter Bar Skeleton */}
      <div className="h-14 rounded-2xl bg-slate-900/60 border border-slate-800/80 p-4" />

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-72 rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 space-y-4"
          >
            <div className="flex justify-between items-center">
              <div className="h-4 w-32 bg-slate-800 rounded" />
              <div className="h-6 w-20 bg-slate-800 rounded-full" />
            </div>
            <div className="h-16 bg-slate-950/60 border border-slate-800 rounded-xl" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-slate-800/60 rounded" />
              <div className="h-3 w-3/4 bg-slate-800/60 rounded" />
            </div>
            <div className="h-10 bg-slate-800/40 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
