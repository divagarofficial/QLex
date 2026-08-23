"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function SplashOverlay() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Stay visible for 10 seconds (10000ms) as requested
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
          exit={{ opacity: 0, scale: 1.08, filter: "blur(12px)" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-between py-12 px-6 bg-[#020617] text-white select-none overflow-hidden"
        >
          {/* Deep Cosmic Background & Ambient Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/50 via-slate-950 to-[#020617]" />

          {/* Rotating Radiant Light Orbs */}
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [0.9, 1.15, 0.9],
            }}
            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
            className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/15 via-indigo-500/10 to-amber-500/15 rounded-full blur-3xl"
          />

          <motion.div
            animate={{
              rotate: [360, 0],
              scale: [1.1, 0.85, 1.1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute w-[400px] h-[400px] bg-gradient-to-bl from-amber-500/15 via-blue-600/10 to-cyan-400/15 rounded-full blur-3xl"
          />

          {/* Floating Sparkle Stars Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px] opacity-15" />

          {/* Top Spacer */}
          <div className="w-full" />

          {/* Center Grand Content */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-xl w-full">
            {/* Logo Container with Royal Aura */}
            <motion.div
              initial={{ scale: 0.2, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-10"
            >
              {/* Outer Pulsing Golden/Cyan Ring */}
              <motion.div
                animate={{
                  scale: [1, 1.25, 1],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-6 rounded-full bg-gradient-to-r from-amber-400/30 via-cyan-500/30 to-amber-400/30 blur-xl"
              />

              <div className="relative bg-slate-950/90 border border-amber-400/40 p-6 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.3)] backdrop-blur-xl">
                <Image
                  src="/qlex-logo.png"
                  alt="QLex Logo"
                  width={130}
                  height={130}
                  className="object-contain drop-shadow-[0_0_25px_rgba(56,189,248,0.8)]"
                  priority
                />
              </div>
            </motion.div>

            {/* Grand Empire Announcement Text (ALL CAPS) */}
            <div className="space-y-4 px-2">
              {/* Line 1: WELCOME TO THE EMPIRE OF */}
              <motion.div
                initial={{ opacity: 0, y: 25, letterSpacing: "0.1em" }}
                animate={{ opacity: 1, y: 0, letterSpacing: "0.3em" }}
                transition={{ duration: 1.1, delay: 0.6, ease: "easeOut" }}
              >
                <span className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-100 to-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">
                  WELCOME TO THE EMPIRE OF
                </span>
              </motion.div>

              {/* Line 2: THIRUMALAI D AND DIVAGAR E */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className="absolute -inset-2 bg-cyan-500/20 blur-lg rounded-lg opacity-60 animate-pulse" />
                <h1 className="relative text-2xl sm:text-4xl font-black uppercase tracking-wider leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 via-amber-200 to-white drop-shadow-[0_4px_25px_rgba(6,182,212,0.7)]">
                  THIRUMALAI D AND DIVAGAR E
                </h1>
              </motion.div>
            </div>
          </div>

          {/* Bottom 10-Second Animated Progress Bar */}
          <div className="relative z-10 w-full max-w-xs flex flex-col items-center space-y-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-[10px] uppercase font-bold tracking-[0.2em] text-cyan-300/80"
            >
              INITIALIZING EMPIRE ARCHITECTURE...
            </motion.div>
            <div className="w-full h-1.5 bg-slate-900/90 rounded-full overflow-hidden border border-cyan-500/30 shadow-inner">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 10, ease: "linear" }}
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 via-amber-400 to-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.9)]"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
