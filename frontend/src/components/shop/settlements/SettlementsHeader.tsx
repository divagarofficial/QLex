"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw, Landmark, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface SettlementsHeaderProps {
  lastUpdated?: Date | null;
  isRefreshing?: boolean;
  onRefresh: () => void;
}

export default function SettlementsHeader({
  lastUpdated,
  isRefreshing = false,
  onRefresh,
}: SettlementsHeaderProps) {
  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "Just now";

  return (
    <header className="relative mb-8 pb-6 border-b border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Left side title and back button */}
      <div className="flex items-center gap-4">
        <Link
          href="/shop/dashboard"
          className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/40 text-slate-300 hover:text-white transition-all duration-200 shadow-lg shadow-black/20"
          aria-label="Back to Shop Dashboard"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <Landmark className="w-3 h-3 text-amber-400" />
              Merchant Center
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1 flex items-center gap-2">
            Settlements
            <Sparkles className="w-5 h-5 text-amber-400 opacity-80" />
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Track your earnings, pending transfers, and payout history.
          </p>
        </div>
      </div>

      {/* Right side last updated & refresh */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Last Updated
          </span>
          <span className="text-xs font-mono text-slate-200">{formattedTime}</span>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="group relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 text-slate-200 hover:text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Refresh Settlements"
        >
          <RefreshCw
            className={`w-4 h-4 text-amber-400 transition-transform ${
              isRefreshing ? "animate-spin" : "group-hover:rotate-180 duration-500"
            }`}
          />
          <span>Refresh</span>
        </button>
      </div>
    </header>
  );
}
