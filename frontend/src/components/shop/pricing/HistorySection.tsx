"use client";

import { motion } from "framer-motion";
import { History, ShieldCheck, ArrowRight } from "lucide-react";
import type { PricingHistoryItem } from "@/services/shopPricing";

interface HistorySectionProps {
  history: PricingHistoryItem[];
}

export default function HistorySection({ history }: HistorySectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
      className="rounded-2xl p-6 bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl space-y-4"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800 border border-white/10 text-slate-300">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Pricing Update Audit Log</h2>
            <p className="text-xs text-slate-400">Historical records of print rate modifications.</p>
          </div>
        </div>
        <span className="text-xs font-medium text-slate-400 bg-white/5 px-2.5 py-1 rounded-md">
          {history.length} Entries
        </span>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs">
          No pricing updates recorded in this session.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors gap-2 text-xs"
            >
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-200">{item.field_changed}</span>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="line-through text-slate-500">{item.old_value}</span>
                  <ArrowRight className="w-3 h-3 text-blue-400" />
                  <span className="text-emerald-400 font-bold">{item.new_value}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400 sm:text-right">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>{item.changed_by}</span>
                </div>
                <span className="text-slate-600">•</span>
                <time>{item.changed_at}</time>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
