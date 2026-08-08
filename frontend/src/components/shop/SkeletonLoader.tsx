"use client";

export default function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Welcome Card Skeleton */}
      <div className="deep-glass h-32 w-full rounded-3xl border border-white/10 bg-white/5" />

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="deep-glass h-36 rounded-3xl border border-white/10 bg-white/5"
          />
        ))}
      </div>

      {/* Hero Card Skeleton */}
      <div className="deep-glass h-96 w-full rounded-3xl border border-amber-400/20 bg-white/5" />

      {/* Queue Overview Skeleton */}
      <div className="deep-glass h-40 w-full rounded-3xl border border-white/10 bg-white/5" />
    </div>
  );
}
