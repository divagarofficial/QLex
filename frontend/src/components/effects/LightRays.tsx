"use client";

import { motion } from "framer-motion";

export default function LightRays() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-30 overflow-hidden">
      {/* Left Ray */}
      <motion.div
        animate={{
          opacity: [0.06, 0.12, 0.06],
          rotate: [-18, -16, -18],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-[28%] top-[-25%] h-[160vh] w-[220px]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,.9), transparent)",
          filter: "blur(60px)",
          mixBlendMode: "screen",
        }}
      />

      {/* Center Gold Ray */}
      <motion.div
        animate={{
          opacity: [0.08, 0.16, 0.08],
          scaleY: [1, 1.05, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-[-30%] h-[170vh] w-[280px] -translate-x-1/2"
        style={{
          background:
            "linear-gradient(to bottom, rgba(231,200,115,.9), transparent)",
          filter: "blur(80px)",
          mixBlendMode: "screen",
        }}
      />

      {/* Right Ray */}
      <motion.div
        animate={{
          opacity: [0.06, 0.12, 0.06],
          rotate: [16, 18, 16],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute right-[28%] top-[-25%] h-[160vh] w-[220px]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,.8), transparent)",
          filter: "blur(60px)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}

