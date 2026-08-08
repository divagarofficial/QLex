"use client";

import { motion } from "framer-motion";
import { KeyRound, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnlockButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  success?: boolean;
}

export default function UnlockButton({
  onClick,
  disabled,
  loading,
  success = false,
}: UnlockButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl py-4 px-6 font-semibold text-sm transition-all duration-300",
        "flex items-center justify-center gap-2 select-none cursor-pointer",
        // Glass surface button
        "border backdrop-blur-xl shadow-xl",
        success
          ? "border-emerald-400/50 bg-gradient-to-r from-emerald-500/30 via-emerald-600/30 to-emerald-500/30 text-white shadow-[0_0_35px_rgba(52,211,153,0.3)]"
          : disabled
          ? "border-white/5 bg-white/[0.02] text-zinc-500 cursor-not-allowed opacity-60"
          : "border-amber-400/30 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-600/20 text-white shadow-[0_0_30px_rgba(231,200,115,0.15)] hover:border-amber-400/60 hover:from-amber-500/30 hover:to-amber-600/30 hover:shadow-[0_0_45px_rgba(231,200,115,0.25)]"
      )}
    >
      {/* Light sweep effect on hover */}
      {!disabled && !loading && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      )}

      {/* Button Content */}
      <span className="relative z-10 flex items-center justify-center gap-2 tracking-wide font-medium">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
            <span>Authenticating PIN...</span>
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-emerald-300 animate-bounce" />
            <span>Access Granted</span>
          </>
        ) : (
          <>
            <KeyRound className="h-4 w-4 text-amber-300 transition-transform duration-300 group-hover:rotate-12" />
            <span>Unlock Shop Dashboard</span>
            <ArrowRight className="h-4 w-4 text-white/70 transition-transform duration-300 group-hover:translate-x-1" />
          </>
        )}
      </span>
    </motion.button>
  );
}
