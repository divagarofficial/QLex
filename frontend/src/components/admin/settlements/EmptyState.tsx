"use client";

import { Landmark, Search, RotateCcw, ShieldCheck } from "lucide-react";

interface EmptyStateProps {
  isSearchOrFilter: boolean;
  onReset?: () => void;
}

export default function EmptyState({ isSearchOrFilter, onReset }: EmptyStateProps) {
  if (isSearchOrFilter) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl space-y-4">
        <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg">
          <Search className="w-8 h-8" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h3 className="text-lg font-bold text-white">No Matching Settlements Found</h3>
          <p className="text-xs text-slate-400">
            No merchant settlements matched your current search queries or filter options.
          </p>
        </div>
        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold transition-all border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Search & Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl space-y-4">
      <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg">
        <Landmark className="w-8 h-8" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="text-lg font-bold text-white">No Settlements Generated Yet</h3>
        <p className="text-xs text-slate-400">
          Once merchant print orders are placed and paid, daily settlement payout records will automatically appear here.
        </p>
      </div>
    </div>
  );
}
