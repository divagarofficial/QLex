"use client";

export default function SkeletonLoader() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center pb-6 border-b border-white/10">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-white/10 rounded-full" />
          <div className="h-8 w-48 bg-white/10 rounded-xl" />
          <div className="h-4 w-64 bg-white/5 rounded-lg" />
        </div>
        <div className="h-10 w-28 bg-white/10 rounded-xl" />
      </div>

      {/* Overview Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-white/[0.03] border border-white/10 p-5 space-y-4"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-white/10 rounded" />
              <div className="h-8 w-8 bg-white/10 rounded-xl" />
            </div>
            <div className="h-7 w-32 bg-white/10 rounded-lg" />
            <div className="h-3 w-28 bg-white/5 rounded" />
          </div>
        ))}
      </div>

      {/* Hero Card Skeleton */}
      <div className="h-64 rounded-3xl bg-white/[0.03] border border-white/10 p-8 space-y-6">
        <div className="flex gap-3">
          <div className="h-6 w-36 bg-white/10 rounded-full" />
          <div className="h-6 w-28 bg-white/10 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-40 bg-white/5 rounded" />
          <div className="h-10 w-56 bg-white/10 rounded-xl" />
        </div>
        <div className="flex gap-4">
          <div className="h-12 w-48 bg-white/5 rounded-xl" />
          <div className="h-12 w-48 bg-white/5 rounded-xl" />
        </div>
      </div>

      {/* History List Skeleton */}
      <div className="space-y-4">
        <div className="h-14 rounded-2xl bg-white/[0.03] border border-white/10" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-white/[0.03] border border-white/10 p-5 space-y-3"
          >
            <div className="flex justify-between">
              <div className="h-5 w-48 bg-white/10 rounded-lg" />
              <div className="h-5 w-24 bg-white/10 rounded-full" />
            </div>
            <div className="h-6 w-32 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
