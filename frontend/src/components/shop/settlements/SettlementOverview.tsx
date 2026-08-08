"use client";

import { motion } from "framer-motion";
import { DollarSign, Clock, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";
import type { SettlementItem } from "@/types/shop";

interface SettlementOverviewProps {
  todayEarnings: number;
  pendingAmount: number;
  completedAmount: number;
  totalLifetimeEarnings: number;
  pendingCount?: number;
}

export default function SettlementOverview({
  todayEarnings,
  pendingAmount,
  completedAmount,
  totalLifetimeEarnings,
  pendingCount = 0,
}: SettlementOverviewProps) {
  const cards = [
    {
      id: "today",
      title: "Today's Earnings",
      amount: todayEarnings,
      subtitle: "Accumulated sales today",
      icon: DollarSign,
      gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
      accent: "text-emerald-400 border-emerald-500/30",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    },
    {
      id: "pending",
      title: "Pending Settlement",
      amount: pendingAmount,
      subtitle: `${pendingCount} transfer${pendingCount === 1 ? "" : "s"} scheduled`,
      icon: Clock,
      gradient: "from-amber-500/20 via-yellow-500/10 to-transparent",
      accent: "text-amber-400 border-amber-500/30",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    },
    {
      id: "settled",
      title: "Settled Amount",
      amount: completedAmount,
      subtitle: "Total payouts transferred",
      icon: CheckCircle2,
      gradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
      accent: "text-blue-400 border-blue-500/30",
      glow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]",
    },
    {
      id: "lifetime",
      title: "Total Lifetime",
      amount: totalLifetimeEarnings,
      subtitle: "Gross platform sales",
      icon: TrendingUp,
      gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
      accent: "text-purple-400 border-purple-500/30",
      glow: "shadow-[0_0_20px_rgba(168,85,247,0.15)]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            className={`relative overflow-hidden rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-5 ${card.glow} group hover:border-white/20 transition-all duration-300`}
          >
            {/* Background gradient sweep */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none`}
            />

            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {card.title}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border ${card.accent} backdrop-blur-md`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-1">
                  <span className="text-lg font-bold text-slate-400">₹</span>
                  <span>
                    {card.amount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-medium">{card.subtitle}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
