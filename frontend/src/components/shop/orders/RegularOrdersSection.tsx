"use client";

import { AnimatePresence } from "framer-motion";
import { Clock } from "lucide-react";
import type { EnrichedShopOrder } from "@/types/shop";
import OrderCard from "./OrderCard";

interface RegularOrdersSectionProps {
  orders: EnrichedShopOrder[];
  onPrint: (orderId: string) => Promise<void>;
  onReady?: (orderId: string) => Promise<void>;
  onServe: (orderId: string) => Promise<void>;
  onRejectTrigger: (order: EnrichedShopOrder) => void;
  isActionLoading?: boolean;
}

export default function RegularOrdersSection({
  orders,
  onPrint,
  onReady,
  onServe,
  onRejectTrigger,
  isActionLoading = false,
}: RegularOrdersSectionProps) {
  return (
    <section className="space-y-4 pt-2">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Regular Queue</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-purple-400/30 bg-purple-400/10 px-2.5 py-0.5 text-xs font-black text-purple-300 font-mono">
                {orders.length}
              </span>
            </h2>
            <p className="text-[11px] font-medium text-zinc-400">
              Standard orders processed in First-Come First-Served sequence (R-1, R-2...)
            </p>
          </div>
        </div>
      </div>

      {/* Orders Grid / Stack */}
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md">
          <p className="text-xs text-zinc-400 font-medium">
            No regular queue orders pending at the moment.
          </p>
        </div>
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
