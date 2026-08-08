"use client";

import { motion } from "framer-motion";
import {
  Users,
  Store,
  FileText,
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Receipt,
  ArrowUpRight,
} from "lucide-react";
import type { AdminOverview } from "@/services/adminDashboard";

interface PlatformOverviewProps {
  data: AdminOverview;
}

export default function PlatformOverview({ data }: PlatformOverviewProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val);

  const stats = [
    {
      title: "Total Students",
      value: data.total_students,
      subtitle: "Registered platform users",
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Registered Shops",
      value: data.registered_shops,
      subtitle: "Active print hubs",
      icon: Store,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      title: "Today's Orders",
      value: data.today_orders,
      subtitle: "Submitted today",
      icon: FileText,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
    },
    {
      title: "Active Queue Orders",
      value: data.active_orders,
      subtitle: "Waiting + Printing + Ready",
      icon: Clock,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
    },
    {
      title: "Completed Today",
      value: data.completed_orders_today,
      subtitle: "Served to students",
      icon: CheckCircle2,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Today's Platform Revenue",
      value: formatCurrency(data.platform_revenue_today),
      subtitle: "Platform & Priority fees today",
      icon: DollarSign,
      color: "text-emerald-300",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      isCurrency: true,
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(data.platform_revenue_month),
      subtitle: "Current month earnings",
      icon: TrendingUp,
      color: "text-violet-400",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
      isCurrency: true,
    },
    {
      title: "Pending Settlements",
      value: formatCurrency(data.pending_settlements_amount),
      subtitle: `${data.pending_settlements_count} settlement(s) pending`,
      icon: Receipt,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
      isCurrency: true,
    },
  ];

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  };

  const itemVariant = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Platform Overview</h2>
          <p className="text-xs text-zinc-400">Key metrics driven by backend database records</p>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.title}
            variants={itemVariant}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-xl"
          >
            {/* Top Light Accent */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-400">{stat.title}</span>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl border ${stat.borderColor} ${stat.bgColor} backdrop-blur-md transition-transform duration-300 group-hover:scale-110`}
              >
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-black text-white tracking-tight">
                {stat.isCurrency ? stat.value : typeof stat.value === "number" ? stat.value.toLocaleString("en-IN") : stat.value}
              </p>
              <ArrowUpRight className="h-4 w-4 text-zinc-500 transition-all duration-300 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>

            <p className="mt-1 text-[11px] font-medium text-zinc-400">{stat.subtitle}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
