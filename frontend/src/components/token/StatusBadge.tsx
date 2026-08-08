"use client";

import { Clock, Printer, CheckCircle2, PackageCheck, AlertCircle, Hourglass } from "lucide-react";
import type { OrderStatus } from "@/types/token";

interface StatusBadgeProps {
  status: OrderStatus | string;
  size?: "sm" | "md" | "lg";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const normStatus = (status || "").toUpperCase();

  const getStatusConfig = () => {
    switch (normStatus) {
      case "WAITING":
      case "QUEUE":
        return {
          label: "Waiting in Queue",
          colorClass: "bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
          dotColor: "bg-amber-400",
          icon: Hourglass,
          pulse: true,
        };
      case "ACCEPTED":
        return {
          label: "Order Accepted",
          colorClass: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]",
          dotColor: "bg-cyan-400",
          icon: Clock,
          pulse: true,
        };
      case "PRINTING":
        return {
          label: "Printing in Progress",
          colorClass: "bg-blue-500/10 text-blue-300 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.25)]",
          dotColor: "bg-blue-400",
          icon: Printer,
          pulse: true,
          spinIcon: true,
        };
      case "READY_FOR_PICKUP":
      case "READY":
        return {
          label: "Ready for Pickup",
          colorClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
          dotColor: "bg-emerald-400",
          icon: CheckCircle2,
          pulse: true,
        };
      case "COLLECTED":
      case "COMPLETED":
        return {
          label: "Order Collected",
          colorClass: "bg-slate-500/10 text-slate-300 border-slate-500/20",
          dotColor: "bg-slate-400",
          icon: PackageCheck,
          pulse: false,
        };
      case "CANCELLED":
        return {
          label: "Order Cancelled",
          colorClass: "bg-red-500/10 text-red-300 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]",
          dotColor: "bg-red-400",
          icon: AlertCircle,
          pulse: false,
        };
      default:
        return {
          label: status,
          colorClass: "bg-slate-500/10 text-slate-300 border-slate-500/20",
          dotColor: "bg-slate-400",
          icon: Clock,
          pulse: false,
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-[11px] gap-1.5",
    md: "px-3.5 py-1 text-xs gap-2",
    lg: "px-4 py-1.5 text-sm gap-2.5",
  }[size];

  return (
    <div
      className={`inline-flex items-center rounded-full font-semibold border backdrop-blur-md transition-all duration-300 ${config.colorClass} ${sizeClasses}`}
    >
      {/* Pulsing indicator dot */}
      <span className="relative flex h-2 w-2">
        {config.pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotColor}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`} />
      </span>

      {/* Status Icon */}
      <IconComponent className={`w-3.5 h-3.5 ${config.spinIcon ? "animate-spin" : ""}`} />

      {/* Status Text */}
      <span>{config.label}</span>
    </div>
  );
}
