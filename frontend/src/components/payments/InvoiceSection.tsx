"use client";

import { motion } from "framer-motion";
import { FileText, Download, Eye, Calendar, DollarSign } from "lucide-react";
import type { PaymentItem } from "@/types/student";

interface InvoiceSectionProps {
  completedPayments: PaymentItem[];
  onOpenReceipt: (item: PaymentItem) => void;
}

export default function InvoiceSection({
  completedPayments,
  onOpenReceipt,
}: InvoiceSectionProps) {
  const invoices = completedPayments.slice(0, 3);

  if (invoices.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white/90">Invoices & Receipts</h2>
        <span className="text-xs text-white/40">Downloadable tax documents</span>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {invoices.map((inv) => {
          const receiptNo = `REC-${inv.payment_id.slice(0, 6).toUpperCase()}`;
          const dateStr = inv.paid_at
            ? new Date(inv.paid_at).toLocaleDateString([], { month: "short", day: "numeric" })
            : "Recent";

          return (
            <motion.div
              key={inv.payment_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="deep-glass group relative overflow-hidden p-4 rounded-2xl border border-white/10 space-y-3"
            >
              <div className="deep-glass-reflection" />
              <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <FileText size={16} />
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    ₹{Number(inv.amount).toFixed(2)}
                  </span>
                </div>

                <div>
                  <div className="font-mono text-sm font-bold text-white/90">
                    {receiptNo}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-white/40">
                    <Calendar size={11} /> {dateStr}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                  <button
                    onClick={() => onOpenReceipt(inv)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-white/5 border border-white/10 py-1.5 text-xs font-medium text-amber-300 hover:bg-white/10"
                  >
                    <Eye size={12} />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => onOpenReceipt(inv)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                    title="Download PDF"
                  >
                    <Download size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
