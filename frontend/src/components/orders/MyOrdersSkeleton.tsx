"use client";

export default function MyOrdersSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-28 rounded-md bg-white/10" />
        <div className="h-8 w-48 rounded-lg bg-white/10" />
        <div className="h-4 w-72 rounded-md bg-white/5" />
      </div>

      {/* Stats Cards Skeleton (5 cards) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="deep-glass rounded-2xl border border-white/5 p-5 h-32 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 rounded bg-white/10" />
              <div className="h-8 w-8 rounded-xl bg-white/10" />
            </div>
            <div className="space-y-1.5">
              <div className="h-7 w-20 rounded-md bg-white/15" />
              <div className="h-3 w-24 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters Skeleton */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="h-11 flex-1 rounded-xl bg-white/10" />
          <div className="h-11 w-36 rounded-xl bg-white/10" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-24 rounded-full bg-white/5" />
          ))}
        </div>
      </div>

      {/* Order Cards Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="deep-glass rounded-2xl border border-white/5 p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10" />
                <div className="space-y-1.5">
                  <div className="h-5 w-36 rounded bg-white/10" />
                  <div className="h-3 w-48 rounded bg-white/5" />
                </div>
              </div>
              <div className="h-7 w-28 rounded-full bg-white/10" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-14 rounded-xl bg-white/5" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
