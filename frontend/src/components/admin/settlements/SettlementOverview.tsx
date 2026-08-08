"use client";

import { SettlementItem } from "@/services/adminSettlements";
import { DollarSign, Clock, CheckCircle2, AlertTriangle, RefreshCw, Landmark } from "lucide-react";

interface SettlementOverviewProps {
  settlements: SettlementItem[];
  loading?: boolean;
}

export default function SettlementOverview({ settlements, loading }: SettlementOverviewProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  // Calculated Metrics from backend data
  const todaySettlements = settlements.filter((s) => s.settlement_date === todayStr);
  const todayAmount = todaySettlements.reduce((sum, s) => sum + s.amount, 0);

  const pendingSettlements = settlements.filter((s) => s.status === "pending");
  const pendingAmount = pendingSettlements.reduce((sum, s) => sum + s.amount, 0);

  const completedSettlements = settlements.filter((s) => s.status === "completed" || s.status === "paid");
  const completedCount = completedSettlements.length;
  const completedAmount = completedSettlements.reduce((sum, s) => sum + s.amount, 0);

  const failedSettlements = settlements.filter((s) => s.status === "failed");
  const failedCount = failedSettlements.length;

  const processingSettlements = settlements.filter((s) => s.status === "processing");
  const processingCount = processingSettlements.length;

  const totalLifetimeAmount = settlements.reduce((sum, s) => sum + s.amount, 0);

  const cards = [
    {
      title: "Today's Settlement Amount",
      value: `₹${todayAmount.toFixed(2)}`,
      subtitle: `${todaySettlements.length} Settlements Today`,
      icon: DollarSign,
      iconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      accent: "from-cyan-500/10 via-transparent to-transparent",
    },
    {
      title: "Pending Settlement Amount",
      value: `₹${pendingAmount.toFixed(2)}`,
      subtitle: `${pendingSettlements.length} Pending Payouts`,
      icon: Clock,
      iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      accent: "from-amber-500/10 via-transparent to-transparent",
    },
    {
      title: "Completed Settlements",
      value: `${completedCount}`,
      subtitle: `Total Paid: ₹${completedAmount.toFixed(2)}`,
      icon: CheckCircle2,
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      accent: "from-emerald-500/10 via-transparent to-transparent",
    },
    {
      title: "Failed Settlements",
      value: `${failedCount}`,
      subtitle: "Requires Attention",
      icon: AlertTriangle,
      iconBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      accent: "from-rose-500/10 via-transparent to-transparent",
    },
    {
      title: "Processing Settlements",
      value: `${processingCount}`,
      subtitle: "In Bank Transfer Queue",
      icon: RefreshCw,
      iconBg: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      accent: "from-sky-500/10 via-transparent to-transparent",
    },
    {
      title: "Total Lifetime Settlements",
      value: `₹${totalLifetimeAmount.toFixed(2)}`,
      subtitle: `${settlements.length} Total Records`,
      icon: Landmark,
      iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      accent: "from-purple-500/10 via-transparent to-transparent",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/90 p-4 shadow-xl backdrop-blur-xl hover:border-slate-700/90 hover:shadow-cyan-900/10 transition-all duration-300 hover:-translate-y-0.5"
          >
            {/* Ambient Corner Glow */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${card.accent} rounded-bl-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity`} />

            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl border ${card.iconBg} shadow-sm`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                {card.value}
              </div>
              <p className="text-[11px] font-medium text-slate-400">{card.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
