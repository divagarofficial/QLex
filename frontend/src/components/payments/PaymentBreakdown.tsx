"use client";

import { CreditCard, Receipt, Sparkles, ShieldCheck } from "lucide-react";

interface PaymentBreakdownProps {
  grandTotal: number;
  isPriority?: boolean;
}

export default function PaymentBreakdown({
  grandTotal,
  isPriority = false,
}: PaymentBreakdownProps) {
  // Approximate standard backend fee allocation
  const priorityAmount = isPriority ? grandTotal * 0.08 : 0;
  const printingTotal = (grandTotal - priorityAmount).toFixed(2);
  const priorityFee = priorityAmount.toFixed(2);

  return (
    <div className="deep-glass relative overflow-hidden p-6 rounded-3xl border border-white/10 space-y-4">
      <div className="deep-glass-reflection" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
          <Receipt size={18} className="text-amber-400" />
          <h3 className="text-base font-bold text-white/90">
            Payment Breakdown & Charges
          </h3>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-white/70">
            <span>Print Total</span>
            <span className="font-mono font-medium">₹{printingTotal}</span>
          </div>

          {isPriority && (
            <div className="flex items-center justify-between text-amber-300">
              <span className="flex items-center gap-1">
                <Sparkles size={11} /> Priority Queue Fee
              </span>
              <span className="font-mono font-medium">₹{priorityFee}</span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-white/10 pt-3 text-sm font-bold text-white/95">
            <span>Grand Total</span>
            <span className="font-mono text-emerald-400">₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-white/[0.02] border border-white/5 p-3 text-[11px] text-white/40">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Includes standard campus print tax & server maintenance fees.</span>
        </div>
      </div>
    </div>
  );
}
