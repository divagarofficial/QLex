"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function SplashOverlay() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 10-second splash screen duration
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
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ willChange: "opacity, transform" }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-between py-10 px-4 bg-[#030712] text-white select-none overflow-hidden"
        >
          {/* Deep Imperial Dark Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#080d1a] to-[#020617]" />

          {/* Hardware-Accelerated Glowing Radial Background Beam (Lag-Free) */}
          <div 
            style={{ willChange: "transform, opacity" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.18)_0%,_rgba(6,182,212,0.12)_40%,_transparent_70%)] pointer-events-none animate-pulse" 
          />

          {/* Floating Gold Sparkle Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
            <div className="absolute top-1/4 left-10 w-2 h-2 rounded-full bg-amber-400 animate-ping [animation-duration:3s]" />
            <div className="absolute top-1/3 right-12 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping [animation-duration:4s]" />
            <div className="absolute bottom-1/3 left-1/4 w-2 h-2 rounded-full bg-amber-300 animate-ping [animation-duration:3.5s]" />
            <div className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping [animation-duration:4.5s]" />
          </div>

          {/* Top Spacer */}
          <div className="w-full" />

          {/* Main Empire Container */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full px-2">
            
            {/* Royal Crown Icon */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-3 text-amber-400 text-3xl sm:text-4xl drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]"
            >
              👑
            </motion.div>

            {/* QLex Logo with Gold & Cyan Imperial Ring */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
              className="relative mb-8"
            >
              {/* Outer Golden Aura Ring */}
              <div 
                style={{ willChange: "transform" }}
                className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-amber-400/40 via-cyan-400/40 to-amber-400/40 opacity-75 blur-md animate-pulse" 
              />

              <div className="relative bg-slate-950/95 border-2 border-amber-400/60 p-5 rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.35)]">
                <Image
                  src="/qlex-logo.png"
                  alt="QLex Logo"
                  width={115}
                  height={115}
                  className="object-contain drop-shadow-[0_0_20px_rgba(56,189,248,0.7)]"
                  priority
                />
              </div>
            </motion.div>

            {/* Empire Announcement - Line 1 */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mb-3"
            >
              <span className="inline-block px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] bg-gradient-to-r from-amber-400 via-amber-200 to-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)] border border-amber-300/50">
                WELCOME TO THE EMPIRE OF
              </span>
            </motion.div>

            {/* SINGLE LINE Founders Title - Line 2 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.8 }}
              className="w-full flex justify-center items-center px-1"
            >
              <h1 className="text-base sm:text-2xl md:text-3xl font-black uppercase tracking-wider whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white via-cyan-200 to-amber-200 drop-shadow-[0_4px_20px_rgba(245,158,11,0.6)]">
                THIRUMALAI D &amp; DIVAGAR E
              </h1>
            </motion.div>
          </div>

          {/* Smooth 10-Second Progress Indicator Bar */}
          <div className="relative z-10 w-full max-w-xs flex flex-col items-center space-y-2.5">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="text-[10px] uppercase font-extrabold tracking-[0.2em] text-amber-300/90 drop-shadow-sm"
            >
              ENTERING THE EMPIRE...
            </motion.div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-amber-400/40 shadow-inner">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 10, ease: "linear" }}
                style={{ willChange: "width" }}
                className="h-full bg-gradient-to-r from-amber-400 via-cyan-400 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.9)]"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
