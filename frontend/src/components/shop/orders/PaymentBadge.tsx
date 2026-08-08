"use client";

import { CheckCircle2, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentBadgeProps {
  status: string;
  className?: string;
}

export default function PaymentBadge({ status, className }: PaymentBadgeProps) {
  const normalized = (status || "").toLowerCase();

  const getBadgeConfig = () => {
    switch (normalized) {
      case "paid":
        return {
          label: "Paid",
          icon: CheckCircle2,
          classes:
            "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
        };
      case "pending":
        return {
          label: "Payment Pending",
          icon: Clock,
          classes:
            "bg-amber-500/10 text-amber-300 border-amber-500/25",
        };
      case "failed":
        return {
          label: "Failed",
          icon: AlertTriangle,
          classes:
            "bg-rose-500/10 text-rose-300 border-rose-500/25",
        };
      case "refunded":
        return {
          label: "Refunded",
          icon: RefreshCw,
          classes:
            "bg-purple-500/10 text-purple-300 border-purple-500/25",
        };
      default:
        return {
          label: status,
          icon: Clock,
          classes:
            "bg-zinc-500/10 text-zinc-300 border-zinc-500/25",
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[11px] font-medium tracking-tight backdrop-blur-sm",
        config.classes,
        className
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}
