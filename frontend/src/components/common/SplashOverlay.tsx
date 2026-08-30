"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function SplashOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("ENTERING THE EMPIRE...");
  const [isAccessGranted, setIsAccessGranted] = useState(false);

  useEffect(() => {
    // Only show splash screen once per browser session
    if (typeof window !== "undefined") {
      const hasSeenSplash = sessionStorage.getItem("qlex_splash_shown");
      if (hasSeenSplash) {
        return;
      }
      sessionStorage.setItem("qlex_splash_shown", "true");
      setIsVisible(true);
    }

    // 10-second (10000ms) precise progress timer
    const intervalTime = 100;
    const totalSteps = 10000 / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const currentPct = Math.min(100, Math.round((currentStep / totalSteps) * 100));
      setProgress(currentPct);

      if (currentPct < 35) {
        setStatusText("ENTERING THE EMPIRE...");
      } else if (currentPct < 75) {
        setStatusText("INITIALIZING QLEX • ESTABLISHING CONNECTION");
      } else if (currentPct < 100) {
        setStatusText("VERIFYING IMPERIAL PROTOCOLS");
      } else {
        setStatusText("ACCESS GRANTED");
        setIsAccessGranted(true);
      }

      if (currentStep >= totalSteps) {
        clearInterval(timer);
        setTimeout(() => {
          setIsVisible(false);
        }, 600); // Short flash transition
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.08, filter: "brightness(1.5)" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ willChange: "opacity, transform" }}
          className={`fixed inset-0 z-[99999] flex flex-col items-center justify-between py-10 px-4 text-white select-none overflow-hidden transition-colors duration-500 ${
            isAccessGranted ? "bg-[#030e24]" : "bg-[#02040a]"
          }`}
        >
          {/* Deep Cosmic Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#02040a] via-[#080d1a] to-[#02040a]" />

          {/* Soft Radial Ambient Glow behind central artifact */}
          <div 
            style={{ willChange: "transform, opacity" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] sm:w-[480px] sm:h-[480px] rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.2)_0%,_rgba(6,182,212,0.15)_40%,_transparent_70%)] pointer-events-none animate-pulse" 
          />

          {/* Floating Gold Sparkles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
            <div className="absolute top-1/4 left-10 w-2 h-2 rounded-full bg-amber-400 animate-ping [animation-duration:3s]" />
            <div className="absolute top-1/3 right-12 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping [animation-duration:4s]" />
            <div className="absolute bottom-1/3 left-1/4 w-2 h-2 rounded-full bg-amber-300 animate-ping [animation-duration:3.5s]" />
          </div>

          {/* Top Header: Dual Institution Logos (Rajalakshmi Institutions Left | RIT Right) */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative z-10 flex items-center justify-center w-full max-w-4xl pt-4 px-4 sm:px-8 gap-3 sm:gap-6 md:gap-8"
          >
            {/* Left: Rajalakshmi Institutions Logo */}
            <div className="flex-1 flex justify-end items-center">
              <Image
                src="/rajalakshmi-logo.png"
                alt="Rajalakshmi Institutions"
                width={300}
                height={90}
                className="object-contain h-10 min-[400px]:h-12 sm:h-16 md:h-20 w-auto max-w-[140px] min-[400px]:max-w-[180px] sm:max-w-[240px] md:max-w-[280px] filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-transform duration-500 hover:scale-105"
                priority
              />
            </div>

            {/* Vertical Divider */}
            <div className="h-8 sm:h-12 md:h-14 w-px bg-gradient-to-b from-transparent via-amber-400/40 to-transparent shrink-0 opacity-70" />

            {/* Right: RIT Logo */}
            <div className="flex-1 flex justify-start items-center">
              <Image
                src="/rit-logo.png"
                alt="Rajalakshmi Institute of Technology"
                width={340}
                height={120}
                className="object-contain h-10 min-[400px]:h-12 sm:h-16 md:h-20 w-auto max-w-[140px] min-[400px]:max-w-[180px] sm:max-w-[240px] md:max-w-[280px] filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-transform duration-500 hover:scale-105"
                priority
              />
            </div>
          </motion.div>

          {/* Center Royal Artifact & Empire Titles */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full px-2 mt-4">
            
            {/* FLOATING CIRCULAR GLASS ROYAL ARTIFACT FRAME */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
              className="relative mb-8 flex items-center justify-center"
            >
              {/* Subtle Rotating Gold Outer Ring */}
              <div 
                style={{ willChange: "transform" }}
                className="absolute -inset-5 rounded-full border border-dashed border-amber-400/50 animate-spin [animation-duration:14s] pointer-events-none" 
              />

              {/* Tiny Orbiting Cyan Light Streak */}
              <div 
                style={{ willChange: "transform" }}
                className="absolute -inset-6 rounded-full animate-spin [animation-duration:4s] pointer-events-none flex items-start justify-center"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#38bdf8]" />
              </div>

              {/* Circular Glass Container */}
              <div className="relative bg-slate-950/80 border border-amber-400/40 p-6 rounded-full shadow-[0_0_45px_rgba(245,158,11,0.3)] backdrop-blur-md flex items-center justify-center w-36 h-36 sm:w-40 sm:h-40">
                <Image
                  src="/qlex-logo.png"
                  alt="QLex Logo"
                  width={110}
                  height={110}
                  className="object-contain drop-shadow-[0_0_20px_rgba(56,189,248,0.75)]"
                  priority
                />
              </div>
            </motion.div>

            {/* Line 1: WELCOME TO THE EMPIRE OF */}
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

            {/* Line 2: SINGLE LINE THIRUMALAI D × DIVAGAR E */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.8 }}
              className="w-full flex justify-center items-center px-1"
            >
              <h1 className="text-sm sm:text-2xl md:text-3xl font-black uppercase tracking-wider whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white via-cyan-200 to-amber-200 drop-shadow-[0_4px_20px_rgba(245,158,11,0.6)]">
                THIRUMALAI D <span className="text-amber-400 font-bold mx-1">×</span> DIVAGAR E
              </h1>
            </motion.div>


          </div>

          {/* Bottom Area: Dynamic Cooler Loading Progress Bar & Founder Signature */}
          <div className="relative z-10 w-full max-w-xs flex flex-col items-center space-y-4">
            
            {/* Status & Dynamic Percentage Counter */}
            <div className="flex flex-col items-center space-y-1 text-center w-full">
              <motion.div
                key={statusText}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-[11px] sm:text-xs uppercase font-extrabold tracking-[0.18em] transition-colors duration-300 ${
                  isAccessGranted ? "text-emerald-400 text-sm font-black drop-shadow-[0_0_12px_#10b981]" : "text-amber-300/90"
                }`}
              >
                {statusText} {isAccessGranted ? "" : `• ${progress}%`}
              </motion.div>
            </div>

            {/* Enhanced Progress Bar with Moving Light Beam */}
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-amber-400/40 shadow-inner relative">
              <motion.div
                style={{ width: `${progress}%`, willChange: "width" }}
                className="h-full bg-gradient-to-r from-amber-400 via-cyan-400 to-amber-300 relative overflow-hidden transition-all duration-100 ease-linear shadow-[0_0_14px_rgba(245,158,11,0.9)]"
              >
                {/* Moving Light Beam inside Progress Bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent w-1/3 animate-[shimmer_1.5s_infinite] -translate-x-full" />
              </motion.div>
            </div>

            {/* FOUNDER SIGNATURE IN GOLDEN ACCENT */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="pt-1 flex flex-col items-center"
            >
              <div className="relative w-36 h-12">
                <Image
                  src="/founder-signature.png"
                  alt="Founder Signature"
                  fill
                  className="object-contain filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                  priority
                />
              </div>
              <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-amber-400/80 -mt-1">
                FOUNDER SIGNATURE
              </span>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
