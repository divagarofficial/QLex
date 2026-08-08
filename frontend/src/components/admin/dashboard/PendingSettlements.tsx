"use client";

import { motion } from "framer-motion";
import { Receipt, Calendar, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import type { SettlementItem } from "@/services/adminDashboard";

interface PendingSettlementsProps {
  settlements: SettlementItem[];
  pendingAmount: number;
  pendingCount: number;
}

export default function PendingSettlements({
  settlements,
  pendingAmount,
  pendingCount,
}: PendingSettlementsProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val);

  // Calculate next settlement date (Tomorrow or Next Business Day)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextDateStr = tomorrow.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="deep-glass relative overflow-hidden rounded-3xl p-6 border border-white/10 shadow-xl mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Summary Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="h-5 w-5 text-yellow-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Pending Shop Settlements
            </h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-lg">
            Total payout amounts pending disbursement to print shop operators.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Total Pending Amount
              </p>
              <p className="text-2xl font-black text-yellow-300">
                {formatCurrency(pendingAmount)}
              </p>
            </div>

            <div className="h-8 w-px bg-white/10 hidden sm:block" />

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Shops Awaiting Payout
              </p>
              <p className="text-2xl font-black text-white">{pendingCount} Shop(s)</p>
            </div>

            <div className="h-8 w-px bg-white/10 hidden sm:block" />

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Next Settlement Cycle
              </p>
              <p className="text-sm font-bold text-cyan-300 flex items-center gap-1.5 mt-1">
                <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                <span>{nextDateStr}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/settlements"
            className="group flex items-center gap-2 rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/20 to-amber-600/20 px-6 py-3 text-xs font-bold text-yellow-300 backdrop-blur-md transition-all hover:border-yellow-400/60 hover:from-yellow-500/30 hover:to-amber-600/30 hover:shadow-[0_0_30px_rgba(231,200,115,0.25)]"
          >
            <span>View Settlements</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
