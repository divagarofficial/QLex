"use client";

import { CheckCircle2, Clock, AlertTriangle, PauseCircle, WifiOff, Wrench } from "lucide-react";

export type StatusType = "OPEN" | "BUSY" | "VERY_BUSY" | "PAUSED" | "OFFLINE" | "MAINTENANCE";

interface Props {
  status: StatusType | string;
  className?: string;
}

export default function StatusChip({ status, className = "" }: Props) {
  const normalized = (status || "OPEN").toUpperCase();

  const getStatusConfig = () => {
    switch (normalized) {
      case "OPEN":
        return {
          label: "Open",
          bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
          dot: "bg-emerald-400",
          icon: CheckCircle2,
        };
      case "BUSY":
        return {
          label: "Busy",
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
          dot: "bg-amber-400",
          icon: Clock,
        };
      case "VERY_BUSY":
      case "VERY BUSY":
        return {
          label: "Very Busy",
          bg: "bg-orange-500/10 border-orange-500/30 text-orange-400",
          dot: "bg-orange-400",
          icon: AlertTriangle,
        };
      case "PAUSED":
        return {
          label: "Paused",
          bg: "bg-yellow-500/10 border-yellow-500/30 text-yellow-300",
          dot: "bg-yellow-300",
          icon: PauseCircle,
        };
      case "OFFLINE":
        return {
          label: "Offline",
          bg: "bg-rose-500/10 border-rose-500/30 text-rose-400",
          dot: "bg-rose-400",
          icon: WifiOff,
        };
      case "MAINTENANCE":
        return {
          label: "Maintenance",
          bg: "bg-purple-500/10 border-purple-500/30 text-purple-400",
          dot: "bg-purple-400",
          icon: Wrench,
        };
      default:
        return {
          label: status,
          bg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
          dot: "bg-cyan-400",
          icon: CheckCircle2,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-md transition-all ${config.bg} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full ${config.dot} opacity-75`}
        />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${config.dot}`} />
      </span>
      <Icon size={13} className="shrink-0" />
      <span>{config.label}</span>
    </div>
  );
}
