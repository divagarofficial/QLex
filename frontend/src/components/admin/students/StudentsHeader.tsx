"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw, Users, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface StudentsHeaderProps {
  lastUpdated: Date | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export default function StudentsHeader({
  lastUpdated,
  isRefreshing,
  onRefresh,
}: StudentsHeaderProps) {
  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--:--:--";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-cyan-500/10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/20 px-3 py-1.5 rounded-full"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Control Center</span>
          </Link>
          <span className="text-xs text-slate-500 font-mono">/</span>
          <span className="text-xs font-semibold text-slate-400">User Management</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Students Management
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                <Shield className="w-3 h-3" /> RESTRICTED
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Monitor, search, and manage all registered student accounts on QLex.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 self-start md:self-auto">
        <div className="text-right hidden sm:block font-mono text-xs">
          <div className="text-slate-400">System Sync</div>
          <div className="text-cyan-400 font-semibold">{formattedTime}</div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 hover:border-cyan-500/40 px-4 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>{isRefreshing ? "Syncing..." : "Refresh"}</span>
        </motion.button>
      </div>
    </div>
  );
}
