"use client";

import { SettlementItem } from "@/services/adminSettlements";
import { Store, TrendingUp, Award, Calendar, Percent } from "lucide-react";

interface SettlementAnalyticsProps {
  settlements: SettlementItem[];
}

export default function SettlementAnalytics({ settlements }: SettlementAnalyticsProps) {
  const pending = settlements.filter((s) => s.status === "pending");
  const uniqueShopsAwaiting = new Set(pending.map((s) => s.shop_id || "RIT_PRINT_SHOP")).size;

  const totalCount = settlements.length;
  const totalSum = settlements.reduce((acc, s) => acc + s.amount, 0);
  const avgAmount = totalCount > 0 ? totalSum / totalCount : 0;

  const todayStr = new Date().toISOString().split("T")[0];
  const todaySettlements = settlements.filter((s) => s.settlement_date === todayStr);
  const largestToday = todaySettlements.length > 0
    ? Math.max(...todaySettlements.map((s) => s.amount))
    : (settlements.length > 0 ? Math.max(...settlements.map((s) => s.amount)) : 0);

  const completedCount = settlements.filter((s) => s.status === "completed" || s.status === "paid").length;
  const successRate = totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : "100.0";

  return (
    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-lg">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800/60">
        <TrendingUp className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-bold tracking-wider text-slate-200 uppercase">
          Settlement Performance Analytics
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
        {/* Shops Awaiting Settlement */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">Shops Awaiting Payout</span>
            <span className="text-sm font-bold text-white">{uniqueShopsAwaiting} Merchant(s)</span>
          </div>
        </div>

        {/* Average Settlement Amount */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">Average Settlement</span>
            <span className="text-sm font-bold text-white">₹{avgAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Largest Settlement Today */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">Peak Settlement</span>
            <span className="text-sm font-bold text-white">₹{largestToday.toFixed(2)}</span>
          </div>
        </div>

        {/* Next Scheduled Settlement */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">Next Settlement Cycle</span>
            <span className="text-sm font-bold text-white">Today 11:59 PM</span>
          </div>
        </div>

        {/* Settlement Success Rate */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 col-span-2 md:col-span-1">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">Payout Success Rate</span>
            <span className="text-sm font-bold text-emerald-400">{successRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
