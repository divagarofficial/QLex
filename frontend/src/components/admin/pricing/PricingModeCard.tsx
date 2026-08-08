"use client";

import Link from "next/link";
import { SlidersHorizontal, ExternalLink, ShieldCheck } from "lucide-react";

export default function PricingModeCard() {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/90 p-5 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <SlidersHorizontal className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Active Pricing Mode</h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-wider">
              Global Platform Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Pricing rules configured here apply to all active print shops across QLex unless merchant overrides exist.
          </p>
        </div>
      </div>

      <Link
        href="/admin/pricing/shops"
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all border border-slate-700 whitespace-nowrap shadow-md"
      >
        <span>Manage Shop Specific Overrides</span>
        <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
      </Link>
    </div>
  );
}
