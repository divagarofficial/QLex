"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function SplashOverlay() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#030712] text-white select-none overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-[#030712] blur-2xl" />

          {/* Animated Particles / Light Beam */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          />

          <div className="relative z-10 flex flex-col items-center px-6 text-center max-w-lg">
            {/* Logo Container with Glow */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-8"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur-xl opacity-50 animate-pulse" />
              <div className="relative bg-slate-900/90 border border-cyan-500/30 p-5 rounded-2xl shadow-2xl backdrop-blur-md">
                <Image
                  src="/qlex-logo.png"
                  alt="QLex Logo"
                  width={110}
                  height={110}
                  className="object-contain drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]"
                  priority
                />
              </div>
            </motion.div>

            {/* Grand Title: Heart and Soul of QLex */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-4"
            >
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.25em] bg-gradient-to-r from-amber-400 via-amber-200 to-cyan-300 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.4)] border border-amber-300/40">
                Heart &amp; Soul of QLex
              </span>
            </motion.div>

            {/* Founders Names */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="space-y-1.5"
            >
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 drop-shadow-md uppercase">
                THIRUMALAI D
              </h1>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-indigo-300 drop-shadow-md uppercase">
                DIVAGAR E
              </h1>
            </motion.div>

            {/* Loading Indicator Dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-8 flex items-center space-x-2"
            >
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping [animation-delay:0.4s]" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
