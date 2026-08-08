"use client";

import { motion } from "framer-motion";
import { FileText, ArrowRight, Clock, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { RecentOrderItem } from "@/services/adminDashboard";

interface RecentOrdersProps {
  orders: RecentOrderItem[];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "paid" || s === "served") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
          <CheckCircle2 className="h-3 w-3" />
          <span className="uppercase">{status}</span>
        </span>
      );
    }
    if (s === "printing" || s === "ready_for_pickup") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-400">
          <Clock className="h-3 w-3 animate-spin" />
          <span className="uppercase">{status.replace(/_/g, " ")}</span>
        </span>
      );
    }
    if (s === "rejected" || s === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[10px] font-bold text-red-400">
          <AlertCircle className="h-3 w-3" />
          <span className="uppercase">{status}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold text-zinc-400">
        <span className="uppercase">{status}</span>
      </span>
    );
  };

  return (
    <div className="deep-glass relative overflow-hidden rounded-3xl p-6 border border-white/10 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">Recent Orders Feed</h2>
            </div>
            <p className="text-xs text-zinc-400">Latest submitted student print orders</p>
          </div>

          <Link
            href="/admin/orders"
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Table / List */}
        {orders.length === 0 ? (
          <div className="py-12 text-center text-xs font-medium text-zinc-400">
            No recent orders recorded.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 6).map((order) => (
              <div
                key={order.order_id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 backdrop-blur-md transition-all hover:border-white/15 hover:bg-white/[0.05]"
              >
                <div className="flex items-center gap-3">
                  {/* Token Pill */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 font-mono text-xs font-bold text-blue-300">
                    {order.token || "N/A"}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono">
                        Reg: {order.register_number}
                      </span>
                      {order.is_priority && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-amber-300 bg-amber-500/20 border border-amber-400/30 px-1.5 py-0.2 rounded-md">
                          <Zap className="h-2.5 w-2.5 fill-amber-300" />
                          PRIORITY
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 font-medium">{order.shop_name}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                  {getStatusBadge(order.status)}
                  <p className="text-xs font-bold text-white">{formatCurrency(order.grand_total)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
