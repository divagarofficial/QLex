"use client";

import { motion } from "framer-motion";
import { Layers, Crown, Clock, CheckCircle2 } from "lucide-react";

interface SummaryCardsProps {
  totalOrders: number;
  priorityOrders: number;
  regularOrders: number;
  completedToday: number;
}

export default function SummaryCards({
  totalOrders,
  priorityOrders,
  regularOrders,
  completedToday,
}: SummaryCardsProps) {
  const cards = [
    {
      title: "Total Orders",
      value: totalOrders,
      subtitle: "Active & processed today",
      icon: Layers,
      color: "text-blue-400",
      bgGlow: "from-blue-500/10 to-transparent",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Priority Orders",
      value: priorityOrders,
      subtitle: "High priority queue",
      icon: Crown,
      color: "text-amber-300",
      bgGlow: "from-amber-400/15 to-transparent",
      borderColor: "border-amber-400/30",
    },
    {
      title: "Regular Orders",
      value: regularOrders,
      subtitle: "First-come first-served",
      icon: Clock,
      color: "text-purple-400",
      bgGlow: "from-purple-500/10 to-transparent",
      borderColor: "border-purple-500/20",
    },
    {
      title: "Completed Today",
      value: completedToday,
      subtitle: "Served & ready orders",
      icon: CheckCircle2,
      color: "text-emerald-400",
      bgGlow: "from-emerald-500/10 to-transparent",
      borderColor: "border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.08, ease: "easeOut" }}
            className={`deep-glass relative overflow-hidden rounded-2xl border ${card.borderColor} bg-white/5 p-5 backdrop-blur-xl shadow-lg hover:border-white/20 transition-all`}
          >
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${card.bgGlow} blur-2xl pointer-events-none`} />

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 tracking-wide uppercase">
                {card.title}
              </span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 border border-white/10 ${card.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tracking-tight">
                {card.value}
              </span>
            </div>

            <p className="mt-1 text-[11px] font-medium text-zinc-400">
              {card.subtitle}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
