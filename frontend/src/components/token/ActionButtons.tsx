"use client";

import Link from "next/link";
import { RefreshCw, Download, Eye, ArrowLeft } from "lucide-react";

interface ActionButtonsProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
  onDownloadReceipt: () => void;
  onViewDocuments: () => void;
  isFixedMobile?: boolean;
}

export default function ActionButtons({
  onRefresh,
  isRefreshing = false,
  onDownloadReceipt,
  onViewDocuments,
  isFixedMobile = false,
}: ActionButtonsProps) {
  return (
    <div
      className={`${
        isFixedMobile
          ? "fixed bottom-0 left-0 right-0 p-4 bg-slate-950/90 backdrop-blur-2xl border-t border-white/10 z-40 md:static md:p-0 md:bg-transparent md:border-none"
          : "w-full"
      }`}
    >
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 max-w-6xl mx-auto">
        {/* Primary: Refresh Status */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="relative group overflow-hidden flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all duration-300 disabled:opacity-60 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
          <span>{isRefreshing ? "Updating..." : "Refresh Status"}</span>
        </button>

        {/* Secondary: Download Receipt */}
        <button
          type="button"
          onClick={onDownloadReceipt}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs sm:text-sm backdrop-blur-md transition-all duration-200 cursor-pointer group"
        >
          <Download className="w-4 h-4 text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
          <span>Download Receipt</span>
        </button>

        {/* Outline: View Uploaded Documents */}
        <button
          type="button"
          onClick={onViewDocuments}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 text-slate-200 font-medium text-xs sm:text-sm transition duration-200 cursor-pointer group"
        >
          <Eye className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          <span>View Documents</span>
        </button>

        {/* Ghost: Back to Dashboard */}
        <Link
          href="/student/dashboard"
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-transparent hover:bg-white/5 text-slate-400 hover:text-white font-medium text-xs sm:text-sm transition duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
