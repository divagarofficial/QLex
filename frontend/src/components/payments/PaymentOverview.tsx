"use client";

import { motion } from "framer-motion";
import { DollarSign, Clock, CheckCircle2, AlertTriangle, CreditCard } from "lucide-react";

interface PaymentOverviewProps {
  totalSpent: number;
  pendingAmount: number;
  completedCount: number;
  failedCount: number;
  totalTransactions: number;
}

export default function PaymentOverview({
  totalSpent,
  pendingAmount,
  completedCount,
  failedCount,
  totalTransactions,
}: PaymentOverviewProps) {
  const cards = [
    {
      title: "Total Spent",
      value: `₹${totalSpent.toFixed(2)}`,
      subtext: "Lifetime print payments",
      icon: DollarSign,
      accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      highlight: true,
    },
    {
      title: "Pending Amount",
      value: `₹${pendingAmount.toFixed(2)}`,
      subtext: pendingAmount > 0 ? "Action required" : "No pending dues",
      icon: Clock,
      accent: pendingAmount > 0
        ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
        : "text-white/40 bg-white/5 border-white/10",
      alert: pendingAmount > 0,
    },
    {
      title: "Successful Payments",
      value: completedCount.toString(),
      subtext: "Verified transactions",
      icon: CheckCircle2,
      accent: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      title: "Failed Payments",
      value: failedCount.toString(),
      subtext: "Rejected / Unpaid",
      icon: AlertTriangle,
      accent: failedCount > 0
        ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
        : "text-white/40 bg-white/5 border-white/10",
    },
    {
      title: "Total Transactions",
      value: totalTransactions.toString(),
      subtext: "All payment records",
      icon: CreditCard,
      accent: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className={`deep-glass group relative overflow-hidden p-4 rounded-2xl border ${
              card.highlight
                ? "border-emerald-500/30 bg-emerald-500/[0.04]"
                : card.alert
                ? "border-amber-500/40 bg-amber-500/[0.04]"
                : "border-white/10"
            }`}
          >
            <div className="deep-glass-reflection" />
            <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-white/50 truncate">
                  {card.title}
                </span>
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${card.accent}`}
                >
                  <Icon size={14} />
                </div>
              </div>

              <div>
                <div className="font-mono text-xl font-bold tracking-tight text-white/90 sm:text-2xl truncate">
                  {card.value}
                </div>
                <p className="mt-1 text-[11px] text-white/40 truncate">
                  {card.subtext}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
