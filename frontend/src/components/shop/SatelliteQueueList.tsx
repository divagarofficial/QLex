"use client";

import { motion } from "framer-motion";
import {
  ListOrdered,
  FileText,
  Printer,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  Download,
} from "lucide-react";
import type { TodayOrderItem } from "@/types/shop";
import { getFileUrl } from "@/utils/fileUrl";

interface SatelliteQueueListProps {
  todaysOrders: TodayOrderItem[];
  onPrint: (orderId: string) => void;
  onReady: (orderId: string) => void;
  onServe: (orderId: string) => void;
  onReject: (orderId: string) => void;
  onInspect: (orderId: string) => void;
  actionLoading?: boolean;
}

export default function SatelliteQueueList({
  todaysOrders,
  onPrint,
  onReady,
  onServe,
  onReject,
  onInspect,
  actionLoading = false,
}: SatelliteQueueListProps) {
  // Filter active queue items (waiting or printing or ready)
  const activeOrders = todaysOrders.filter(
    (o) => o.queue_state !== "SERVED" && o.queue_state !== "REJECTED" && (o.token?.startsWith("S-") || (o as any).shop_name?.includes("Satellite"))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="deep-glass relative overflow-hidden rounded-3xl p-6 border border-emerald-500/20 shadow-xl bg-gradient-to-b from-slate-900/60 to-black"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <ListOrdered className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Satellite S-Token Queue</span>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-black text-emerald-300">
                {activeOrders.length} Pending
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Sequential S-Token order dispatch sequence (S-1, S-2, S-3...)
            </p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {activeOrders.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-white">Queue Empty</p>
          <p className="text-xs text-zinc-400 mt-1">
            All Satellite Hub print orders have been processed and served.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {activeOrders.map((order, idx) => {
            const tokenStr = order.token || `S-${(order as any).queue_number || idx + 1}`;
            const docsArray = Array.isArray((order as any).documents) ? (order as any).documents : [];
            const firstDoc = docsArray[0];
            const docCount = typeof order.documents === "number" ? order.documents : docsArray.length || 1;
            const isPrinting = order.queue_state === "PRINTING";
            const isReady = order.queue_state === "READY" || order.queue_state === "READY_FOR_PICKUP";

            return (
              <motion.div
                key={order.order_id || idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-4 transition-all duration-300 hover:border-emerald-500/40 hover:bg-emerald-950/20"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Token & User Details */}
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 shadow-inner">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-400">TOKEN</span>
                      <span className="text-base font-black leading-none">{tokenStr}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{order.student_name || "Staff Member"}</span>
                        {(order.register_number || (order as any).student_register_number) && (
                          <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
                            {order.register_number || (order as any).student_register_number}
                          </span>
                        )}
                        <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                          Paid / Zero-Cost
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5 text-emerald-400" />
                          <span>{docCount} file(s)</span>
                        </span>
                        {firstDoc && (
                          <>
                            <span>•</span>
                            <span>{firstDoc.page_count || 1} page(s)</span>
                            <span>•</span>
                            <span>{firstDoc.print_type || "Black & White"}</span>
                            <span>•</span>
                            <span>{firstDoc.copies || 1} copy(ies)</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* View Details Button */}
                    <button
                      onClick={() => onInspect(order.order_id)}
                      className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Inspect</span>
                    </button>

                    {/* Download File Button */}
                    {firstDoc?.url && (
                      <a
                        href={getFileUrl(firstDoc.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </a>
                    )}

                    {/* Print / Ready / Serve Actions */}
                    {!isPrinting && !isReady && (
                      <button
                        onClick={() => onPrint(order.order_id)}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 text-xs font-extrabold transition shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Start Printing</span>
                      </button>
                    )}

                    {isPrinting && (
                      <button
                        onClick={() => onReady(order.order_id)}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-2 text-xs font-extrabold transition shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Ready for Pickup</span>
                      </button>
                    )}

                    {isReady && (
                      <button
                        onClick={() => onServe(order.order_id)}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-3.5 py-2 text-xs font-extrabold transition shadow-md shadow-emerald-400/20 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Mark Served</span>
                      </button>
                    )}

                    {/* Cancel / Reject Button */}
                    <button
                      onClick={() => onReject(order.order_id)}
                      disabled={actionLoading}
                      className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
