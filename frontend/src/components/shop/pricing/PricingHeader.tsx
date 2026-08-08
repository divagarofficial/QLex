"use client";

import Link from "next/link";
import { ArrowLeft, Clock, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface PricingHeaderProps {
  lastUpdated: Date | null;
  lastUpdatedBy?: string;
  hasUnsavedChanges?: boolean;
}

export default function PricingHeader({
  lastUpdated,
  lastUpdatedBy = "Store Manager",
  hasUnsavedChanges = false,
}: PricingHeaderProps) {
  const formattedTime = lastUpdated
    ? new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(lastUpdated)
    : "Just now";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-white/10 pb-5">
      <div>
        <Link
          href="/shop/dashboard"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors mb-2 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          Pricing Configuration
          {hasUnsavedChanges && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
              Unsaved Changes
            </span>
          )}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure printing charges, platform fees, and additional services for your shop.
        </p>
      </div>

      <div className="flex items-center gap-2 sm:flex-col sm:items-end text-xs text-slate-400">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>Updated: <strong className="text-slate-200">{formattedTime}</strong></span>
        </div>
        <div className="inline-flex items-center gap-1 text-[11px] text-slate-500">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>By {lastUpdatedBy}</span>
        </div>
      </div>
    </div>
  );
}
