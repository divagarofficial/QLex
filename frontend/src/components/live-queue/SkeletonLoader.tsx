"use client";

export default function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-obsidian py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-xl bg-white/10" />
          <div className="h-4 w-64 rounded-lg bg-white/5" />
        </div>
        <div className="h-10 w-28 rounded-xl bg-white/10" />
      </div>

      {/* Overview Cards Skeleton (6 cards) */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-white/[0.04] border border-white/10 p-4 space-y-3"
          >
            <div className="h-3 w-16 rounded bg-white/10" />
            <div className="h-6 w-20 rounded bg-white/10" />
            <div className="h-2 w-12 rounded bg-white/5" />
          </div>
        ))}
      </div>

      {/* Hero & Position Cards Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-3xl bg-white/[0.04] border border-white/10 p-6 space-y-4">
          <div className="h-4 w-32 rounded bg-white/10" />
          <div className="h-12 w-48 rounded bg-white/10" />
          <div className="h-4 w-full rounded bg-white/5" />
          <div className="h-3 w-3/4 rounded bg-white/5" />
        </div>
        <div className="h-64 rounded-3xl bg-white/[0.04] border border-white/10 p-6 space-y-4">
          <div className="h-4 w-32 rounded bg-white/10" />
          <div className="h-12 w-48 rounded bg-white/10" />
          <div className="h-4 w-full rounded bg-white/5" />
          <div className="h-3 w-3/4 rounded bg-white/5" />
        </div>
      </div>

      {/* Timeline Skeleton */}
      <div className="h-36 rounded-3xl bg-white/[0.04] border border-white/10 p-6" />

      {/* Queue List & Shop Status Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-80 rounded-3xl bg-white/[0.04] border border-white/10 p-6" />
        <div className="h-80 rounded-3xl bg-white/[0.04] border border-white/10 p-6" />
      </div>
    </div>
  );
}
