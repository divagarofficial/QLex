"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, Layers } from "lucide-react";

interface OrdersHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date | null;
}

export default function OrdersHeader({
  onRefresh,
  isRefreshing,
  lastUpdated,
}: OrdersHeaderProps) {
  const formatTime = (date: Date | null) => {
    if (!date) return "Just now";
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-white/10">
      <div className="flex items-center gap-4">
        <Link
          href="/shop/dashboard"
          className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md text-zinc-300 transition-all hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-amber-300"
          title="Back to Dashboard"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
        </Link>

        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300">
              <Layers className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
              Orders
            </h1>
          </div>
          <p className="mt-1 text-xs text-zinc-400 font-medium">
            Manage and process all print orders.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto">
        <div className="text-right text-[11px] text-zinc-400 font-mono hidden xs:block">
          <span className="text-zinc-500">Updated:</span>{" "}
          <span className="text-zinc-300 font-semibold">{formatTime(lastUpdated)}</span>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-zinc-200 backdrop-blur-md transition-all hover:border-amber-400/30 hover:bg-white/10 hover:text-amber-300 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-amber-400" : ""}`}
          />
          <span>Refresh</span>
        </motion.button>
      </div>
    </div>
  );
}
