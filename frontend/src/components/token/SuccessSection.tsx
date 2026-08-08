"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface SuccessSectionProps {
  orderId?: string;
}

export default function SuccessSection({ orderId }: SuccessSectionProps) {
  useEffect(() => {
    // Fire festive celebration confetti burst
    try {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.25 },
        colors: ["#38bdf8", "#818cf8", "#c084fc", "#e8c56e"],
      });
    } catch {
      // Ignore if confetti fails in SSR
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 text-center py-4 px-4 max-w-2xl mx-auto"
    >
      {/* Icon Badge Container */}
      <div className="relative inline-flex items-center justify-center mb-3 group">
        {/* Ambient Ring Pulse */}
        <motion.div
          animate={{
            scale: [1, 1.35, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl"
        />

        {/* Outer Hex/Circle Badge */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-purple-500/20 border border-cyan-400/30 flex items-center justify-center shadow-2xl backdrop-blur-xl">
          <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400 stroke-[2.2]" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1 -right-1 text-cyan-300"
          >
            <Sparkles className="w-4 h-4 fill-cyan-400/20" />
          </motion.div>
        </div>
      </div>

      {/* Main Title */}
      <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
        Order Confirmed <span className="inline-block animate-bounce">🎉</span>
      </h2>

      {/* Subtitle */}
      <p className="text-sm sm:text-base text-slate-300/90 font-normal mt-2 max-w-lg mx-auto leading-relaxed">
        Your documents have been successfully submitted to the print shop. Present your token or QR code when collecting your prints.
      </p>
    </motion.div>
  );
}
