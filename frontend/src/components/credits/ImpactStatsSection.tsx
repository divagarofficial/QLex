"use client";

import { motion } from "framer-motion";
import { Zap, Clock, ShieldCheck, Leaf } from "lucide-react";
import GlassCard from "@/components/glass/GlassCard";
import { IMPACT_STATS, ImpactStat } from "./creditsData";

const iconMap = {
  Zap,
  Clock,
  ShieldCheck,
  Leaf,
};

export default function ImpactStatsSection() {
  return (
    <section aria-label="Campus Impact Statistics" className="w-full flex justify-center">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
          {IMPACT_STATS.map((stat: ImpactStat, index: number) => {
            const Icon = iconMap[stat.iconName] || Zap;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="w-full"
              >
                <GlassCard>
                  <div className="p-4 sm:p-5 flex flex-col items-center text-center space-y-2 relative group overflow-hidden">
                    {/* Top Glow bar */}
                    <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent group-hover:via-amber-300 transition-colors" />

                    {/* Icon Container */}
                    <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-amber-300 shadow-md group-hover:scale-110 group-hover:border-amber-400/40 transition-all duration-300">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                    </div>

                    {/* Big Metric Value */}
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-white gold-text">
                      {stat.value}
                    </span>

                    {/* Label */}
                    <span className="text-xs font-semibold text-zinc-300 tracking-wide">
                      {stat.label}
                    </span>

                    {/* Subtext */}
                    <span className="text-[10px] sm:text-[11px] text-zinc-400 font-light leading-tight">
                      {stat.subtext}
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
