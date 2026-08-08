"use client";

import { CheckCircle2, Clock, AlertTriangle, RefreshCw, XCircle } from "lucide-react";

export type PaymentStatusType = "paid" | "pending" | "failed" | "refunded" | "processing" | "cancelled" | string;

interface Props {
  status: PaymentStatusType;
  className?: string;
}

export default function PaymentStatusChip({ status, className = "" }: Props) {
  const normalized = (status || "pending").toLowerCase();

  const getConfig = () => {
    switch (normalized) {
      case "paid":
      case "successful":
      case "success":
        return {
          label: "Successful",
          bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
          icon: CheckCircle2,
        };
      case "pending":
        return {
          label: "Pending",
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
          icon: Clock,
        };
      case "processing":
        return {
          label: "Processing",
          bg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
          icon: RefreshCw,
        };
      case "failed":
        return {
          label: "Failed",
          bg: "bg-rose-500/10 border-rose-500/30 text-rose-400",
          icon: AlertTriangle,
        };
      case "refunded":
        return {
          label: "Refunded",
          bg: "bg-purple-500/10 border-purple-500/30 text-purple-400",
          icon: RefreshCw,
        };
      case "cancelled":
        return {
          label: "Cancelled",
          bg: "bg-white/5 border-white/10 text-white/40",
          icon: XCircle,
        };
      default:
        return {
          label: status,
          bg: "bg-white/10 border-white/20 text-white/80",
          icon: Clock,
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-semibold backdrop-blur-md transition-all ${config.bg} ${className}`}
    >
      <Icon size={12} className={normalized === "processing" ? "animate-spin" : ""} />
      <span>{config.label}</span>
    </span>
  );
}
