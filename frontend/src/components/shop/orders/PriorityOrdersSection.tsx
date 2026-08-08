"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";
import type { EnrichedShopOrder } from "@/types/shop";
import OrderCard from "./OrderCard";
import EmptyState from "./EmptyState";

interface PriorityOrdersSectionProps {
  orders: EnrichedShopOrder[];
  onPrint: (orderId: string) => Promise<void>;
  onReady?: (orderId: string) => Promise<void>;
  onServe: (orderId: string) => Promise<void>;
  onRejectTrigger: (order: EnrichedShopOrder) => void;
  isActionLoading?: boolean;
}

export default function PriorityOrdersSection({
  orders,
  onPrint,
  onReady,
  onServe,
  onRejectTrigger,
  isActionLoading = false,
}: PriorityOrdersSectionProps) {
  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 shadow-[0_0_15px_rgba(231,200,115,0.2)]">
            <Crown className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Priority Queue</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-xs font-black text-amber-300 font-mono">
                {orders.length}
              </span>
            </h2>
            <p className="text-[11px] font-medium text-zinc-400">
              High priority orders processed first (P-1, P-2, P-3...)
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-amber-300/80 bg-amber-400/5 border border-amber-400/20 rounded-xl px-3 py-1">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Priority Acceleration Active</span>
        </div>
      </div>

      {/* Orders Grid / Stack */}
      {orders.length === 0 ? (
        <EmptyState type="no-priority" />
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {orders.map((order) => (
              <OrderCard
                key={order.order_id}
                order={order}
                onPrint={onPrint}
                onReady={onReady}
                onServe={onServe}
                onRejectTrigger={onRejectTrigger}
                isActionLoading={isActionLoading}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
