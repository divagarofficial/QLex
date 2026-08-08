"use client";

import Link from "next/link";
import { Wallet, PlusCircle, ArrowRight, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="deep-glass relative overflow-hidden p-8 sm:p-12 rounded-3xl border border-white/10 text-center"
    >
      <div className="deep-glass-reflection" />
      <div className="relative z-10 flex flex-col items-center max-w-md mx-auto">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-6 shadow-xl shadow-amber-500/5">
          <Wallet size={40} />
        </div>

        <h2 className="text-2xl font-bold text-white/90">
          You haven&apos;t made any payments yet
        </h2>
        <p className="mt-2 text-sm text-white/50 leading-relaxed">
          Your wallet transaction history is empty. Place a print order to generate your first payment receipt and track print expenses.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            href="/student/new-order"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <PlusCircle size={18} />
            <span>Create New Order</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/student/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-3.5 text-sm font-semibold text-white/80 transition-all hover:bg-white/10"
          >
            <BookOpen size={16} />
            <span>Learn About QLex</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
