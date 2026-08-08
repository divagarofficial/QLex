"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { TRADEMARK_INFO } from "./creditsData";

export default function TrademarkSection() {
  return (
    <section
      aria-label="Company Information"
      className="w-full flex flex-col items-center justify-center text-center py-2"
    >
      <div className="relative group flex flex-col items-center p-8 sm:p-10 rounded-3xl bg-white/[0.025] border border-white/[0.08] backdrop-blur-2xl transition-all duration-500 hover:border-white/[0.18] hover:bg-white/[0.04] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-lg w-full overflow-hidden">
        {/* Top Gold Edge Highlight Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

        {/* Small Typography */}
        <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold tracking-widest text-zinc-400 uppercase mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400/80" />
          <span>{TRADEMARK_INFO.pretext}</span>
        </div>

        {/* Large Bold Professional Typography */}
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white mb-6">
          <span className="bg-gradient-to-r from-white via-zinc-100 to-amber-200 bg-clip-text text-transparent drop-shadow-sm">
            {TRADEMARK_INFO.companyName}
          </span>
        </h3>

        {/* Mindura Technologies Logo with Subtle Float */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          whileHover={{ scale: 1.08 }}
          className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/[0.05] border border-white/[0.12] p-3.5 shadow-xl backdrop-blur-xl group-hover:border-amber-400/40 transition-colors"
        >
          <Image
            src={TRADEMARK_INFO.logoPath}
            alt="Mindura Technologies Logo"
            width={88}
            height={88}
            className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(231,200,115,0.3)]"
          />
        </motion.div>
      </div>
    </section>
  );
}
