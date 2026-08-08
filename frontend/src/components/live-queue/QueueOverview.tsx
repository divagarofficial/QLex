"use client";

import { motion } from "framer-motion";
import { Activity, Ticket, Users, Clock, Zap, Store } from "lucide-react";
import StatusChip, { StatusType } from "./StatusChip";

interface QueueOverviewProps {
  currentActiveToken: string | null;
  myToken: string | null;
  studentsAhead: number;
  estimatedWaitMinutes: number;
  queueSpeed: string; // e.g. "3-5 min / token"
  shopStatus: StatusType | string;
}

export default function QueueOverview({
  currentActiveToken,
  myToken,
  studentsAhead,
  estimatedWaitMinutes,
  queueSpeed,
  shopStatus,
}: QueueOverviewProps) {
  const cards = [
    {
      title: "Current Active Token",
      value: currentActiveToken || "None",
      subtext: currentActiveToken ? "Currently printing" : "Queue idle",
      icon: Activity,
      accent: "text-amber-400 bg-amber-400/10 border-amber-400/20",
      highlight: true,
    },
    {
      title: "My Token",
      value: myToken || "No Token",
      subtext: myToken ? "Active order assigned" : "No active queue",
      icon: Ticket,
      accent: myToken
        ? "text-cyan-400 bg-cyan-400/10 border-cyan-400/20"
        : "text-white/40 bg-white/5 border-white/10",
      highlight: !!myToken,
    },
    {
      title: "Students Ahead",
      value: myToken ? studentsAhead.toString() : "0",
      subtext: studentsAhead === 0 ? "You are next or serving" : `${studentsAhead} ahead of you`,
      icon: Users,
      accent: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
    },
    {
      title: "Est. Waiting Time",
      value: myToken ? (estimatedWaitMinutes > 0 ? `~${estimatedWaitMinutes} mins` : "Now") : "N/A",
      subtext: "Dynamic calculation",
      icon: Clock,
      accent: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    },
    {
      title: "Queue Speed",
      value: queueSpeed,
      subtext: "Average turnaround",
      icon: Zap,
      accent: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    },
    {
      title: "Shop Status",
      value: null, // Special rendering using StatusChip
      subtext: "QLex Central Print Hub",
      icon: Store,
      accent: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className={`deep-glass group relative overflow-hidden p-4 rounded-2xl border ${
              card.highlight
                ? "border-amber-500/40 bg-amber-500/[0.04] shadow-lg shadow-amber-500/5"
                : "border-white/10"
            }`}
          >
            <div className="deep-glass-reflection" />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-white/50 truncate">
                  {card.title}
                </span>
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${card.accent}`}
                >
                  <Icon size={14} />
                </div>
              </div>

              <div className="mt-3">
                {card.value !== null ? (
                  <div className="font-mono text-xl font-bold tracking-tight text-white/90 sm:text-2xl truncate">
                    {card.value}
                  </div>
                ) : (
                  <div className="mt-1">
                    <StatusChip status={shopStatus} />
                  </div>
                )}
                <p className="mt-1 text-[11px] text-white/40 truncate">
                  {card.subtext}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
