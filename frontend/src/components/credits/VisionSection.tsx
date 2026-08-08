"use client";

import { Quote, Compass } from "lucide-react";
import GlassCard from "@/components/glass/GlassCard";
import { VISION_STATEMENT } from "./creditsData";

export default function VisionSection() {
  return (
    <section
      aria-label="Product Vision"
      className="w-full flex justify-center py-2"
    >
      <div className="w-full max-w-2xl">
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
    </section>
  );
}
