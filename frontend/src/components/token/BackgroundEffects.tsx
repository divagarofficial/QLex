"use client";

import { motion } from "framer-motion";

export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Dark Base Layer */}
      <div className="absolute inset-0 bg-[#030406]" />

      {/* Shifting Gradient Background */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.25),rgba(6,182,212,0.15),transparent)]" />

      {/* Glowing Floating Orbs */}
      {/* Orb 1: Cyan / Blue Glow - Top Left */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 30, 0],
          scale: [1, 1.15, 0.95, 1],
          opacity: [0.35, 0.55, 0.4, 0.35],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/20 blur-[120px]"
      />

      {/* Orb 2: Purple / Violet Glow - Top Right */}
      <motion.div
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 40, -40, 0],
          scale: [1, 0.9, 1.1, 1],
          opacity: [0.3, 0.5, 0.35, 0.3],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-20 -right-20 w-[30rem] h-[30rem] rounded-full bg-purple-600/20 blur-[140px]"
      />

      {/* Orb 3: Royal Blue Glow - Bottom Center */}
      <motion.div
        animate={{
          x: [0, 30, -40, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.2, 0.9, 1],
          opacity: [0.25, 0.45, 0.3, 0.25],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-40 left-1/3 w-[36rem] h-[36rem] rounded-full bg-blue-600/20 blur-[160px]"
      />

      {/* Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#030406_85%)]" />

      {/* Noise Texture Grid Layer */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
