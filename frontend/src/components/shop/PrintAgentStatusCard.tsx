"use client";

import { useState } from "react";
import { Printer, CheckCircle2, RefreshCw, Cpu, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function PrintAgentStatusCard() {
  const [autoPrintEnabled, setAutoPrintEnabled] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="deep-glass relative overflow-hidden rounded-3xl border border-white/10 p-5 shadow-2xl backdrop-blur-xl"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Section: Status & Icon */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400">
            <Printer className="h-6 w-6" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-black"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">Auto-Print Agent</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> Connected
              </span>
            </div>
            <p className="mt-0.5 text-xs text-zinc-400 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-amber-400" />
              <span>Multi-Printer Pool Active • Auto-assigning idle printers</span>
            </p>
          </div>
        </div>

        {/* Right Section: Mode Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <Zap className={`h-4 w-4 ${autoPrintEnabled ? "text-amber-400" : "text-zinc-500"}`} />
            <span className="text-xs font-semibold text-zinc-300">Auto Direct-Print</span>
            <button
              onClick={() => setAutoPrintEnabled(!autoPrintEnabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoPrintEnabled ? "bg-amber-500" : "bg-zinc-700"
              }`}
              role="switch"
              aria-checked={autoPrintEnabled}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                  autoPrintEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
