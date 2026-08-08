"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, ShieldOff } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function EmptyState({
  title = "No Data Available",
  message = "Backend data could not be retrieved or is currently empty.",
  onRetry,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="deep-glass relative overflow-hidden rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl text-center my-8 max-w-xl mx-auto"
    >
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 backdrop-blur-xl">
        <ShieldOff className="h-8 w-8 text-amber-400" />
      </div>

      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-xs text-zinc-400 max-w-md mx-auto mb-6 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-6 py-3 text-xs font-bold text-white backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/20 hover:scale-105"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry Connection</span>
        </button>
      )}
    </motion.div>
  );
}
