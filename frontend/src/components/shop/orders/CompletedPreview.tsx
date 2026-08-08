"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronDown, ChevronUp, History, ArrowUpRight } from "lucide-react";
import type { EnrichedShopOrder } from "@/types/shop";
import { useRouter } from "next/navigation";

interface CompletedPreviewProps {
  completedOrders: EnrichedShopOrder[];
}

export default function CompletedPreview({
  completedOrders,
}: CompletedPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  if (completedOrders.length === 0) return null;

  const displayList = expanded ? completedOrders : completedOrders.slice(0, 4);

  return (
    <div className="deep-glass relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-white/5 p-5 backdrop-blur-xl shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Recently Completed Orders</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300 font-mono">
                {completedOrders.length}
              </span>
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
        >
          <span>{expanded ? "Collapse" : "View All"}</span>
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence>
          {displayList.map((order) => {
            const regNo = order.register_number || `REG-${order.student_id.slice(0, 8).toUpperCase()}`;
            return (
              <motion.div
                key={order.order_id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-md hover:border-emerald-500/30 hover:bg-white/5 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-emerald-300 font-mono">
                      {order.token}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      <CheckCircle2 className="h-3 w-3" /> Served
                    </span>
                  </div>
                  <p className="text-xs font-medium text-zinc-200">{regNo}</p>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    ₹{Number(order.grand_total || 0).toFixed(2)} • {order.document_count} {order.document_count === 1 ? "file" : "files"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => router.push(`/shop/orders/${order.order_id}`)}
                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 hover:border-emerald-400/40 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all cursor-pointer"
                  title="View order details"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
