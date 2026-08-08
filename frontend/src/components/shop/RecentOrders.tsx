"use client";

import { motion } from "framer-motion";
import { History, Eye, CheckCircle2, Clock, XCircle } from "lucide-react";
import type { TodayOrderItem } from "@/types/shop";
import { cn } from "@/lib/utils";

interface RecentOrdersProps {
  todaysOrders: TodayOrderItem[];
  onInspect: (orderId: string) => void;
}

export default function RecentOrders({
  todaysOrders,
  onInspect,
}: RecentOrdersProps) {
  // Filter recent orders (limit to last 6)
  const recentList = todaysOrders.slice(0, 6);

  const getStatusBadge = (state: string) => {
    switch (state) {
      case "SERVED":
      case "READY":
        return {
          label: "Served",
          icon: CheckCircle2,
          class: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
        };
      case "PRINTING":
        return {
          label: "Printing",
          icon: Clock,
          class: "bg-amber-500/20 text-amber-300 border-amber-400/30 animate-pulse",
        };
      case "REJECTED":
        return {
          label: "Rejected",
          icon: XCircle,
          class: "bg-red-500/20 text-red-300 border-red-400/30",
        };
      default:
        return {
          label: "Waiting",
          icon: Clock,
          class: "bg-blue-500/20 text-blue-300 border-blue-400/30",
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="deep-glass relative overflow-hidden rounded-3xl p-6 border border-white/10 shadow-xl"
    >
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <History className="h-5 w-5 text-amber-400" />
          <span>Recent Shop Orders</span>
        </h3>
        <span className="text-xs font-semibold text-zinc-400">
          Today's Activity
        </span>
      </div>

      {recentList.length === 0 ? (
        <div className="py-8 text-center text-xs text-zinc-400">
          No orders processed yet today.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recentList.map((order) => {
            const badge = getStatusBadge(order.queue_state);
            const BadgeIcon = badge.icon;
            const regNo = `REG-${order.student_id.slice(0, 8).toUpperCase()}`;

            return (
              <div
                key={order.order_id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md hover:border-white/20 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-amber-300">
                      {order.token}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase",
                        badge.class
                      )}
                    >
                      <BadgeIcon className="h-3 w-3" />
                      {badge.label}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 font-medium">{regNo}</p>
                  <p className="text-[11px] text-zinc-400">
                    {order.documents} {order.documents === 1 ? "document" : "documents"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onInspect(order.order_id)}
                  className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-300 hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-amber-300 transition-all cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Details</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
