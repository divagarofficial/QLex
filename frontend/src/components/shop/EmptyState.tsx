"use client";

import { motion } from "framer-motion";
import { Coffee, Sparkles, ShieldCheck } from "lucide-react";

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="deep-glass relative overflow-hidden rounded-3xl p-10 text-center border border-white/10 shadow-2xl"
    >
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-400/30 bg-amber-500/10 text-amber-300 shadow-[0_0_40px_rgba(231,200,115,0.15)]">
        <Coffee className="h-10 w-10 text-amber-400 animate-bounce" />
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300 mb-2">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Queue Clear</span>
      </div>

      <h3 className="bg-gradient-to-r from-white via-amber-100 to-champagne-300 bg-clip-text text-2xl font-black tracking-tight text-transparent sm:text-3xl">
        No orders waiting.
      </h3>

      <p className="mt-2 text-sm font-medium text-zinc-400 max-w-sm mx-auto leading-relaxed">
        Enjoy the break! New print orders will automatically appear here as students place them.
      </p>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-zinc-500">
        <ShieldCheck className="h-4 w-4 text-emerald-400" />
        <span>Live polling active • Listening for incoming print jobs</span>
      </div>
    </motion.div>
  );
}
