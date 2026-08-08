"use client";

export default function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-obsidian py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded-xl bg-white/10" />
          <div className="h-4 w-60 rounded-lg bg-white/5" />
        </div>
        <div className="h-10 w-24 rounded-xl bg-white/10" />
      </div>

      {/* Overview Cards Skeleton (5 cards) */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
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

      {/* Pending Payments Skeleton */}
      <div className="h-44 rounded-3xl bg-white/[0.04] border border-white/10 p-6 space-y-4" />

      {/* History Table Skeleton */}
      <div className="h-96 rounded-3xl bg-white/[0.04] border border-white/10 p-6 space-y-4" />
    </div>
  );
}
