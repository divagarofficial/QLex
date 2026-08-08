"use client";

import { motion } from "framer-motion";
import {
  Clock,
  Printer,
  CheckCircle2,
  PackageCheck,
  XCircle,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusChipProps {
  status: string;
  className?: string;
}

export default function StatusChip({ status, className }: StatusChipProps) {
  const normalized = (status || "").toUpperCase();

  const getStatusConfig = () => {
    switch (normalized) {
      case "WAITING":
      case "PENDING":
        return {
          label: "Waiting",
          icon: Clock,
          classes:
            "bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]",
          animate: false,
        };
      case "ACCEPTED":
      case "PAID":
        return {
          label: "Accepted",
          icon: CheckCircle2,
          classes:
            "bg-blue-500/10 text-blue-300 border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]",
          animate: false,
        };
      case "PRINTING":
        return {
          label: "Printing",
          icon: Printer,
          classes:
            "bg-amber-400/20 text-amber-200 border-amber-400/40 shadow-[0_0_16px_rgba(231,200,115,0.25)] ring-1 ring-amber-400/30",
          animate: true,
        };
      case "READY":
      case "READY_FOR_PICKUP":
        return {
          label: "Ready for Pickup",
          icon: PackageCheck,
          classes:
            "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_14px_rgba(16,185,129,0.2)]",
          animate: false,
        };
      case "SERVED":
      case "COMPLETED":
        return {
          label: "Completed",
          icon: CheckCircle2,
          classes:
            "bg-emerald-500/10 text-emerald-400/80 border-emerald-500/20",
          animate: false,
        };
      case "REJECTED":
        return {
          label: "Rejected",
          icon: XCircle,
          classes:
            "bg-rose-500/10 text-rose-300 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]",
          animate: false,
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          icon: AlertCircle,
          classes:
            "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
          animate: false,
        };
      default:
        return {
          label: status,
          icon: HelpCircle,
          classes:
            "bg-zinc-500/10 text-zinc-300 border-zinc-500/30",
          animate: false,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <motion.span
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-md transition-all",
        config.classes,
        className
      )}
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          config.animate && "animate-spin text-amber-300"
        )}
      />
      <span>{config.label}</span>
    </motion.span>
  );
}
