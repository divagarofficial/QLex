"use client";

import { motion } from "framer-motion";
import {
  Building2,
  Tag,
  ShieldCheck,
  Zap,
  CheckCircle2,
  FileText,
  Award,
  HelpCircle,
} from "lucide-react";
import DashboardHeader from "@/components/shop/DashboardHeader";

export default function SatelliteShopPricingPage() {
  return (
    <div className="min-h-screen bg-[#030406] text-white font-sans selection:bg-emerald-500/30">
      <DashboardHeader
        unreadNotificationCount={0}
        onToggleNotifications={() => {}}
        hubTitle="Satellite Hub Terminal"
        isSatellite={true}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-8 space-y-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-emerald-950/60 border border-emerald-500/25 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Tag className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Institutional Allocation Policy</span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Zero-Cost Staff Printing
                </span>
              </div>
              <h1 className="text-2xl font-black text-white mt-0.5">Staff & Faculty Printing Rules</h1>
            </div>
          </div>
        </div>

        {/* Policy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-emerald-500/20 bg-emerald-950/15 p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                Complimentary
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">Institution-Funded Quota</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              All faculty members and department staff receive complimentary printing privileges at QLex Satellite Print Hub (A103, Dept of AI & Data Science). No payment is required per transaction.
            </p>
            <div className="pt-2 border-t border-white/10 text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>₹0.00 Student / Staff Charge</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-300">
                <Award className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 px-2.5 py-1 rounded-full">
                Priority Dispatch
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">First-Come S-Token Queue</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Staff orders are issued sequential S-Tokens (S-1, S-2, S-3...). Dedicated high-speed duplex laser printers process departmental exam papers, notes, and admin documents.
            </p>
            <div className="pt-2 border-t border-white/10 text-xs text-cyan-300 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              <span>Instant Local Hardware Spooling</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300">
                <FileText className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-full">
                Paper Specifications
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">Supported Formats</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Standard A4 and A3 mono and color documents are spooled automatically with duplex (double-sided) support for eco-friendly academic document printing.
            </p>
            <div className="pt-2 border-t border-white/10 text-xs text-amber-300 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-amber-400" />
              <span>A4 / A3 Single & Duplex</span>
            </div>
          </motion.div>
        </div>

        {/* Audit Rate Schedule */}
        <div className="p-6 rounded-3xl border border-white/10 bg-white/5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-400" />
            <span>Internal Department Accounting Matrix</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-zinc-400 uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">Job Type</th>
                  <th className="py-3 px-4">Paper Format</th>
                  <th className="py-3 px-4">Internal Transfer Value</th>
                  <th className="py-3 px-4">Faculty Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-200 font-medium">
                <tr>
                  <td className="py-3 px-4 font-bold text-white">Standard Black & White</td>
                  <td className="py-3 px-4">A4 Single / Duplex</td>
                  <td className="py-3 px-4 text-zinc-400">₹1.50 / page (Department Ledger)</td>
                  <td className="py-3 px-4 font-bold text-emerald-400">FREE (Complimentary)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-white">Full Color Academic</td>
                  <td className="py-3 px-4">A4 Single / Duplex</td>
                  <td className="py-3 px-4 text-zinc-400">₹8.00 / page (Department Ledger)</td>
                  <td className="py-3 px-4 font-bold text-emerald-400">FREE (Complimentary)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-white">Large Format Poster / Chart</td>
                  <td className="py-3 px-4">A3 Color</td>
                  <td className="py-3 px-4 text-zinc-400">₹15.00 / page (Department Ledger)</td>
                  <td className="py-3 px-4 font-bold text-emerald-400">FREE (Complimentary)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
