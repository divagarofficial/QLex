"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Store, Building2, ArrowRight, X, ShieldCheck, Cpu } from "lucide-react";
import Link from "next/link";

interface ShopHubSelectionModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ShopHubSelectionModal({ open, onClose }: ShopHubSelectionModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-[#0b0f17] to-[#04060a] p-6 sm:p-8 md:p-10 shadow-2xl shadow-amber-500/10"
          >
            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

            {/* Header Close Button */}
            <button
              onClick={onClose}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Title & Subtitle */}
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                <Store className="h-3.5 w-3.5 text-amber-400" />
                <span>Select Terminal Workspace</span>
              </div>
              <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl tracking-tight">
                Which Print Hub Terminal are you operating?
              </h2>
              <p className="mt-1.5 text-xs text-zinc-400 sm:text-sm">
                Choose your specific shop terminal below to access your dedicated operations flow.
              </p>
            </div>

            {/* Two Distinct Flow Cards */}
            <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Card 1: QLex Central Print Hub */}
              <Link
                href="/shop/login?hub=central"
                onClick={onClose}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-slate-900/60 to-black p-5 sm:p-6 transition-all duration-300 hover:scale-[1.02] hover:border-amber-400/60 hover:shadow-xl hover:shadow-amber-500/10"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      <Store className="h-6 w-6" />
                    </div>
                    <span className="rounded-full border border-amber-400/30 bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      Student Central Hub
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-extrabold text-white group-hover:text-amber-300 transition-colors">
                    QLex Central Print Hub
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                    Main campus terminal operations desk. Manages student priority & regular queue tokens (<code className="text-amber-300">P-</code> & <code className="text-amber-300">R-</code>), online payments, settlements, and pricing matrix.
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-amber-300 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                  <span>Enter Central Hub</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              {/* Card 2: QLex Satellite Print Hub */}
              <Link
                href="/shop/login?hub=satellite"
                onClick={onClose}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-slate-900/60 to-black p-5 sm:p-6 transition-all duration-300 hover:scale-[1.02] hover:border-emerald-400/60 hover:shadow-xl hover:shadow-emerald-500/10"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                      Faculty & Staff Hub
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                    QLex Satellite Print Hub
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                    Terminal Operations Desk at Room A103 (AI & Data Science). Manages sequential <code className="text-emerald-300">S-</code> tokens, zero-cost staff print jobs, live queue, and hardware ink telemetry.
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-emerald-300 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                  <span>Enter Satellite Hub</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
