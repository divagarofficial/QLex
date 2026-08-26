"use client";

import { useEffect, useState } from "react";
import { Clock, Calendar, Sparkles, Store } from "lucide-react";
import { motion } from "framer-motion";

export default function WelcomeCard() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = (now || new Date()).getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const formatDate = () => {
    if (!now) return "";
    return now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = () => {
    if (!now) return "--:--:--";
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="deep-glass relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl"
    >
      {/* Background ambient lighting overlay */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />

      <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>QLex Central Print Hub</span>
          </div>

          <h2 className="mt-1 bg-gradient-to-r from-white via-amber-100 to-champagne-300 bg-clip-text text-2xl font-black tracking-tight text-transparent sm:text-3xl">
            {getGreeting()}, Operator
          </h2>

          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-zinc-400 sm:text-sm">
            <Store className="h-4 w-4 text-amber-400/80 inline" />
            <span>RIT Campus Road, Opposite to A Block, RIT Main Campus</span>
          </p>
        </div>

        {/* Date & Live Clock Badge */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <Calendar className="h-4 w-4 text-amber-400" />
            <span className="font-medium">{formatDate()}</span>
          </div>

          <div className="hidden h-4 w-px bg-white/10 sm:block" />

          <div className="flex items-center gap-2 rounded-xl bg-black/40 px-3 py-1 text-xs font-mono font-bold text-amber-300 border border-amber-400/20">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span>{formatTime()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
