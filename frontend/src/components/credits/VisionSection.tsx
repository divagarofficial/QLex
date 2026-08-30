"use client";

import { motion } from "framer-motion";
import { Quote, Compass, Zap, Sparkles, Shield, Recycle } from "lucide-react";
import GlassCard from "@/components/glass/GlassCard";
import { VISION_STATEMENT, CORE_VALUES, CoreValue } from "./creditsData";

const valueIconMap = {
  Zap,
  Sparkles,
  Shield,
  Recycle,
};

export default function VisionSection() {
  return (
    <section
      id="vision"
      aria-label="Product Vision & Core Values"
      className="w-full flex flex-col items-center space-y-8 py-2"
    >
      {/* Vision Statement Hero Card */}
      <div className="w-full max-w-3xl">
        <GlassCard>
          <div className="relative p-8 sm:p-14 text-center flex flex-col items-center overflow-hidden">
            {/* Background Quote Watermark */}
            <div className="absolute -top-4 -left-2 opacity-10 text-amber-300 pointer-events-none">
              <Quote className="w-24 h-24 sm:w-32 sm:h-32 rotate-180" />
            </div>

            {/* Label Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-semibold tracking-widest uppercase mb-6 shadow-md">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Our Vision</span>
            </div>

            {/* Quote Body */}
            <blockquote className="relative z-10 text-lg sm:text-xl md:text-2xl font-serif italic text-white/95 leading-relaxed max-w-xl">
              &ldquo;{VISION_STATEMENT}&rdquo;
            </blockquote>

            {/* Decorative Gold Accent Bar */}
            <div className="mt-8 w-16 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full" />
          </div>
        </GlassCard>
      </div>

      {/* Core Pillars Grid */}
      <div className="w-full max-w-3xl">
        <h4 className="text-sm font-semibold tracking-widest text-zinc-400 uppercase text-center mb-4">
          Core Platform Pillars
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CORE_VALUES.map((val: CoreValue, index: number) => {
            const Icon = valueIconMap[val.iconName] || Sparkles;
            return (
              <motion.div
                key={val.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="w-full"
              >
                <GlassCard>
                  <div className="p-5 flex items-start gap-3.5 text-left group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-amber-300 shrink-0 group-hover:border-amber-400/40 group-hover:scale-105 transition-all">
                      <Icon className="w-5 h-5 text-amber-300" />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <h5 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {val.title}
                      </h5>
                      <p className="text-xs text-zinc-400 font-light leading-relaxed">
                        {val.description}
                      </p>
                    </div>
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

