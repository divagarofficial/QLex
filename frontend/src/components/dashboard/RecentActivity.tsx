"use client";

import { motion } from "framer-motion";
import { Clock, FileText, CreditCard, CheckCircle, Ban, History } from "lucide-react";
import EmptyState from "./EmptyState";
import type { MyOrderItem } from "@/types/student";

const STATUS_ICONS: Record<string, typeof FileText> = {
  draft: FileText,
  pending_payment: CreditCard,
  paid: CreditCard,
  accepted: CheckCircle,
  printing: Clock,
  ready_for_pickup: CheckCircle,
  completed: CheckCircle,
  cancelled: Ban,
  payment_failed: Ban,
  expired: Ban,
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Order Created",
  pending_payment: "Payment Pending",
  paid: "Payment Completed",
  accepted: "Order Accepted",
  printing: "Printing Started",
  ready_for_pickup: "Ready for Pickup",
  completed: "Order Completed",
  cancelled: "Order Cancelled",
  payment_failed: "Payment Failed",
  expired: "Order Expired",
};

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

interface RecentActivityProps {
  orders: MyOrderItem[];
  isLoading?: boolean;
}

export default function RecentActivity({ orders, isLoading }: RecentActivityProps) {
  const recentOrders = orders.slice(0, 5);

  if (isLoading) {
    return null;
  }

  if (recentOrders.length === 0) {
    return (
      <EmptyState
        icon={<History size={28} />}
        title="No Activity Yet"
        description="Your recent print order activity will appear here once created."
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="deep-glass group relative overflow-hidden h-full"
    >
      <div className="deep-glass-reflection" />
      <div className="deep-glass-rim" />
      <div className="deep-glass-sweep" />

      <div className="relative z-10 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/[0.12] text-amber-300 shadow-md">
              <History size={18} />
            </div>
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
          </div>

          <span className="text-xs text-zinc-400 font-mono">
            {recentOrders.length} Recent
          </span>
        </div>

        <div className="space-y-2">
          {recentOrders.map((order, index) => {
            const IconComponent = STATUS_ICONS[order.status] || FileText;
            const label = STATUS_LABELS[order.status] || order.status;

            return (
              <motion.div
                key={order.order_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.1 + index * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex items-center gap-4 rounded-2xl p-3.5 border border-white/[0.04] bg-white/[0.02] transition-all duration-300 hover:border-white/10 hover:bg-white/[0.05]"
              >
                {/* Icon Box */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.08] text-amber-300">
                  <IconComponent size={16} />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {label}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400">
                    {order.token && (
                      <span className="font-mono text-amber-300 font-semibold">
                        Token #{order.token}
                      </span>
                    )}
                    {order.token && <span>•</span>}
                    <span className="font-semibold text-zinc-300">
                      ₹{Number(order.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Relative Time */}
                <span className="shrink-0 text-xs font-medium text-zinc-400">
                  {formatTimeAgo(order.created_at)}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
