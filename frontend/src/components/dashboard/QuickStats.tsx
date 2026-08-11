"use client";

import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle,
  CreditCard,
  PackageCheck,
} from "lucide-react";
import type { MyOrderItem } from "@/types/student";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  index: number;
  colorClass: string;
  hasPulse?: boolean;
}

function StatCard({ icon, label, value, index, colorClass, hasPulse }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.15 + index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="deep-glass group relative overflow-hidden h-full"
    >
      <div className="deep-glass-reflection" />
      <div className="deep-glass-rim" />
      <div className="deep-glass-sweep" />

      <div className="relative z-10 p-5 sm:p-6 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between">
          <div className={`flex items-center justify-center w-11 h-11 rounded-2xl ${colorClass} border backdrop-blur-xl shadow-md transition-transform duration-300 group-hover:scale-110`}>
            {icon}
          </div>

          {hasPulse && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          )}
        </div>

        <div className="mt-5">
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {value}
          </p>
          <p className="mt-1 text-xs font-semibold text-zinc-400">
            {label}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

interface QuickStatsProps {
  orders: MyOrderItem[];
  isLoading?: boolean;
}

export default function QuickStats({ orders, isLoading }: QuickStatsProps) {
  if (isLoading) return null;

  const currentOrders = orders.filter((o) => {
    const s = (o.status || "").toUpperCase();
    return !["DRAFT", "COMPLETED", "SERVED", "CANCELLED", "REJECTED", "EXPIRED", "PAYMENT_FAILED"].includes(s);
  }).length;

  const completedOrders = orders.filter((o) => {
    const s = (o.status || "").toUpperCase();
    return s === "COMPLETED" || s === "SERVED";
  }).length;

  const pendingPayments = orders.filter((o) => {
    const p = (o.payment_status || "").toUpperCase();
    return p === "PENDING" || p === "PENDING_PAYMENT";
  }).length;

  const readyForPickup = orders.filter((o) => {
    const s = (o.status || "").toUpperCase();
    return s === "READY_FOR_PICKUP" || s === "READY";
  }).length;

  const stats = [
    {
      icon: <FileText size={20} />,
      label: "Current Orders",
      value: currentOrders,
      colorClass: "bg-amber-400/10 border-amber-400/30 text-amber-300",
    },
    {
      icon: <PackageCheck size={20} />,
      label: "Ready for Pickup",
      value: readyForPickup,
      colorClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
      hasPulse: readyForPickup > 0,
    },
    {
      icon: <CheckCircle size={20} />,
      label: "Completed",
      value: completedOrders,
      colorClass: "bg-blue-500/10 border-blue-500/30 text-blue-300",
    },
    {
      icon: <CreditCard size={20} />,
      label: "Pending Payments",
      value: pendingPayments,
      colorClass: "bg-rose-500/10 border-rose-500/30 text-rose-300",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.label}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
          index={index}
          colorClass={stat.colorClass}
          hasPulse={stat.hasPulse}
        />
      ))}
    </div>
  );
}
