"use client";

import { Zap, ShieldCheck, CheckCircle2 } from "lucide-react";

interface PriorityPricingCardProps {
  priorityFee: number;
  allowNewOrders: boolean;
  onAllowNewOrdersToggle: (val: boolean) => void;
}

export default function PriorityPricingCard({
  priorityFee,
  allowNewOrders,
  onAllowNewOrdersToggle,
}: PriorityPricingCardProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/90 p-5 shadow-xl backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Priority Pass & Queue Policy</h3>
            <p className="text-xs text-slate-400">
              Current express priority surcharge is{" "}
              <span className="text-emerald-400 font-bold">₹{priorityFee.toFixed(2)}</span> — editable in Platform Charges above
            </p>
          </div>
        </div>

        {/* Order Acceptance Toggle — Admin configurable */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xs font-semibold text-slate-300">
            {allowNewOrders ? "Accepting Orders" : "Orders Paused"}
          </span>
          <div
            onClick={() => onAllowNewOrdersToggle(!allowNewOrders)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
              allowNewOrders ? "bg-emerald-500" : "bg-slate-700"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                allowNewOrders ? "translate-x-4" : "translate-x-1"
              }`}
            />
          </div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Current Surcharge Display */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-emerald-500/20 space-y-2">
          <span className="text-emerald-400 font-bold block">Active Priority Surcharge</span>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            ₹{priorityFee.toFixed(2)}
          </div>
          <p className="text-slate-400 text-[11px]">
            Charged per order when a student selects express fast-track. Modify in Platform Charges section.
          </p>
        </div>

        {/* Queue Policy Rule 1 */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Express Fast-Track Queue
          </span>
          <p className="text-slate-400 text-[11px]">
            Priority orders are placed into P-series queue tokens for immediate printing ahead of regular orders.
          </p>
        </div>

        {/* Queue Policy Rule 2 */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <span className="text-cyan-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Surcharge Revenue Policy
          </span>
          <p className="text-slate-400 text-[11px]">
            Priority surcharges are collected during payment and included in the daily merchant settlement.
          </p>
        </div>
      </div>
    </div>
  );
}
