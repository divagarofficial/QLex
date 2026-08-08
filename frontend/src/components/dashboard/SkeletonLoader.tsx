"use client";

import { cn } from "@/lib/utils";

// ── Base shimmer animation ────────────────────────────────────────
function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white/[0.03]",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_2s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/[0.04] before:to-transparent",
        className
      )}
    />
  );
}

// ── Dashboard Header Skeleton ─────────────────────────────────────
export function DashboardHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-4">
        <Shimmer className="h-10 w-10 rounded-xl" />
        <Shimmer className="h-5 w-24" />
      </div>
      <div className="flex items-center gap-3">
        <Shimmer className="h-9 w-9 rounded-full" />
        <Shimmer className="h-9 w-9 rounded-full" />
      </div>
    </div>
  );
}

// ── Welcome Card Skeleton ─────────────────────────────────────────
export function WelcomeCardSkeleton() {
  return (
    <div className="deep-glass relative overflow-hidden p-8">
      <div className="deep-glass-reflection" />
      <div className="relative z-10 space-y-4">
        <Shimmer className="h-4 w-32" />
        <Shimmer className="h-8 w-64" />
        <Shimmer className="h-4 w-48" />
        <div className="flex gap-4 pt-2">
          <Shimmer className="h-4 w-24" />
          <Shimmer className="h-4 w-20" />
          <Shimmer className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

// ── Quick Navigation Card Skeleton ────────────────────────────────
export function NavCardSkeleton() {
  return (
    <div className="deep-glass relative overflow-hidden p-5">
      <div className="deep-glass-reflection" />
      <div className="relative z-10 space-y-3">
        <Shimmer className="h-12 w-12 rounded-2xl" />
        <Shimmer className="h-5 w-24" />
        <Shimmer className="h-3 w-32" />
      </div>
    </div>
  );
}

// ── Active Order Card Skeleton ────────────────────────────────────
export function ActiveOrderSkeleton() {
  return (
    <div className="deep-glass relative overflow-hidden p-8">
      <div className="deep-glass-reflection" />
      <div className="relative z-10 space-y-4">
        <Shimmer className="h-6 w-40" />
        <div className="grid grid-cols-2 gap-4">
          <Shimmer className="h-14 rounded-xl" />
          <Shimmer className="h-14 rounded-xl" />
          <Shimmer className="h-14 rounded-xl" />
          <Shimmer className="h-14 rounded-xl" />
        </div>
        <div className="flex gap-3 pt-2">
          <Shimmer className="h-10 w-32 rounded-xl" />
          <Shimmer className="h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Stat Card Skeleton ────────────────────────────────────────────
export function StatCardSkeleton() {
  return (
    <div className="deep-glass relative overflow-hidden p-5">
      <div className="deep-glass-reflection" />
      <div className="relative z-10 space-y-3">
        <Shimmer className="h-8 w-8 rounded-full" />
        <Shimmer className="h-7 w-16" />
        <Shimmer className="h-3 w-20" />
      </div>
    </div>
  );
}

// ── Recent Activity Skeleton ──────────────────────────────────────
export function RecentActivitySkeleton() {
  return (
    <div className="deep-glass relative overflow-hidden p-8">
      <div className="deep-glass-reflection" />
      <div className="relative z-10 space-y-4">
        <Shimmer className="h-6 w-32" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Shimmer className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-4 w-48" />
              <Shimmer className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Full Page Skeleton ────────────────────────────────────────────
export default function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-obsidian">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <DashboardHeaderSkeleton />
        <div className="mt-8 space-y-8">
          <WelcomeCardSkeleton />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <NavCardSkeleton key={i} />
            ))}
          </div>
          <ActiveOrderSkeleton />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RecentActivitySkeleton />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

