"use client";

import { motion } from "framer-motion";
import { Activity, Printer, CheckCircle2, Clock, XCircle, ArrowRight } from "lucide-react";
import type { AdminDashboardCounts } from "@/services/adminDashboard";

interface LiveActivityCardProps {
  counts: AdminDashboardCounts;
}

export default function LiveActivityCard({ counts }: LiveActivityCardProps) {
  const totalActive = counts.waiting_orders + counts.printing_orders + counts.ready_orders;
  const grandTotal = totalActive + counts.served_orders;

  const getPercent = (val: number) => {
    if (grandTotal === 0) return 0;
    return Math.round((val / grandTotal) * 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="deep-glass relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl mb-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-4 w-4 text-blue-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Live Platform Queue Activity
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            Real-time status breakdown across all active print queues
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
          <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
          <span>Active Sessions: {counts.active_sessions}</span>
        </div>
      </div>

      {/* Queue State Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {/* Waiting */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-300">Waiting Queue</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">{counts.waiting_orders}</p>
          <p className="text-[10px] text-zinc-400 mt-1">Pending print start</p>
        </div>

        {/* Printing */}
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-blue-300">Printing Now</span>
            <Printer className="h-4 w-4 text-blue-400 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-white">{counts.printing_orders}</p>
          <p className="text-[10px] text-zinc-400 mt-1">Currently on printers</p>
        </div>

        {/* Ready */}
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-cyan-300">Ready for Pickup</span>
            <CheckCircle2 className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white">{counts.ready_orders}</p>
          <p className="text-[10px] text-zinc-400 mt-1">Awaiting collection</p>
        </div>

        {/* Completed */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-300">Completed (Served)</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{counts.served_orders}</p>
          <p className="text-[10px] text-zinc-400 mt-1">Collected by students</p>
        </div>
      </div>

      {/* Live Distribution Progress Bar */}
      <div>
        <div className="flex justify-between items-center text-xs font-medium text-zinc-400 mb-2">
          <span>Queue Throughput Distribution</span>
          <span>{grandTotal} Total Queue Items</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-white/5 p-0.5 flex gap-1 border border-white/10">
          <div
            style={{ width: `${getPercent(counts.waiting_orders)}%` }}
            className="h-full rounded-full bg-amber-400 transition-all duration-500"
            title={`Waiting: ${counts.waiting_orders}`}
          />
          <div
            style={{ width: `${getPercent(counts.printing_orders)}%` }}
            className="h-full rounded-full bg-blue-400 transition-all duration-500"
            title={`Printing: ${counts.printing_orders}`}
          />
          <div
            style={{ width: `${getPercent(counts.ready_orders)}%` }}
            className="h-full rounded-full bg-cyan-400 transition-all duration-500"
            title={`Ready: ${counts.ready_orders}`}
          />
          <div
            style={{ width: `${getPercent(counts.served_orders)}%` }}
            className="h-full rounded-full bg-emerald-400 transition-all duration-500"
            title={`Served: ${counts.served_orders}`}
          />
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-4 text-[11px] font-medium text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span>Waiting ({getPercent(counts.waiting_orders)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            <span>Printing ({getPercent(counts.printing_orders)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span>Ready ({getPercent(counts.ready_orders)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Served ({getPercent(counts.served_orders)}%)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
