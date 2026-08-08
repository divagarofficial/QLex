"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Ticket, Clock, Users, Zap, PlusCircle, ArrowRight, ShieldCheck } from "lucide-react";
import type { MyTokenResponse } from "@/types/student";

interface MyQueueCardProps {
  myTokenData: MyTokenResponse | null;
  position: number | null; // 1-indexed position
  studentsAhead: number;
}

export default function MyQueueCard({
  myTokenData,
  position,
  studentsAhead,
}: MyQueueCardProps) {
  if (!myTokenData) {
    return (
      <div className="deep-glass relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-white/10 text-center">
        <div className="deep-glass-reflection" />
        <div className="relative z-10 flex flex-col items-center py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4">
            <Ticket size={32} />
          </div>

          <h3 className="text-xl font-bold text-white/90">
            You are not currently in any queue
          </h3>
          <p className="mt-2 text-sm text-white/50 max-w-md">
            Place a print order to join the live queue and track your printing token in real time.
          </p>

          <Link
            href="/student/new-order"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            <PlusCircle size={18} />
            <span>Create New Order</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const isServing = myTokenData.status === "PRINTING";
  const estimatedMins = myTokenData.estimated_wait_minutes || 0;

  // Expected start time calculation
  const now = new Date();
  const startTime = new Date(now.getTime() + estimatedMins * 60000);
  const formattedStartTime = isServing
    ? "Now Printing"
    : startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="deep-glass relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-cyan-500/40 bg-gradient-to-br from-cyan-500/[0.08] via-cyan-500/[0.02] to-transparent shadow-xl"
    >
      <div className="deep-glass-reflection" />
      <div className="deep-glass-rim" />
      <div className="deep-glass-sweep" />

      {/* Background glow */}
      <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10 space-y-6">
        {/* Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
              <Ticket size={20} />
            </div>
            <div>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                My Queue Position
              </span>
              <h3 className="text-lg font-bold text-white/90">
                Token Status & Details
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {myTokenData.is_priority ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 px-3 py-1 text-xs font-semibold text-amber-300">
                <Zap size={13} className="text-amber-400 fill-amber-400" />
                Priority Pass
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-medium text-white/60">
                <ShieldCheck size={13} className="text-white/40" />
                Regular Queue
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 px-3 py-1 text-xs font-bold text-cyan-200">
              {myTokenData.status}
            </span>
          </div>
        </div>

        {/* Hero Token Row */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
            <span className="text-xs text-white/40">My Token Number</span>
            <div className="mt-1 font-mono text-3xl font-black text-cyan-300 tracking-wider">
              {myTokenData.token}
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
            <span className="text-xs text-white/40">Current Position</span>
            <div className="mt-1 font-mono text-3xl font-black text-white/90">
              {position ? `#${position}` : isServing ? "Serving Now" : "1st"}
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
            <span className="text-xs text-white/40">Students Ahead</span>
            <div className="mt-1 flex items-center gap-2">
              <Users size={18} className="text-indigo-400" />
              <span className="font-mono text-2xl font-bold text-white/90">
                {studentsAhead}
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
            <span className="text-xs text-white/40">Expected Start Time</span>
            <div className="mt-1 flex items-center gap-2">
              <Clock size={18} className="text-emerald-400" />
              <span className="font-mono text-xl font-bold text-emerald-300">
                {formattedStartTime}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Guidance */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-cyan-500/[0.05] border border-cyan-500/20 p-4 text-xs text-cyan-200/80">
          <p>
            {isServing
              ? "🚀 Your token is currently on the printer! Head to the print shop counter once printing completes."
              : studentsAhead === 0
              ? "⚡ You are next in line! Please stay near the QLex print shop."
              : `⏳ Please wait. There are ${studentsAhead} students ahead of you.`}
          </p>
          <Link
            href="/student/orders"
            className="shrink-0 font-medium text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
          >
            View Order Details →
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
