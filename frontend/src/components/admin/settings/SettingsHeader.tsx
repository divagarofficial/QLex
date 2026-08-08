"use client";

import React from "react";
import { Search, Sliders, ShieldCheck, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isBackendHealthy: boolean;
  serverStatusText: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export default function SettingsHeader({
  searchQuery,
  onSearchChange,
  isBackendHealthy,
  serverStatusText,
  isRefreshing,
  onRefresh,
}: SettingsHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-[#030406]/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 md:px-8 transition-all">
      <div className="max-w-[1300px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Status */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center justify-center h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-500/20 via-blue-500/10 to-violet-500/20 border border-amber-500/30 shadow-[0_0_20px_rgba(231,200,115,0.15)] shrink-0">
            <Sliders className="h-5.5 w-5.5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-sans">
                Platform Settings
              </h1>
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                  isBackendHealthy
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                )}
              >
                <ShieldCheck className="h-3 w-3" />
                <span>{serverStatusText}</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Centralized system configuration, environment parameters, and security policies
            </p>
          </div>
        </div>

        {/* Global Settings Search & Refresh */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search settings (e.g. JWT, Maintenance, Email, Priority)..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 rounded-md hover:bg-white/10 transition-colors"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08] active:scale-95 disabled:opacity-50 transition-all shrink-0"
              title="Refresh settings from backend"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin text-amber-400")} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
