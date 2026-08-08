"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw, PlusCircle, Sparkles } from "lucide-react";

interface SettlementsHeaderProps {
  lastUpdated: Date | null;
  isRefreshing: boolean;
  isGenerating: boolean;
  onRefresh: () => void;
  onGenerate: () => void;
}

export default function SettlementsHeader({
  lastUpdated,
  isRefreshing,
  isGenerating,
  onRefresh,
  onGenerate,
}: SettlementsHeaderProps) {
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
      {/* Title & Back Navigation */}
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
              Settlements
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Merchant Payouts
            </span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 pl-11">
          Manage all merchant settlements, track payouts, and monitor financial flow across QLex.
        </p>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3 self-start md:self-auto">
        <div className="text-right hidden sm:block">
          <span className="text-[11px] text-slate-500 block font-medium">Last Updated</span>
          <span className="text-xs font-mono text-slate-300 font-semibold">{formattedTime}</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold shadow-lg hover:shadow-cyan-500/5 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
        </button>

        {/* Generate Settlement Button */}
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-900/30 hover:shadow-cyan-500/20 transition-all border border-cyan-400/30 disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 text-cyan-200 ${isGenerating ? "animate-spin" : ""}`} />
          <span>{isGenerating ? "Generating..." : "Generate Today Settlement"}</span>
        </button>
      </div>
    </div>
  );
}
