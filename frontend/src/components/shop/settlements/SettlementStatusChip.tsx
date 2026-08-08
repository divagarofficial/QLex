"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, AlertCircle, RefreshCw, XCircle } from "lucide-react";

export type SettlementStatusType =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | string;

interface SettlementStatusChipProps {
  status: SettlementStatusType;
  className?: string;
  showIcon?: boolean;
}

export default function SettlementStatusChip({
  status,
  className,
  showIcon = true,
}: SettlementStatusChipProps) {
  const normalized = (status || "").toUpperCase();

  let label = normalized;
  let icon = <Clock className="w-3.5 h-3.5" />;
  let colorClass =
    "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]";

  switch (normalized) {
    case "PENDING":
      label = "Pending Transfer";
      icon = <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />;
      colorClass =
        "bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]";
      break;
    case "PROCESSING":
      label = "Processing";
      icon = <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />;
      colorClass =
        "bg-blue-500/10 text-blue-300 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]";
      break;
    case "COMPLETED":
    case "PAID":
      label = "Completed";
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      colorClass =
        "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
      break;
    case "FAILED":
      label = "Failed";
      icon = <AlertCircle className="w-3.5 h-3.5 text-rose-400" />;
      colorClass =
        "bg-rose-500/10 text-rose-300 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]";
      break;
    case "CANCELLED":
      label = "Cancelled";
      icon = <XCircle className="w-3.5 h-3.5 text-slate-400" />;
      colorClass = "bg-slate-500/10 text-slate-400 border-slate-500/30";
      break;
    default:
      label = status;
      break;
  }

  return (
    <motion.span
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border backdrop-blur-md transition-all duration-200",
        colorClass,
        className
      )}
    >
      {showIcon && icon}
      <span>{label}</span>
    </motion.span>
  );
}
