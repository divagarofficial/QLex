"use client";

import { motion } from "framer-motion";
import { CreditCard, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { RecentPaymentItem } from "@/services/adminDashboard";

interface RecentPaymentsProps {
  payments: RecentPaymentItem[];
}

export default function RecentPayments({ payments }: RecentPaymentsProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val);

  return (
    <div className="deep-glass relative overflow-hidden rounded-3xl p-6 border border-white/10 shadow-xl flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">Recent Payments</h2>
            </div>
            <p className="text-xs text-zinc-400">Verified platform transactions</p>
          </div>

          <Link
            href="/admin/payments"
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* List */}
        {payments.length === 0 ? (
          <div className="py-12 text-center text-xs font-medium text-zinc-400">
            No payments recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {payments.slice(0, 6).map((payment) => (
              <div
                key={payment.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 backdrop-blur-md transition-all hover:border-white/15 hover:bg-white/[0.05]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-white font-mono truncate max-w-[180px]">
                      {payment.transaction_id}
                    </p>
                    <p className="text-[11px] text-zinc-400 font-medium">
                      Student: {payment.register_number} • {payment.gateway.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                    <CheckCircle2 className="h-3 w-3" />
                    {payment.status}
                  </span>
                  <p className="text-xs font-extrabold text-emerald-300">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
