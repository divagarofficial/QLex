"use client";

export default function SkeletonLoader() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      {/* Welcome Card Skeleton */}
      <div className="h-44 w-full rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8" />

      {/* Overview Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-5"
          />
        ))}
      </div>

      {/* Live Activity Card Skeleton */}
      <div className="h-56 w-full rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8" />

      {/* Feeds Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-80 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6" />
        <div className="h-80 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6" />
      </div>
    </div>
  );
}
