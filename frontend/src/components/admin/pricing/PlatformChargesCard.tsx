"use client";

import { DollarSign, Lock } from "lucide-react";

interface PlatformChargesCardProps {
  platformFee: number;
  priorityFee: number;
  onPlatformFeeChange: (val: number) => void;
  onPriorityFeeChange: (val: number) => void;
}

export default function PlatformChargesCard({
  platformFee,
  priorityFee,
  onPlatformFeeChange,
  onPriorityFeeChange,
}: PlatformChargesCardProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/90 p-5 shadow-xl backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Platform Fee Surcharges</h3>
            <p className="text-xs text-slate-400">
              Fixed order-level surcharges collected by the platform — stored in{" "}
              <code className="text-cyan-400 text-[11px]">platform_settings</code>
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
          GST Exempt (0%)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Platform Fee */}
        <div className="space-y-1.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <label className="text-slate-200 font-bold flex items-center justify-between">
            <span>Platform Service Fee</span>
            <span className="text-[10px] text-cyan-400 font-mono">FIXED PER ORDER</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold">
              ₹
            </span>
            <input
              type="number"
              step="0.5"
              min="0"
              max="500"
              value={platformFee}
              onChange={(e) => onPlatformFeeChange(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono font-semibold focus:outline-none focus:border-cyan-500/80 transition-all"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Fixed administrative processing surcharge added once to every completed order.
          </p>
        </div>

        {/* Priority Surcharge */}
        <div className="space-y-1.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <label className="text-slate-200 font-bold flex items-center justify-between">
            <span>Express Priority Surcharge</span>
            <span className="text-[10px] text-emerald-400 font-mono">EXPRESS QUEUE</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold">
              ₹
            </span>
            <input
              type="number"
              step="1"
              min="0"
              max="500"
              value={priorityFee}
              onChange={(e) => onPriorityFeeChange(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono font-semibold focus:outline-none focus:border-emerald-500/80 transition-all"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Priority pass surcharge collected when students request express fast-track printing.
          </p>
        </div>
      </div>

      {/* Info note about convenience fee */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-[11px] text-amber-400/80">
        <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        <span>
          <strong>Convenience Fee</strong> is set per print type (B&W / Colour, Single / Double side) and is edited
          below in the Print Pricing Rules section.
        </span>
      </div>
    </div>
  );
}
