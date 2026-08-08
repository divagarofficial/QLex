"use client";

import { SettlementItem } from "@/services/adminSettlements";
import { DollarSign, Percent, ShieldCheck, Printer, ArrowDownRight } from "lucide-react";

interface SettlementBreakdownProps {
  settlement: SettlementItem;
  compact?: boolean;
}

export default function SettlementBreakdown({ settlement, compact = false }: SettlementBreakdownProps) {
  const grossSales = settlement.gross_sales || settlement.amount || 0;
  const printingRevenue = settlement.printing_revenue || settlement.amount || 0;
  const platformFee = settlement.platform_fee_deduction || 0;
  const convenienceFee = settlement.convenience_fee_deduction || 0;
  const priorityFee = settlement.priority_fee_deduction || 0;
  const tax = settlement.tax || 0;
  const netSettlement = settlement.net_settlement_amount || settlement.amount || 0;

  if (compact) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
        <div>
          <span className="text-slate-400 block font-medium">Gross Payments</span>
          <span className="text-slate-200 font-semibold">₹{grossSales.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Print Rev</span>
          <span className="text-slate-200 font-semibold">₹{printingRevenue.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Platform Fee</span>
          <span className="text-rose-400 font-semibold">-₹{platformFee.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Convenience Fee</span>
          <span className="text-cyan-400 font-semibold">₹{convenienceFee.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Priority Fee</span>
          <span className="text-purple-400 font-semibold">₹{priorityFee.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Net Payout</span>
          <span className="text-emerald-400 font-bold">₹{netSettlement.toFixed(2)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/90 border border-slate-800/90 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <h4 className="text-xs font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Financial Settlement Breakdown
        </h4>
        <span className="text-[11px] font-medium text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded-full">
          {settlement.orders_count || 0} Orders Included
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between py-1 text-slate-300">
          <span className="flex items-center gap-1.5 text-slate-400">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            Gross Student Payments
          </span>
          <span className="font-semibold text-slate-100">₹{grossSales.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between py-1 text-slate-300">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            Shop Printing Revenue
          </span>
          <span className="font-semibold text-emerald-400">₹{printingRevenue.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between py-1 text-slate-300">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Percent className="w-3.5 h-3.5 text-rose-400" />
            Platform Fee
          </span>
          <span className="font-semibold text-rose-400">-₹{platformFee.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between py-1 text-slate-300">
          <span className="flex items-center gap-1.5 text-slate-400">
            <ArrowDownRight className="w-3.5 h-3.5 text-cyan-400" />
            Convenience Fee
          </span>
          <span className="font-medium text-cyan-300">₹{convenienceFee.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between py-1 text-slate-300">
          <span className="flex items-center gap-1.5 text-slate-400">
            <ArrowDownRight className="w-3.5 h-3.5 text-purple-400" />
            Priority Pass Fee
          </span>
          <span className="font-medium text-purple-300">₹{priorityFee.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between py-1 text-slate-300">
          <span className="flex items-center gap-1.5 text-slate-400">
            Taxes (GST 0%)
          </span>
          <span className="font-medium text-slate-400">₹{tax.toFixed(2)}</span>
        </div>

        <div className="pt-2.5 mt-2 border-t border-slate-800 flex items-center justify-between text-sm">
          <span className="font-bold text-slate-200">Net Merchant Payout</span>
          <span className="text-base font-extrabold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
            ₹{netSettlement.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
