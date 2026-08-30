"use client";

import { motion } from "framer-motion";
import { Award, GraduationCap, Building2 } from "lucide-react";
import GlassCard from "@/components/glass/GlassCard";
import { SPECIAL_THANKS_LIST } from "./creditsData";

export default function SpecialThanks() {
  return (
    <section
      aria-label="Special Thanks"
      className="w-full flex flex-col items-center text-center space-y-6"
    >
      {/* Title */}
      <div className="flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-2 shadow-lg shadow-amber-500/5">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Acknowledgements</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Special Thanks
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mt-1">
          With deep gratitude for support and academic encouragement.
        </p>
      </div>

      {/* Acknowledgements Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {SPECIAL_THANKS_LIST.map((item, idx) => (
          <motion.div
            key={item.id || idx}
            whileHover={{ y: -6, scale: 1.015 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <GlassCard>
              <div className="flex flex-col items-center justify-center p-7 text-center h-full group">
                {/* Icon Emblem */}
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/[0.12] text-amber-300 mb-4 shadow-xl group-hover:border-amber-400/40 group-hover:scale-105 transition-all">
                  {idx === 0 ? (
                    <GraduationCap className="w-7 h-7 text-amber-300" />
                  ) : (
                    <Building2 className="w-7 h-7 text-amber-300" />
                  )}
                </div>

                {/* Institution Name */}
                <h4 className="text-base sm:text-lg font-bold text-white mb-1.5 leading-snug">
                  {item.name}
                </h4>

                {/* Subtitle */}
                {item.subtitle && (
                  <span className="text-xs text-amber-300/80 font-semibold tracking-wide mb-1">
                    {item.subtitle}
                  </span>
                )}

                {/* Role Description */}
                {item.roleDescription && (
                  <p className="text-[11px] sm:text-xs text-zinc-400 font-light mt-1 max-w-xs leading-normal">
                    {item.roleDescription}
                  </p>
                )}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
