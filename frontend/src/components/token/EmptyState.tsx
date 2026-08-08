"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TicketX, Plus, History, Sparkles } from "lucide-react";
import BackgroundEffects from "./BackgroundEffects";

export default function EmptyState() {
  return (
    <div className="min-h-screen bg-[#030406] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <BackgroundEffects />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md rounded-[32px] bg-[#070b14]/85 border border-white/15 p-8 sm:p-10 text-center backdrop-blur-2xl shadow-2xl overflow-hidden"
      >
        {/* Subtle top edge highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

        {/* Ambient Ring Glow */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-3xl bg-cyan-500/20 blur-xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-2xl backdrop-blur-xl">
            <TicketX className="w-10 h-10" />
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">
          No Active Token
        </h2>

        <p className="text-sm text-slate-300 font-normal mb-8 leading-relaxed">
          You don&apos;t have an active print order. Submit a document to generate a digital queue token.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/student/new-order"
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-extrabold text-sm transition-all duration-300 shadow-[0_0_25px_rgba(6,182,212,0.35)] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Order</span>
          </Link>

          <Link
            href="/student/orders"
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-200 hover:text-white font-semibold text-sm transition duration-200 cursor-pointer"
          >
            <History className="w-4 h-4" />
            <span>Order History</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
