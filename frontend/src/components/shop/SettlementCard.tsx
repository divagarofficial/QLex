"use client";

import { motion } from "framer-motion";
import { Landmark, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";
import type { TodayRevenue, SettlementItem } from "@/types/shop";

interface SettlementCardProps {
  revenue: TodayRevenue;
  pendingSettlements: SettlementItem[];
  historySettlements: SettlementItem[];
}

export default function SettlementCard({
  revenue,
  pendingSettlements,
  historySettlements,
}: SettlementCardProps) {
  const todayEarnings = Number(revenue.total_revenue || 0);

  const pendingSum = pendingSettlements.reduce(
    (acc, item) => acc + Number(item.amount || 0),
    0
  );

  const lastSettlement = historySettlements[0] || pendingSettlements[0];
  const lastAmount = lastSettlement ? Number(lastSettlement.amount || 0) : 0;
  const lastDate = lastSettlement
    ? new Date(lastSettlement.generated_at).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      })
    : "None";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="deep-glass relative overflow-hidden rounded-3xl p-6 border border-white/10 shadow-xl"
    >
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Landmark className="h-5 w-5 text-amber-400" />
          <span>Settlement Preview</span>
        </h3>
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
          Bank Transfer Ready
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Today's Shop Earnings */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Today's Earnings
          </span>
          <span className="text-xl font-black text-amber-300 mt-1 block tracking-tight">
            ₹{todayEarnings.toFixed(2)}
          </span>
        </div>

        {/* Pending Settlement */}
        <div className="rounded-2xl border border-purple-400/20 bg-purple-500/10 p-4 backdrop-blur-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block">
            Pending Settlement
          </span>
          <span className="text-xl font-black text-purple-200 mt-1 block tracking-tight">
            ₹{pendingSum.toFixed(2)}
          </span>
        </div>

        {/* Last Settlement */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Last Settlement
          </span>
          <span className="text-xl font-black text-white mt-1 block tracking-tight">
            ₹{lastAmount.toFixed(2)}
          </span>
          <span className="text-[10px] text-zinc-400 block mt-0.5">
            Date: {lastDate}
          </span>
        </div>

        {/* Next Settlement Schedule */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block flex items-center gap-1">
            <Clock className="h-3 w-3 text-amber-400" />
            Next Payout
          </span>
          <span className="text-sm font-bold text-emerald-300 mt-1.5 block">
            End of Day (10 PM)
          </span>
          <span className="text-[10px] text-zinc-400 block mt-0.5">
            Automatic UPI/Bank
          </span>
        </div>
      </div>
    </motion.div>
  );
}
