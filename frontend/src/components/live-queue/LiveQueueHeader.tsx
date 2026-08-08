"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw, Radio } from "lucide-react";
import { motion } from "framer-motion";

interface LiveQueueHeaderProps {
  lastUpdated: Date | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function LiveQueueHeader({
  lastUpdated,
  isRefreshing,
  onRefresh,
}: LiveQueueHeaderProps) {
  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "Updating...";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Link
          href="/student/dashboard"
          className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 transition-all hover:bg-white/10 hover:border-amber-400/40 hover:text-white"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
        </Link>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white/95 sm:text-3xl">
              Live Queue
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
              <Radio size={12} className="animate-pulse text-emerald-400" />
              LIVE
            </span>
          </div>
          <p className="mt-1 text-sm text-white/50">
            Track your queue in real time.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto">
        <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/10 px-3 py-1.5 text-xs text-white/60">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
          </span>
          <span>Updated: <span className="font-mono font-medium text-white/80">{formattedTime}</span></span>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 border border-amber-500/30 px-3.5 py-2 text-xs font-medium text-amber-200 shadow-sm transition-all hover:bg-amber-500/30 hover:border-amber-400/60 active:scale-95 disabled:opacity-50"
          aria-label="Refresh Queue"
        >
          <RefreshCw
            size={14}
            className={`transition-transform ${isRefreshing ? "animate-spin text-amber-400" : "group-hover:rotate-180"}`}
          />
          <span>{isRefreshing ? "Syncing..." : "Refresh"}</span>
        </button>
      </div>
    </div>
  );
}
