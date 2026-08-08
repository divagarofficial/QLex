"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CreditCard, FileText, ExternalLink, Calendar, Store } from "lucide-react";
import PaymentStatusChip from "./PaymentStatusChip";
import type { PaymentItem } from "@/types/student";

interface RecentTransactionsProps {
  transactions: PaymentItem[];
  onOpenReceipt: (item: PaymentItem) => void;
}

export default function RecentTransactions({
  transactions,
  onOpenReceipt,
}: RecentTransactionsProps) {
  const recent = transactions.slice(0, 5);

  if (recent.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white/90">Recent Transactions</h2>
        <span className="text-xs text-white/40">Showing latest {recent.length}</span>
      </div>

      <div className="space-y-3">
        {recent.map((tx) => {
          const formattedDate = tx.paid_at
            ? new Date(tx.paid_at).toLocaleDateString([], {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "N/A";

          return (
            <motion.div
              key={tx.payment_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="deep-glass group relative overflow-hidden p-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="deep-glass-reflection" />
              <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Left Info */}
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-amber-400">
                    <CreditCard size={18} />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-white/90">
                        {tx.token ? `Token #${tx.token}` : `Order #${tx.order_id.slice(0, 8)}`}
                      </span>
                      <PaymentStatusChip status={tx.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40">
                      <span className="font-mono text-[11px]">ID: {tx.payment_id.slice(0, 8)}...</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> {formattedDate}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Store size={11} /> QLex Central
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-white/5 sm:border-t-0 pt-2 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <div className="font-mono text-lg font-bold text-white/90">
                      ₹{Number(tx.amount).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-white/40">UPI / Razorpay</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {tx.status.toLowerCase() === "paid" && (
                      <button
                        onClick={() => onOpenReceipt(tx)}
                        className="flex h-8 items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-2.5 text-xs font-medium text-amber-300 transition-all hover:bg-white/10 hover:border-amber-400/30"
                        title="Download Receipt"
                      >
                        <FileText size={13} />
                        <span className="hidden xs:inline">Receipt</span>
                      </button>
                    )}

                    <Link
                      href={`/student/payments/${tx.payment_id}`}
                      className="flex h-8 items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-2.5 text-xs font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
                      title="View Details"
                    >
                      <span className="hidden xs:inline">Details</span>
                      <ExternalLink size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
