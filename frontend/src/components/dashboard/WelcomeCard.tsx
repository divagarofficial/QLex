"use client";

import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { Sparkles, GraduationCap, BookOpen, Sun, Moon, Sunrise } from "lucide-react";

function getGreetingData() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return {
      text: "Good Morning",
      icon: Sunrise,
      message: "Ready to start your day with prints?",
    };
  }
  if (hour < 17) {
    return {
      text: "Good Afternoon",
      icon: Sun,
      message: "Hope your day is going great!",
    };
  }
  return {
    text: "Good Evening",
    icon: Moon,
    message: "Finishing up your work for the day?",
  };
}

function getStudentInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function WelcomeCard() {
  const user = useAuthStore((s) => s.user);
  const greetingData = getGreetingData();
  const GreetingIcon = greetingData.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="deep-glass group relative overflow-hidden"
    >
      {/* Background Effects */}
      <div className="deep-glass-reflection" />
      <div className="deep-glass-rim" />
      <div className="deep-glass-sweep" />

      {/* Environmental Spotlight Gradients */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl transition-all duration-700 group-hover:bg-amber-400/25" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl transition-all duration-700" />

      <div className="relative z-10 p-6 sm:p-8 md:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Left Side */}
          <div className="flex-1">
            {/* Greeting Pill */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-3 shadow-md"
            >
              <GreetingIcon size={14} className="text-amber-400" />
              <span>{greetingData.text}</span>
            </motion.div>

            {/* Student Full Name */}
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white"
            >
              <span className="bg-gradient-to-r from-white via-amber-50 to-amber-200/90 bg-clip-text text-transparent">
                {user?.full_name || "Student"}
              </span>
            </motion.h1>

            {/* Welcome message */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="mt-1.5 text-base sm:text-lg text-zinc-400 font-light"
            >
              {greetingData.message}
            </motion.p>

            {/* Metadata Pills */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="mt-6 flex flex-wrap items-center gap-2.5"
            >
              {user?.register_number && (
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-semibold text-zinc-300 backdrop-blur-md transition-all duration-300 hover:border-amber-400/40 hover:bg-white/[0.06]">
                  <GraduationCap size={14} className="text-amber-300" />
                  <span className="text-zinc-500 font-medium">Reg:</span>
                  <span className="font-mono text-white">{user.register_number}</span>
                </span>
              )}

              {user?.department_name && (
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-semibold text-zinc-300 backdrop-blur-md transition-all duration-300 hover:border-amber-400/40 hover:bg-white/[0.06]">
                  <BookOpen size={14} className="text-blue-300" />
                  <span className="text-zinc-500 font-medium">Dept:</span>
                  <span className="text-white">{user.department_name}</span>
                </span>
              )}

              {user?.year_number && (
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-semibold text-zinc-300 backdrop-blur-md transition-all duration-300 hover:border-amber-400/40 hover:bg-white/[0.06]">
                  <span className="text-zinc-500 font-medium">Year:</span>
                  <span className="text-white">Year {user.year_number}</span>
                </span>
              )}

              {user?.section_name && (
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-semibold text-zinc-300 backdrop-blur-md transition-all duration-300 hover:border-amber-400/40 hover:bg-white/[0.06]">
                  <span className="text-zinc-500 font-medium">Sec:</span>
                  <span className="text-white">{user.section_name}</span>
                </span>
              )}
            </motion.div>
          </div>

          {/* Right Side Avatar Monogram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="shrink-0"
          >
            <div className="relative group/avatar cursor-pointer">
              {/* Outer Glow Halo */}
              <div className="absolute -inset-2 rounded-3xl bg-amber-400/25 blur-xl opacity-60 transition-opacity duration-500 group-hover/avatar:opacity-100" />

              {/* Avatar Box */}
              <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl border border-white/20 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 shadow-[0_15px_35px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-transform duration-500 group-hover/avatar:scale-105">
                <span className="text-2xl sm:text-3xl font-black text-obsidian tracking-wider">
                  {user?.full_name
                    ? getStudentInitials(user.full_name)
                    : "S"}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}