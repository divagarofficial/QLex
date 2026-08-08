"use client";

import { Clock, Printer, CheckCircle2, PackageCheck, AlertCircle, Hourglass, PauseCircle, FileEdit, CreditCard } from "lucide-react";

interface StatusChipProps {
  status: string;
  size?: "sm" | "md" | "lg";
}

export default function StatusChip({ status, size = "md" }: StatusChipProps) {
  const normStatus = (status || "").toUpperCase();

  const getStatusConfig = () => {
    switch (normStatus) {
      case "DRAFT":
        return {
          label: "Draft Order",
          colorClass: "bg-slate-500/10 text-slate-300 border-slate-500/25",
          dotColor: "bg-slate-400",
          icon: FileEdit,
          pulse: false,
        };
      case "PENDING_PAYMENT":
        return {
          label: "Pending Payment",
          colorClass: "bg-amber-500/10 text-amber-300 border-amber-500/25",
          dotColor: "bg-amber-400",
          icon: CreditCard,
          pulse: true,
        };
      case "PAID":
        return {
          label: "Payment Confirmed",
          colorClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
          dotColor: "bg-emerald-400",
          icon: CheckCircle2,
          pulse: false,
        };
      case "WAITING":
      case "QUEUED":
      case "SUBMITTED":
        return {
          label: "In Queue",
          colorClass: "bg-amber-500/10 text-amber-300 border-amber-500/25",
          dotColor: "bg-amber-400",
          icon: Hourglass,
          pulse: true,
        };
      case "ACCEPTED":
        return {
          label: "Order Accepted",
          colorClass: "bg-cyan-500/10 text-cyan-300 border-cyan-500/25",
          dotColor: "bg-cyan-400",
          icon: Clock,
          pulse: true,
        };
      case "PRINTING":
        return {
          label: "Printing",
          colorClass: "bg-blue-500/10 text-blue-300 border-blue-500/25",
          dotColor: "bg-blue-400",
          icon: Printer,
          pulse: true,
          spinIcon: true,
        };
      case "PAUSED":
        return {
          label: "Queue Paused",
          colorClass: "bg-orange-500/10 text-orange-300 border-orange-500/25",
          dotColor: "bg-orange-400",
          icon: PauseCircle,
          pulse: false,
        };
      case "READY_FOR_PICKUP":
      case "READY":
        return {
          label: "Ready for Pickup",
          colorClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
          dotColor: "bg-emerald-400",
          icon: CheckCircle2,
          pulse: true,
        };
      case "COLLECTED":
      case "SERVED":
      case "COMPLETED":
        return {
          label: "Collected",
          colorClass: "bg-slate-500/10 text-slate-300 border-slate-500/20",
          dotColor: "bg-slate-400",
          icon: PackageCheck,
          pulse: false,
        };
      case "CANCELLED":
      case "REJECTED":
      case "EXPIRED":
      case "PAYMENT_FAILED":
        return {
          label: normStatus === "EXPIRED" ? "Expired" : normStatus === "PAYMENT_FAILED" ? "Payment Failed" : "Cancelled",
          colorClass: "bg-red-500/10 text-red-300 border-red-500/25",
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
      className={`inline-flex items-center rounded-full font-medium border backdrop-blur-md transition-all duration-300 ${config.colorClass} ${sizeClasses}`}
    >
      <span className="relative flex h-2 w-2">
        {config.pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotColor}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`} />
      </span>

      <IconComponent className={`w-3.5 h-3.5 ${config.spinIcon ? "animate-spin" : ""}`} />
      <span>{config.label}</span>
    </div>
  );
}
