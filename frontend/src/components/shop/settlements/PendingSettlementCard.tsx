"use client";

import { motion } from "framer-motion";
import { Clock, ShoppingBag, ArrowUpRight, CheckCircle2, ShieldAlert } from "lucide-react";
import SettlementStatusChip from "./SettlementStatusChip";
import type { SettlementItem } from "@/types/shop";

interface PendingSettlementCardProps {
  settlement?: SettlementItem | null;
}

export default function PendingSettlementCard({ settlement }: PendingSettlementCardProps) {
  if (!settlement) return null;

  const amountWaiting = settlement.amount || 0;
  const ordersCount = settlement.orders_count || 0;

  // Determine settlement status step percentage
  let progressPercent = 33;
  let currentStepText = "Pending Verification";
  if (settlement.status === "PROCESSING") {
    progressPercent = 66;
    currentStepText = "Processing Transfer";
  } else if (settlement.status === "COMPLETED" || settlement.status === "PAID") {
    progressPercent = 100;
    currentStepText = "Transferred Successfully";
  }

  const oldestPendingDateStr = settlement.generated_at
    ? new Date(settlement.generated_at).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Today";

  const estimatedTransferDateStr = settlement.settlement_date
    ? new Date(settlement.settlement_date).toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "End of Business Day";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 mb-8 shadow-xl shadow-black/20"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Pending Settlement Progress
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-0.5">
            Transfer In Pipeline
          </h3>
        </div>
        <SettlementStatusChip status={settlement.status || "PENDING"} />
      </div>

      {/* Progress Bar Component */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
          <span>Stage: <strong className="text-slate-200">{currentStepText}</strong></span>
          <span>{progressPercent}% Completed</span>
        </div>

        <div className="relative w-full h-3 rounded-full bg-white/5 border border-white/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
          />
        </div>

        {/* Steps indicator */}
        <div className="grid grid-cols-3 gap-2 mt-3 text-[11px] text-slate-400 font-medium text-center">
          <div className={`flex flex-col items-center gap-1 ${progressPercent >= 33 ? "text-amber-300" : ""}`}>
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <span>1. Verified</span>
          </div>
          <div className={`flex flex-col items-center gap-1 ${progressPercent >= 66 ? "text-blue-300" : ""}`}>
            <span className={`w-2 h-2 rounded-full ${progressPercent >= 66 ? "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]" : "bg-slate-600"}`} />
            <span>2. Processing</span>
          </div>
          <div className={`flex flex-col items-center gap-1 ${progressPercent >= 100 ? "text-emerald-300" : ""}`}>
            <span className={`w-2 h-2 rounded-full ${progressPercent >= 100 ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-slate-600"}`} />
            <span>3. Disbursed</span>
          </div>
        </div>
      </div>

      {/* Grid info stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Amount Waiting
          </span>
          <span className="text-lg font-bold text-amber-300 mt-0.5 block">
            ₹{amountWaiting.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Orders Included
          </span>
          <span className="text-lg font-bold text-white mt-0.5 block">
            {ordersCount} Orders
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Generated At
          </span>
          <span className="text-xs font-semibold text-slate-300 mt-1 block truncate">
            {oldestPendingDateStr}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Est. Transfer Date
          </span>
          <span className="text-xs font-semibold text-emerald-300 mt-1 block truncate">
            {estimatedTransferDateStr}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
