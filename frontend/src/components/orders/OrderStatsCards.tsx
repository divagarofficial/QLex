"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Clock, CheckCircle2, XCircle, IndianRupee } from "lucide-react";
import type { MyOrderItem } from "@/types/student";

interface OrderStatsCardsProps {
  orders: MyOrderItem[];
}

export default function OrderStatsCards({ orders }: OrderStatsCardsProps) {
  // Statistics calculations from backend orders array
  const totalOrders = orders.length;

  const activeStatuses = ["draft", "pending_payment", "paid", "accepted", "printing", "ready_for_pickup", "waiting", "ready"];
  const pendingOrders = orders.filter((o) => activeStatuses.includes((o.status || "").toLowerCase())).length;

  const completedOrders = orders.filter((o) => ["completed", "served"].includes((o.status || "").toLowerCase())).length;

  const cancelledStatuses = ["cancelled", "expired", "payment_failed", "rejected"];
  const cancelledOrders = orders.filter((o) => cancelledStatuses.includes((o.status || "").toLowerCase())).length;

  // Sum of total_amount for orders that are paid or completed
  const totalSpent = orders
    .filter((o) => (o.payment_status || "").toLowerCase() === "paid" || ["completed", "served"].includes((o.status || "").toLowerCase()))
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  const stats = [
    {
      id: "total",
      label: "Total Orders",
      value: totalOrders.toString(),
      subtext: "Lifetime print orders",
      icon: ShoppingBag,
      color: "text-amber-400",
      bgGlow: "from-amber-500/10 to-transparent",
      borderColor: "border-amber-500/20",
    },
    {
      id: "pending",
      label: "Pending Orders",
      value: pendingOrders.toString(),
      subtext: "In progress / queued",
      icon: Clock,
      color: "text-sky-400",
      bgGlow: "from-sky-500/10 to-transparent",
      borderColor: "border-sky-500/20",
    },
    {
      id: "completed",
      label: "Completed",
      value: completedOrders.toString(),
      subtext: "Successfully collected",
      icon: CheckCircle2,
      color: "text-emerald-400",
      bgGlow: "from-emerald-500/10 to-transparent",
      borderColor: "border-emerald-500/20",
    },
    {
      id: "cancelled",
      label: "Cancelled",
      value: cancelledOrders.toString(),
      subtext: "Cancelled or expired",
      icon: XCircle,
      color: "text-rose-400",
      bgGlow: "from-rose-500/10 to-transparent",
      borderColor: "border-rose-500/20",
    },
    {
      id: "spent",
      label: "Total Spent",
      value: `₹${totalSpent.toFixed(2)}`,
      subtext: "Paid print transactions",
      icon: IndianRupee,
      color: "text-champagne-400",
      bgGlow: "from-champagne-500/10 to-transparent",
      borderColor: "border-champagne-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat, idx) => {
        const IconComponent = stat.icon;
        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className={`deep-glass group relative overflow-hidden rounded-2xl border ${stat.borderColor} p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40`}
          >
            {/* Background Glow Overlay */}
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${stat.bgGlow} opacity-40 transition-opacity group-hover:opacity-70`} />
            <div className="deep-glass-reflection" />
            <div className="deep-glass-rim" />
            <div className="deep-glass-sweep" />

            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white/50 tracking-wider uppercase">
                  {stat.label}
                </span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 ${stat.color}`}>
                  <IconComponent size={18} />
                </div>
              </div>

              <div className="mt-4">
                <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-white/40 truncate">
                  {stat.subtext}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
