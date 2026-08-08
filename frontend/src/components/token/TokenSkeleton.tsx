"use client";

import BackgroundEffects from "./BackgroundEffects";

export default function TokenSkeleton() {
  return (
    <div className="min-h-screen bg-[#030406] text-white relative overflow-x-hidden flex flex-col justify-between">
      <BackgroundEffects />

      {/* Header Skeleton */}
      <div className="relative z-10 w-full max-w-6xl mx-auto pt-6 pb-4 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 animate-pulse" />
          <div className="space-y-2">
            <div className="w-32 h-6 rounded-lg bg-white/10 animate-pulse" />
            <div className="w-48 h-4 rounded-md bg-white/5 animate-pulse" />
          </div>
        </div>
        <div className="w-36 h-10 rounded-xl bg-white/5 animate-pulse" />
      </div>

      {/* Success Title Skeleton */}
      <div className="relative z-10 w-full max-w-2xl mx-auto text-center py-6 px-4 space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-white/10 animate-pulse mx-auto" />
        <div className="w-64 h-8 rounded-xl bg-white/10 animate-pulse mx-auto" />
        <div className="w-96 max-w-full h-4 rounded-md bg-white/5 animate-pulse mx-auto" />
      </div>

      {/* Main Layout Grid Skeleton */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column Skeleton */}
          <div className="lg:col-span-5 w-full">
            <div className="w-full h-[480px] rounded-[32px] bg-white/[0.03] border border-white/10 p-8 flex flex-col items-center justify-between animate-pulse">
              <div className="w-full flex justify-between">
                <div className="w-24 h-6 rounded-full bg-white/10" />
                <div className="w-28 h-6 rounded-full bg-white/10" />
              </div>
              <div className="w-48 h-16 rounded-2xl bg-white/10" />
              <div className="w-48 h-48 rounded-2xl bg-white/10" />
              <div className="w-64 h-4 rounded-md bg-white/10" />
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-7 w-full space-y-6">
            <div className="w-full h-36 rounded-3xl bg-white/[0.03] border border-white/10 p-6 animate-pulse" />
            <div className="w-full h-64 rounded-3xl bg-white/[0.03] border border-white/10 p-6 animate-pulse" />
            <div className="w-full h-48 rounded-3xl bg-white/[0.03] border border-white/10 p-6 animate-pulse" />
          </div>

        </div>
      </main>

      {/* Shimmer CSS */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
