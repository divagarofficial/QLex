"use client";

export default function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-2xl bg-white/10" />
          <div className="space-y-2">
            <div className="h-7 w-36 rounded-xl bg-white/10" />
            <div className="h-4 w-56 rounded-lg bg-white/5" />
          </div>
        </div>
        <div className="h-9 w-28 rounded-xl bg-white/10" />
      </div>

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md"
          >
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 rounded bg-white/10" />
              <div className="h-8 w-8 rounded-xl bg-white/10" />
            </div>
            <div className="mt-4 h-8 w-16 rounded bg-white/10" />
          </div>
        ))}
      </div>

      {/* Search and filter skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="h-11 flex-1 rounded-2xl bg-white/5 border border-white/10" />
        <div className="h-11 w-48 rounded-2xl bg-white/5 border border-white/10" />
      </div>

      {/* Cards list skeleton */}
      <div className="space-y-4 pt-2">
        <div className="h-6 w-40 rounded bg-white/10" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl space-y-4"
          >
            <div className="flex justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-14 rounded-2xl bg-white/10" />
                <div className="space-y-2">
                  <div className="h-5 w-32 rounded bg-white/10" />
                  <div className="h-3 w-40 rounded bg-white/5" />
                </div>
              </div>
              <div className="h-7 w-24 rounded-full bg-white/10" />
            </div>
            <div className="h-14 rounded-2xl bg-white/5" />
            <div className="flex justify-between pt-2">
              <div className="h-5 w-28 rounded bg-white/10" />
              <div className="flex gap-2">
                <div className="h-8 w-24 rounded-xl bg-white/10" />
                <div className="h-8 w-24 rounded-xl bg-white/10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
