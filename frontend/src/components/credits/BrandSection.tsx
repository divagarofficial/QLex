"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import GlassCard from "@/components/glass/GlassCard";
import { PRODUCT_INFO } from "./creditsData";

export default function BrandSection() {
  return (
    <section aria-label="QLex Identity" className="w-full flex justify-center">
      <div className="w-full max-w-2xl">
        <GlassCard>
          <div className="relative flex flex-col items-center justify-center text-center p-8 sm:p-12 md:p-16 overflow-hidden">
            {/* Environmental Background Light Spotlights */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Subtle Floating Logo Container */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{ scale: 1.05, rotate: [0, -1, 1, 0] }}
              className="relative mb-8 flex items-center justify-center cursor-pointer"
            >
              {/* Outer Ambient Glow Rings */}
              <div className="absolute -inset-6 bg-gradient-to-tr from-amber-500/30 via-amber-300/15 to-blue-500/30 rounded-full blur-2xl opacity-70 animate-pulse" />
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-amber-400/40 via-white/10 to-blue-400/30 opacity-40 blur-sm" />

              {/* Glass Badge Container */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 flex items-center justify-center rounded-3xl bg-white/[0.05] border border-white/[0.15] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] group">
                {/* Top Reflection Strip */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                <Image
                  src="/qlex-logo.svg"
                  alt="QLex Logo"
                  width={112}
                  height={112}
                  priority
                  className="w-24 h-24 sm:w-28 sm:h-28 object-contain filter drop-shadow-[0_0_25px_rgba(231,200,115,0.4)] transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </motion.div>

            {/* QLex Large Typography */}
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-2">
              <span className="hero-ql">{PRODUCT_INFO.name}</span>
            </h2>

            {/* Tagline */}
            <p className="text-lg sm:text-xl font-bold tracking-widest text-zinc-200/90 uppercase mb-3">
              <span className="gold-text">{PRODUCT_INFO.tagline}</span>
            </p>

            {/* Sub-text */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md text-xs sm:text-sm text-zinc-300 font-light max-w-md">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>Next-Generation Campus Printing Infrastructure</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
