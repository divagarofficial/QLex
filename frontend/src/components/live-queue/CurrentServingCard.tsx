"use client";

import { motion } from "framer-motion";
import { Printer, Sparkles, Clock, CheckCircle2 } from "lucide-react";

interface CurrentServingCardProps {
  currentServingToken: string | null;
  totalInQueue: number;
}

export default function CurrentServingCard({
  currentServingToken,
  totalInQueue,
}: CurrentServingCardProps) {
  const isPrinting = !!currentServingToken;

  // Estimated completion calculation (current time + ~3 minutes)
  const now = new Date();
  const finishTime = new Date(now.getTime() + 3 * 60000);
  const formattedFinishTime = finishTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="deep-glass relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/[0.08] via-amber-500/[0.02] to-transparent shadow-2xl">
      <div className="deep-glass-reflection" />
      <div className="deep-glass-rim" />
      <div className="deep-glass-sweep" />

      {/* Decorative ambient glowing backdrops */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        {/* Left Info Column */}
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 text-xs font-semibold text-amber-300">
            <Sparkles size={14} className="text-amber-400 animate-pulse" />
            <span>HERO QUEUE TRACKER</span>
          </div>

          <div>
            <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">
              Currently Serving Token
            </h2>
            <div className="mt-2 flex items-baseline gap-4">
              <span className="font-mono text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 sm:text-6xl drop-shadow-md">
                {currentServingToken || "IDLE"}
              </span>

              {isPrinting ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-400">
                  <Printer size={13} className="animate-bounce text-emerald-400" />
                  Printing in Progress
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-medium text-white/50">
                  <Clock size={13} />
                  Queue Standing By
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-white/60 sm:text-sm max-w-lg leading-relaxed">
            {isPrinting
              ? `Token ${currentServingToken} is on the print bed. Printing and quality checks are underway.`
              : "No token is currently actively printing. Next student in line will be called automatically."}
          </p>

          {/* Progress Bar */}
          {isPrinting && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60 flex items-center gap-1.5">
                  <Printer size={13} className="text-amber-400" /> Printing Progress
                </span>
                <span className="font-mono font-semibold text-amber-300">65%</span>
              </div>
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/10 p-0.5 border border-white/10">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "65%" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-cyan-400 shadow-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Stats Box */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
          <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] border border-white/10 p-4 backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Clock size={20} />
            </div>
            <div>
              <div className="text-[11px] font-medium text-white/40">Est. Finish Time</div>
              <div className="font-mono text-lg font-bold text-white/90">
                {isPrinting ? formattedFinishTime : "Ready"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] border border-white/10 p-4 backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="text-[11px] font-medium text-white/40">Total Waiting</div>
              <div className="font-mono text-lg font-bold text-white/90">
                {totalInQueue} {totalInQueue === 1 ? "Token" : "Tokens"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
