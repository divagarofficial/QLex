"use client";

import { motion } from "framer-motion";
import { Receipt, DollarSign, ArrowDownRight, ArrowUpRight, Percent, Minus, Plus } from "lucide-react";
import type { SettlementItem } from "@/types/shop";

interface SettlementBreakdownProps {
  settlement: SettlementItem;
}

export default function SettlementBreakdown({ settlement }: SettlementBreakdownProps) {
  const grossSales = settlement.gross_sales ?? settlement.amount ?? 0;
  const printingRevenue = settlement.printing_revenue ?? settlement.amount ?? 0;
  const platformFee = settlement.platform_fee_deduction ?? 0;
  const convenienceFee = settlement.convenience_fee_deduction ?? 0;
  const priorityFee = settlement.priority_fee_deduction ?? 0;
  const tax = settlement.tax ?? 0;
  const netAmount = settlement.net_settlement_amount ?? settlement.amount ?? 0;

  const items = [
    {
      label: "Gross Order Sales",
      value: grossSales,
      type: "neutral",
      description: "Total order value paid by students",
    },
    {
      label: "Printing Revenue (Shop Earnings)",
      value: printingRevenue,
      type: "positive",
      description: "Base document print cost earned by merchant",
    },
    {
      label: "Platform Fee Deduction",
      value: platformFee,
      type: "deduction",
      description: "QLex platform infrastructure fee",
    },
    {
      label: "Convenience Fee Deduction",
      value: convenienceFee,
      type: "deduction",
      description: "Payment gateway processing fee",
    },
    {
      label: "Priority Fee Deduction",
      value: priorityFee,
      type: "deduction",
      description: "Express priority queue fee retained by platform",
    },
    {
      label: "Tax / GST",
      value: tax,
      type: "deduction",
      description: "Applicable statutory taxes",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 shadow-xl shadow-black/20">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Receipt className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Settlement Financial Breakdown</h3>
          <p className="text-xs text-slate-400">
            Calculated directly from order settlement data
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors"
          >
            <div>
              <span className="block text-sm font-semibold text-slate-200">
                {item.label}
              </span>
              <span className="block text-[11px] text-slate-400">{item.description}</span>
            </div>

            <div className="text-right font-mono font-bold text-sm">
              {item.type === "deduction" && item.value > 0 ? (
                <span className="text-rose-400">
                  -₹{item.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              ) : item.type === "positive" ? (
                <span className="text-emerald-400">
                  +₹{item.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              ) : (
                <span className="text-white">
                  ₹{item.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Net Payout Total */}
      <div className="mt-6 pt-4 border-t border-amber-500/30 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-transparent p-4 rounded-xl border">
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-amber-400">
            Net Settlement Amount
          </span>
          <span className="block text-xs text-slate-400">Final transfer amount to merchant account</span>
        </div>

        <div className="text-2xl font-black text-white font-mono tracking-tight text-amber-300">
          ₹{netAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
}
