"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CreditCard, Clock, Store, ArrowRight, ShieldCheck } from "lucide-react";
import PaymentStatusChip from "./PaymentStatusChip";
import type { PaymentItem, MyOrderItem } from "@/types/student";

interface OutstandingPaymentsProps {
  pendingPayments: PaymentItem[];
  pendingOrders: MyOrderItem[];
  onPayNow: (orderId: string, amount: number) => void;
}

export default function OutstandingPayments({
  pendingPayments,
  pendingOrders,
  onPayNow,
}: OutstandingPaymentsProps) {
  // Combine pending payments with pending orders that don't have payment records yet
  const items = pendingPayments.length > 0
    ? pendingPayments
    : pendingOrders.map((o) => ({
        payment_id: o.order_id,
        order_id: o.order_id,
        token: o.token,
        amount: o.total_amount,
        status: o.payment_status,
        paid_at: null,
        created_at: o.created_at,
      }));

  if (items.length === 0) {
    return (
      <div className="deep-glass relative overflow-hidden p-6 rounded-3xl border border-white/10 text-center">
        <div className="deep-glass-reflection" />
        <div className="relative z-10 flex flex-col items-center py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-base font-bold text-white/90">
            No Outstanding Payments
          </h3>
          <p className="mt-1 text-xs text-white/50 max-w-sm">
            All your print orders are fully paid. You have no pending dues.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-amber-400 animate-pulse" />
          <h2 className="text-lg font-bold text-white/90">
            Outstanding Payments ({items.length})
          </h2>
        </div>
        <span className="text-xs text-amber-300 font-medium bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
          Action Required
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((item) => (
          <motion.div
            key={item.payment_id || item.order_id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="deep-glass group relative overflow-hidden p-5 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-500/[0.06] via-amber-500/[0.01] to-transparent shadow-lg"
          >
            <div className="deep-glass-reflection" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <span className="font-mono text-sm font-bold text-white/90">
                      {item.token ? `Token #${item.token}` : `Order #${item.order_id.slice(0, 8)}`}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                      <Store size={11} />
                      <span>QLex Central Print Hub</span>
                    </div>
                  </div>
                </div>

                <PaymentStatusChip status={item.status} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-white/50">Amount Due</span>
                  <div className="font-mono text-2xl font-black text-amber-300">
                    ₹{Number(item.amount).toFixed(2)}
                  </div>
                </div>

                <div className="text-right text-[11px] text-white/40">
                  <span>Status:</span>
                  <div className="font-medium text-amber-200">Payment Pending</div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => onPayNow(item.order_id, Number(item.amount))}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <CreditCard size={14} />
                  <span>Pay Now</span>
                </button>

                <Link
                  href="/student/orders"
                  className="inline-flex items-center justify-center gap-1 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-medium text-white/80 transition-all hover:bg-white/10"
                >
                  <span>View Order</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
