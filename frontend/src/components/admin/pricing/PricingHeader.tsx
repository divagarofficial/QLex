"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw, SlidersHorizontal } from "lucide-react";

interface PricingHeaderProps {
  lastUpdated: Date | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function PricingHeader({
  lastUpdated,
  isRefreshing,
  onRefresh,
}: PricingHeaderProps) {
  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "Never";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
      {/* Title & Navigation */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="group flex items-center justify-center p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800 transition-all shadow-md"
            title="Return to Admin Dashboard"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
              Pricing
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Global Engine
            </span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 pl-11">
          Configure platform charges, print rates, priority pass fees, and test live pricing rules.
        </p>
      </div>

      {/* Refresh Control */}
      <div className="flex items-center gap-3 self-start md:self-auto">
        <div className="text-right hidden sm:block">
          <span className="text-[11px] text-slate-500 block font-medium">Last Synced</span>
          <span className="text-xs font-mono text-slate-300 font-semibold">{formattedTime}</span>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold shadow-lg hover:shadow-cyan-500/5 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>
    </div>
  );
}
