"use client";

import React from "react";

export default function SkeletonLoader() {
  return (
    <div className="w-full max-w-[1300px] mx-auto p-4 md:p-6 lg:p-8 animate-pulse space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-white/10 rounded-xl" />
          <div className="h-4 w-96 bg-white/5 rounded-lg" />
        </div>
        <div className="h-10 w-72 bg-white/10 rounded-xl" />
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Skeleton */}
        <div className="lg:col-span-3 space-y-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-12 w-full bg-white/5 rounded-xl border border-white/[0.05]" />
          ))}
        </div>

        {/* Content Panel Skeleton */}
        <div className="lg:col-span-9 space-y-6">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-6">
            <div className="h-6 w-48 bg-white/10 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-32 bg-white/10 rounded" />
                  <div className="h-11 w-full bg-white/5 rounded-xl border border-white/10" />
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <div className="h-6 w-40 bg-white/10 rounded-lg" />
            <div className="h-20 w-full bg-white/5 rounded-xl border border-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
