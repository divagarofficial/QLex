"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Printer, Plus, Info, HelpCircle } from "lucide-react";

interface MyOrdersEmptyStateProps {
  onLearnMore?: () => void;
}

export default function MyOrdersEmptyState({ onLearnMore }: MyOrdersEmptyStateProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="deep-glass relative overflow-hidden rounded-3xl border border-white/10 p-10 sm:p-14 text-center max-w-xl mx-auto my-12"
    >
      <div className="deep-glass-reflection" />
      <div className="deep-glass-rim" />
      <div className="deep-glass-sweep" />

      {/* Ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Animated Icon Ring */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400/20 to-yellow-600/10 border border-amber-400/30 shadow-xl shadow-amber-500/10 mb-6">
          <Printer size={36} className="text-amber-400" />
        </div>

        {/* Header & Subtitle */}
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          No Print Orders Found
        </h2>
        <p className="mt-3 text-sm text-white/50 max-w-sm leading-relaxed">
          You haven't placed any print orders yet. Upload your documents to queue instant printing at QLex Central Hub.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          {/* Primary Action */}
          <button
            onClick={() => router.push("/student/new-order")}
            className="crystal-btn w-full sm:w-auto px-6 py-3 font-bold cursor-pointer"
            aria-label="Create New Order"
          >
            <Plus size={18} />
            <span>Create New Order</span>
          </button>

          {/* Secondary Action */}
          <button
            onClick={onLearnMore}
            className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white cursor-pointer flex items-center justify-center gap-2"
            aria-label="Learn How QLex Works"
          >
            <HelpCircle size={16} className="text-amber-400" />
            <span>Learn How QLex Works</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
