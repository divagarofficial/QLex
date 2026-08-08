"use client";

import { motion } from "framer-motion";
import { Users, UserCheck, UserX, UserPlus, Clock } from "lucide-react";
import { StudentOverview as OverviewType } from "@/services/adminStudents";

interface StudentOverviewProps {
  overview: OverviewType | null;
  loading: boolean;
}

export default function StudentOverview({ overview, loading }: StudentOverviewProps) {
  const cards = [
    {
      title: "Total Students",
      value: overview?.total_students ?? 0,
      subtext: "Registered platform users",
      icon: Users,
      color: "from-blue-500/20 to-cyan-500/10",
      borderColor: "border-blue-500/20",
      iconColor: "text-blue-400",
      glow: "shadow-blue-500/5",
    },
    {
      title: "Active Accounts",
      value: overview?.active_students ?? 0,
      subtext: "Enabled & authorized",
      icon: UserCheck,
      color: "from-emerald-500/20 to-emerald-500/5",
      borderColor: "border-emerald-500/20",
      iconColor: "text-emerald-400",
      glow: "shadow-emerald-500/5",
    },
    {
      title: "Blocked Accounts",
      value: overview?.blocked_students ?? 0,
      subtext: "Suspended or restricted",
      icon: UserX,
      color: "from-red-500/20 to-rose-500/5",
      borderColor: "border-red-500/20",
      iconColor: "text-red-400",
      glow: "shadow-red-500/5",
    },
    {
      title: "Registered Today",
      value: overview?.new_registrations_today ?? 0,
      subtext: "Joined QLex today",
      icon: UserPlus,
      color: "from-purple-500/20 to-purple-500/5",
      borderColor: "border-purple-500/20",
      iconColor: "text-purple-400",
      glow: "shadow-purple-500/5",
    },
    {
      title: "Active Queue Users",
      value: overview?.students_with_active_orders ?? 0,
      subtext: "With active print tokens",
      icon: Clock,
      color: "from-amber-500/20 to-amber-500/5",
      borderColor: "border-amber-500/20",
      iconColor: "text-amber-400",
      glow: "shadow-amber-500/5",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.color} border ${card.borderColor} p-4 backdrop-blur-xl shadow-lg ${card.glow} hover:border-cyan-500/40 transition-all group`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl bg-slate-900/60 border border-slate-800 ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              {loading ? (
                <div className="h-8 w-16 bg-slate-800/60 rounded animate-pulse my-1" />
              ) : (
                <div className="text-2xl font-black tracking-tight text-white group-hover:scale-105 transition-transform duration-300 origin-left">
                  {card.value.toLocaleString()}
                </div>
              )}
              <p className="text-[11px] text-slate-400 mt-1 font-medium">{card.subtext}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
