"use client";

import { motion } from "framer-motion";
import { Sparkles, Heart, Quote } from "lucide-react";
import GlassCard from "@/components/glass/GlassCard";
import { CORE_TEAM_MEMBERS } from "./creditsData";

export default function CoreTeamSection() {
  return (
    <section
      aria-label="Core Team - Heart & Soul"
      className="w-full flex flex-col items-center text-center space-y-8"
    >
      {/* Emotional Centerpiece Header */}
      <div className="flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-semibold tracking-wider uppercase mb-3 shadow-lg shadow-rose-500/5">
          <Heart className="w-3.5 h-3.5 fill-rose-400/80 text-rose-400 animate-pulse" />
          <span>The Minds Behind QLex</span>
        </div>

        <h3 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
          <span className="bg-gradient-to-r from-white via-zinc-100 to-amber-200 bg-clip-text text-transparent">
            Heart & Soul
          </span>
        </h3>
        <p className="text-sm sm:text-base text-zinc-400 max-w-md font-light leading-relaxed">
          Crafted with passion, vision, and relentless attention to detail.
        </p>
      </div>

      {/* Profile Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {CORE_TEAM_MEMBERS.map((member) => (
          <motion.div
            key={member.id}
            whileHover={{ y: -8, scale: 1.015 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <GlassCard>
              <div className="flex flex-col items-center justify-between text-center p-8 h-full relative group">
                {/* Monogram Avatar Badge */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-2xl bg-amber-400/25 blur-lg transition-opacity duration-500 group-hover:opacity-100 opacity-60" />
                  <div className="relative flex items-center justify-center w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-white/12 via-white/8 to-white/4 border border-white/20 backdrop-blur-2xl shadow-xl">
                    <span className="text-2xl font-black text-amber-300 tracking-wider">
                      {member.initials}
                    </span>
                  </div>
                </div>

                {/* Person Name */}
                <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1.5">
                  {member.name}
                </h4>

                {/* Role Badge */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-5 shadow-md">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{member.role}</span>
                </div>

                {/* Inspirational Quote Placeholder Card */}
                {member.quote && (
                  <div className="relative mt-auto p-4 rounded-2xl bg-white/[0.025] border border-white/[0.06] text-zinc-300/90 text-xs sm:text-sm font-normal italic leading-relaxed w-full flex items-start gap-2.5 text-left group-hover:border-white/10 transition-colors">
                    <Quote className="w-4 h-4 text-amber-400/70 shrink-0 mt-0.5" />
                    <span>{member.quote}</span>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
