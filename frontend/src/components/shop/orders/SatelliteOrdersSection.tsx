"use client";

import { motion } from "framer-motion";
import { Building2, FileText, Download, Eye, Printer, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { EnrichedShopOrder } from "@/types/shop";
import { getFileUrl } from "@/utils/fileUrl";

interface SatelliteOrdersSectionProps {
  orders: EnrichedShopOrder[];
  onPrint: (orderId: string) => void;
  onReady: (orderId: string) => void;
  onServe: (orderId: string) => void;
  onRejectTrigger: (order: EnrichedShopOrder) => void;
  isActionLoading: boolean;
}

export default function SatelliteOrdersSection({
  orders,
  onPrint,
  onReady,
  onServe,
  onRejectTrigger,
  isActionLoading,
}: SatelliteOrdersSectionProps) {
  return (
    <div className="space-y-4">
      {/* Section Title Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Satellite S-Token Queue</span>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-black text-emerald-300">
                {orders.length}
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Sequential orders processed in First-Come First-Served sequence (S-1, S-2, S-3...)
            </p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-white/10 bg-white/5">
          <Clock className="h-6 w-6 text-zinc-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-white">No Active Satellite Orders</p>
          <p className="text-xs text-zinc-400 mt-1">There are currently no waiting orders in the Satellite S-Token queue.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, idx) => {
            const tokenStr = order.token || `S-${order.order_id.slice(0, 3).toUpperCase()}`;
            const firstDoc = order.documents?.[0];
            const isPrinting = order.queue_state === "PRINTING";
            const isReady = order.queue_state === "READY" || order.queue_state === "READY_FOR_PICKUP";

            return (
              <motion.div
                key={order.order_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="group relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-emerald-950/10 p-5 transition-all duration-300 hover:border-emerald-500/40 hover:bg-emerald-950/20 shadow-lg"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Token & Customer Meta */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 shadow-inner">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-400">SAT</span>
                      <span className="text-lg font-black leading-none">{tokenStr}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white">{order.student_name}</span>
                        {order.register_number && (
                          <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-mono text-zinc-300">
                            {order.register_number}
                          </span>
                        )}
                        <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                          Paid / Zero-Cost
                        </span>
                        <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{order.queue_state || "Waiting"}</span>
                        </span>
                      </div>

                      {/* Specs Summary Row */}
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-zinc-300">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-zinc-500 block">Documents</span>
                          <span className="font-bold text-white">{order.document_count || 1} file(s)</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-zinc-500 block">Total Pages</span>
                          <span className="font-bold text-white">{order.total_pages || 1} pages</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-zinc-500 block">Copies & Format</span>
                          <span className="font-bold text-white">{order.total_copies || 1}x ({firstDoc?.paper_size || "A4"})</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-zinc-500 block">Print Spec</span>
                          <span className="font-bold text-white">{String(firstDoc?.print_type || "").toUpperCase().includes("COLOR") ? "Color" : "Black & White"} • {firstDoc?.print_side || "Single-sided"}</span>
                        </div>
                      </div>

                      {/* File Downloads */}
                      {order.documents && order.documents.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {order.documents.map((doc) => (
                            <a
                              key={doc.id}
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition"
                            >
                              <FileText className="h-3 w-3 text-emerald-400" />
                              <span className="truncate max-w-[180px]">{doc.original_filename}</span>
                              <Download className="h-3 w-3 opacity-60" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
                    {!isPrinting && !isReady && (
                      <button
                        onClick={() => onPrint(order.order_id)}
                        disabled={isActionLoading}
                        className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 text-xs font-extrabold transition shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                      >
                        <Printer className="h-4 w-4" />
                        <span>Start Printing</span>
                      </button>
                    )}

                    {isPrinting && (
                      <button
                        onClick={() => onReady(order.order_id)}
                        disabled={isActionLoading}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 text-xs font-extrabold transition shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Ready for Pickup</span>
                      </button>
                    )}

                    {isReady && (
                      <button
                        onClick={() => onServe(order.order_id)}
                        disabled={isActionLoading}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-4 py-2.5 text-xs font-extrabold transition shadow-md shadow-emerald-400/20 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Mark Served</span>
                      </button>
                    )}

                    <button
                      onClick={() => onRejectTrigger(order)}
                      disabled={isActionLoading}
                      className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
