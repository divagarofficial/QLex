"use client";

import { CheckCircle2, Clock, AlertCircle, RefreshCw, XCircle } from "lucide-react";

interface StatusChipProps {
  status: string;
}

export default function StatusChip({ status }: StatusChipProps) {
  const s = (status || "").toLowerCase();

  if (s === "completed" || s === "paid") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        Completed
      </span>
    );
  }

  if (s === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm">
        <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        Pending
      </span>
    );
  }

  if (s === "processing") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-sm">
        <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
        Processing
      </span>
    );
  }

  if (s === "failed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm">
        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
        Failed
      </span>
    );
  }

  if (s === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20 shadow-sm">
        <XCircle className="w-3.5 h-3.5 text-slate-400" />
        Cancelled
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm capitalize">
      {s}
    </span>
  );
}
