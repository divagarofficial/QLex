"use client";

import { motion } from "framer-motion";
import { ShoppingBag, IndianRupee, Landmark, CheckCircle2 } from "lucide-react";
import type { TodayRevenue, SettlementItem, TodayOrderItem } from "@/types/shop";

interface SummaryCardsProps {
  todaysOrders: TodayOrderItem[];
  revenue: TodayRevenue;
  pendingSettlements: SettlementItem[];
}

export default function SummaryCards({
  todaysOrders,
  revenue,
  pendingSettlements,
}: SummaryCardsProps) {
  // Calculate stats from backend data
  const totalOrdersCount = revenue.total_orders || todaysOrders.length;
  const totalRevenueAmount = Number(revenue.total_revenue || 0);

  const pendingSettlementsSum = pendingSettlements.reduce(
    (acc, item) => acc + Number(item.amount || 0),
    0
  );

  const completedOrdersCount = todaysOrders.filter(
    (o) => o.queue_state === "SERVED" || o.queue_state === "READY"
  ).length;

  const cards = [
    {
      title: "Today's Orders",
      value: totalOrdersCount.toString(),
      subtext: "Total orders received today",
      icon: ShoppingBag,
      color: "from-blue-500/20 to-indigo-500/20",
      borderColor: "border-blue-500/30",
      iconColor: "text-blue-400",
    },
    {
      title: "Today's Revenue",
      value: `₹${totalRevenueAmount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtext: "Earnings from paid orders",
      icon: IndianRupee,
      color: "from-amber-500/20 to-yellow-500/20",
      borderColor: "border-amber-400/30",
      iconColor: "text-amber-400",
    },
    {
      title: "Pending Settlements",
      value: `₹${pendingSettlementsSum.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtext: `${pendingSettlements.length} settlement batches pending`,
      icon: Landmark,
      color: "from-purple-500/20 to-violet-500/20",
      borderColor: "border-purple-400/30",
      iconColor: "text-purple-400",
    },
    {
      title: "Completed Orders",
      value: completedOrdersCount.toString(),
      subtext: "Orders served today",
      icon: CheckCircle2,
      color: "from-emerald-500/20 to-teal-500/20",
      borderColor: "border-emerald-400/30",
      iconColor: "text-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: idx * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`deep-glass group relative overflow-hidden rounded-3xl p-5 border ${card.borderColor} shadow-xl hover:scale-[1.02] transition-all duration-300`}
          >
            {/* Top light sweep */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-60" />

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {card.title}
              </span>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${card.color} border border-white/10 ${card.iconColor} shadow-inner`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-3">
              <p className="bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-2xl font-black tracking-tight text-transparent sm:text-3xl">
                {card.value}
              </p>
              <p className="mt-1 text-[11px] font-medium text-zinc-400">
                {card.subtext}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
