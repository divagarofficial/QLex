"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function SplashOverlay() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 10-second palace splash screen duration
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{ willChange: "opacity, transform" }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-between py-8 px-4 bg-[#02040a] text-white select-none overflow-hidden"
        >
          {/* Deep Royal Palace Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#02040a] via-[#0b1021] to-[#02040a]" />

          {/* Palace Golden Sunburst Ray Beam */}
          <div 
            style={{ willChange: "transform" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,_rgba(251,191,36,0.22)_0%,_rgba(6,182,212,0.15)_35%,_transparent_70%)] pointer-events-none animate-pulse" 
          />

          {/* Left & Right Palace Golden Pillars */}
          <div className="absolute top-0 bottom-0 left-2 w-1.5 bg-gradient-to-b from-amber-500/0 via-amber-400/50 to-amber-500/0 shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
          <div className="absolute top-0 bottom-0 right-2 w-1.5 bg-gradient-to-b from-amber-500/0 via-amber-400/50 to-amber-500/0 shadow-[0_0_15px_rgba(245,158,11,0.6)]" />

          {/* Floating Imperial Gold Dust Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
            <div className="absolute top-1/6 left-12 w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_10px_#f59e0b] animate-ping [animation-duration:2.5s]" />
            <div className="absolute top-1/4 right-16 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_10px_#06b6d4] animate-ping [animation-duration:3.2s]" />
            <div className="absolute bottom-1/3 left-1/5 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b] animate-ping [animation-duration:3.8s]" />
            <div className="absolute bottom-1/4 right-1/4 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4] animate-ping [animation-duration:4.2s]" />
          </div>

          {/* Top Palace Crest Arch */}
          <div className="relative z-10 pt-4 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex items-center space-x-3 text-amber-400 text-sm font-black tracking-[0.3em] uppercase drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]"
            >
              <span className="text-xl">🏛️</span>
              <span>ROYAL PALACE OF QLEX</span>
              <span className="text-xl">🏛️</span>
            </motion.div>
          </div>

          {/* Main Palace Centerpiece */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full px-2">
            
            {/* Grand Imperial Crown with Gem Glint */}
            <motion.div
              initial={{ opacity: 0, scale: 0.3, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-2 text-amber-300 text-5xl sm:text-6xl drop-shadow-[0_0_25px_rgba(245,158,11,0.95)]"
            >
              👑
            </motion.div>

            {/* QLex Logo with Majestic Palace Shield & Glowing Orbs */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-8"
            >
              {/* Palace Golden Halo Ring */}
              <div 
                style={{ willChange: "transform" }}
                className="absolute -inset-6 rounded-full bg-gradient-to-r from-amber-400/50 via-cyan-400/50 to-amber-400/50 opacity-80 blur-lg animate-pulse" 
              />

              <div className="relative bg-slate-950/95 border-2 border-amber-400 p-6 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.5)]">
                <Image
                  src="/qlex-logo.png"
                  alt="QLex Logo"
                  width={125}
                  height={125}
                  className="object-contain drop-shadow-[0_0_25px_rgba(56,189,248,0.8)]"
                  priority
                />
              </div>
            </motion.div>

            {/* Palace Line 1: WELCOME TO THE EMPIRE OF */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.6 }}
              className="mb-4"
            >
              <span className="inline-block px-5 py-2 rounded-full text-xs sm:text-sm font-black uppercase tracking-[0.3em] bg-gradient-to-r from-amber-400 via-amber-200 to-cyan-300 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.7)] border-2 border-amber-300">
                ✨ WELCOME TO THE EMPIRE OF ✨
              </span>
            </motion.div>

            {/* Palace Line 2: SINGLE LINE THIRUMALAI D & DIVAGAR E */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex justify-center items-center px-1"
            >
              <h1 className="text-base sm:text-2xl md:text-3xl font-black uppercase tracking-widest whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white via-cyan-200 to-amber-300 drop-shadow-[0_4px_25px_rgba(245,158,11,0.8)]">
                THIRUMALAI D &amp; DIVAGAR E
              </h1>
            </motion.div>
          </div>

          {/* Palace Progress Bar */}
          <div className="relative z-10 w-full max-w-xs flex flex-col items-center space-y-2.5 pb-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-[10px] uppercase font-black tracking-[0.25em] text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]"
            >
              UNVEILING PALACE REALM...
            </motion.div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border-2 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 10, ease: "linear" }}
                style={{ willChange: "width" }}
                className="h-full bg-gradient-to-r from-amber-400 via-cyan-300 to-amber-300 shadow-[0_0_15px_rgba(245,158,11,1)]"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
