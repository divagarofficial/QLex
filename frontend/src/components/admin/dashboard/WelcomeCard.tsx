"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Activity, Calendar, Clock, Sparkles } from "lucide-react";

interface WelcomeCardProps {
  adminName?: string;
  serverStatus?: string;
}

export default function WelcomeCard({
  adminName = "QLex Administrator",
  serverStatus = "HEALTHY",
}: WelcomeCardProps) {
  const [currentDateStr, setCurrentDateStr] = useState("");
  const [currentTimeStr, setCurrentTimeStr] = useState("");
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      // Date formatting
      setCurrentDateStr(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );

      // Time formatting
      setCurrentTimeStr(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );

      // Dynamic Greeting
      const hour = now.getHours();
      if (hour < 12) setGreeting("Good morning");
      else if (hour < 18) setGreeting("Good afternoon");
      else setGreeting("Good evening");
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isOperational =
    serverStatus?.toUpperCase() === "HEALTHY" ||
    serverStatus?.toUpperCase() === "OPERATIONAL";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="deep-glass relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl mb-8"
    >
      {/* Top Rim Sunlight Highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

      {/* Environmental Ambient Lights */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-blue-500/10 blur-[60px]" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-cyan-500/10 blur-[60px]" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Welcome Details */}
        <div>
          {/* Status Badge */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-blue-400 animate-spin-slow" />
            <span>EXECUTIVE CONTROL CENTER</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
            {greeting},{" "}
            <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-300 bg-clip-text text-transparent">
              {adminName}
            </span>
          </h1>

          <p className="mt-1.5 text-xs sm:text-sm font-medium text-zinc-400 max-w-xl">
            Real-time platform metrics, queue status, order throughput, and settlement tracking across QLex.
          </p>
        </div>

        {/* Right Info Widgets: Live Time & Platform Status */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0">
          {/* Live Date & Clock Card */}
          <div className="flex flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 px-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 mb-1">
              <Calendar className="h-3.5 w-3.5 text-blue-400" />
              <span>{currentDateStr || "Loading..."}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-bold tracking-wider">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span>{currentTimeStr || "--:--:--"}</span>
            </div>
          </div>

          {/* Platform Health Indicator Card */}
          <div className="flex flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 px-4 backdrop-blur-md">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Platform Status
            </div>
            <div className="flex items-center gap-2 text-xs font-extrabold tracking-wide">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full ${
                    isOperational ? "bg-emerald-400" : "bg-amber-400"
                  } opacity-75`}
                />
                <span
                  className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                    isOperational ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
              </span>
              <span className={isOperational ? "text-emerald-400" : "text-amber-400"}>
                {isOperational ? "OPERATIONAL" : serverStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
