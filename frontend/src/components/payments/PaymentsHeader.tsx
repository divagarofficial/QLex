"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw, Wallet } from "lucide-react";

interface PaymentsHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function PaymentsHeader({
  onRefresh,
  isRefreshing,
}: PaymentsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <Link
          href="/student/dashboard"
          className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 transition-all hover:bg-white/10 hover:border-amber-400/40 hover:text-white"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
        </Link>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white/95 sm:text-3xl">
              Payments
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
              <Wallet size={12} className="text-amber-400" />
              WALLET
            </span>
          </div>
          <p className="mt-1 text-sm text-white/50">
            Manage your print payment history.
          </p>
        </div>
      </div>

      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="group flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-medium text-white/80 transition-all hover:bg-white/10 hover:border-amber-400/30 active:scale-95 disabled:opacity-50 self-end sm:self-auto"
      >
        <RefreshCw
          size={14}
          className={`transition-transform ${isRefreshing ? "animate-spin text-amber-400" : "group-hover:rotate-180"}`}
        />
        <span>{isRefreshing ? "Syncing..." : "Refresh"}</span>
      </button>
    </div>
  );
}
