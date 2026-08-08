"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Zap, CheckCircle2, ShoppingBag, Landmark } from "lucide-react";
import type { TodayOrderItem, SettlementItem } from "@/types/shop";

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  todaysOrders: TodayOrderItem[];
  pendingSettlements: SettlementItem[];
}

export default function NotificationPanel({
  open,
  onClose,
  todaysOrders,
  pendingSettlements,
}: NotificationPanelProps) {
  // Generate notification items based on real backend data
  const notifications = [
    ...todaysOrders.slice(0, 4).map((o, idx) => ({
      id: `ord-${o.order_id}`,
      title: o.is_priority ? "Priority Order Received" : "New Print Order",
      message: `Token ${o.token} with ${o.documents} ${o.documents === 1 ? "document" : "documents"} in queue.`,
      time: `${idx * 5 + 2}m ago`,
      type: o.is_priority ? ("priority" as const) : ("order" as const),
    })),
    ...pendingSettlements.slice(0, 2).map((s) => ({
      id: `set-${s.id}`,
      title: "Settlement Generated",
      message: `Batch for ₹${Number(s.amount).toFixed(2)} generated on ${s.settlement_date}.`,
      time: "1h ago",
      type: "settlement" as const,
    })),
  ];

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-full w-full max-w-md border-l border-white/10 bg-zinc-950 p-6 shadow-2xl overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
                <Bell className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Shop Notifications
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* List */}
          <div className="mt-4 flex flex-col gap-3">
            {notifications.length === 0 ? (
              <p className="py-8 text-center text-xs text-zinc-500">
                No notifications right now.
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
                >
                  <div className="mt-0.5">
                    {n.type === "priority" ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                        <Zap className="h-4 w-4" />
                      </div>
                    ) : n.type === "settlement" ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
                        <Landmark className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30">
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{n.title}</h4>
                      <span className="text-[10px] text-zinc-400 font-mono">{n.time}</span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-300 font-medium leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
