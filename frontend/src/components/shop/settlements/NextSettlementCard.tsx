"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Building2, ShieldCheck, ArrowRight, Sparkles, Clock, Layers } from "lucide-react";
import SettlementStatusChip from "./SettlementStatusChip";
import type { SettlementItem } from "@/types/shop";

interface NextSettlementCardProps {
  pendingSettlement?: SettlementItem | null;
}

export default function NextSettlementCard({ pendingSettlement }: NextSettlementCardProps) {
  if (!pendingSettlement) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-white/10 p-6 mb-8 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-slate-400">
          <Clock className="w-5 h-5 text-amber-400" />
          <p className="text-sm font-medium">No upcoming settlement scheduled for today.</p>
        </div>
      </div>
    );
  }

  const expectedAmount = pendingSettlement.amount || 0;
  const expectedDateStr = pendingSettlement.settlement_date
    ? new Date(pendingSettlement.settlement_date).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Today";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-slate-950/95 border border-amber-500/20 p-6 lg:p-8 mb-8 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] group"
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left main info */}
        <div className="space-y-4 max-w-xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Next Settlement Payout
            </span>

            <SettlementStatusChip status={pendingSettlement.status || "PENDING"} />

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-slate-300">
              <Layers className="w-3 h-3 text-slate-400" />
              Daily Cycle
            </span>
          </div>

          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Expected Settlement Amount
            </span>
            <div className="text-4xl lg:text-5xl font-black text-white tracking-tight mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-amber-400">₹</span>
              <span className="bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
                {expectedAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Target Transfer Date
                </span>
                <span className="text-xs font-bold text-slate-200">{expectedDateStr}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Payout Method
                </span>
                <span className="text-xs font-bold text-slate-200">RIT Merchant Account</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right CTA button */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-center gap-3">
          <Link
            href={`/shop/settlements/${pendingSettlement.id}`}
            className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] transition-all duration-200"
          >
            <span>View Details</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Direct Transfer</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
