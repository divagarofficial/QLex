"use client";

import { motion } from "framer-motion";

export default function SkeletonLoader() {
  return (
    <div className="w-full max-w-[1000px] mx-auto space-y-6 pb-24 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-white/10 rounded-md" />
          <div className="h-8 w-48 bg-white/10 rounded-lg" />
          <div className="h-4 w-72 bg-white/5 rounded-md" />
        </div>
        <div className="h-7 w-36 bg-white/10 rounded-full" />
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="h-3 w-16 bg-white/10 rounded" />
            <div className="h-6 w-20 bg-white/20 rounded-md" />
          </div>
        ))}
      </div>

      {/* Main Content Cards Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
          <div className="h-6 w-40 bg-white/10 rounded-md" />
          <div className="space-y-3">
            <div className="h-12 w-full bg-white/5 rounded-xl" />
            <div className="h-12 w-full bg-white/5 rounded-xl" />
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
          <div className="h-6 w-40 bg-white/10 rounded-md" />
          <div className="space-y-3">
            <div className="h-12 w-full bg-white/5 rounded-xl" />
            <div className="h-12 w-full bg-white/5 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Additional Charges Skeleton */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
        <div className="h-6 w-44 bg-white/10 rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-12 w-full bg-white/5 rounded-xl" />
          <div className="h-12 w-full bg-white/5 rounded-xl" />
          <div className="h-12 w-full bg-white/5 rounded-xl" />
        </div>
      </div>

      {/* Calculator Skeleton */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
        <div className="h-6 w-36 bg-white/10 rounded-md" />
        <div className="h-24 w-full bg-white/5 rounded-xl" />
      </div>
    </div>
  );
}
