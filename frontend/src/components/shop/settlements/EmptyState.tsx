"use client";

import { motion } from "framer-motion";
import { Landmark, Sparkles, AlertCircle } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  message?: string;
  secondaryText?: string;
}

export default function EmptyState({
  title = "No settlements available yet.",
  message,
  secondaryText = "Completed print orders will appear here after settlement.",
}: EmptyStateProps) {
  const bodyText = message || secondaryText;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/10 p-12 text-center shadow-xl shadow-black/20 my-8"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto space-y-4">
        {/* Premium Illustration Icon */}
        <div className="relative w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
          <Landmark className="w-10 h-10 text-amber-400" />
          <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-300 animate-pulse" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            {bodyText}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
