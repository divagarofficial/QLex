"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Download, CreditCard, Hash, Calendar, FileText, Copy, Check } from "lucide-react";
import { useState } from "react";
import SettlementStatusChip from "./SettlementStatusChip";
import type { SettlementItem } from "@/types/shop";

interface SettlementCardProps {
  settlement: SettlementItem;
  onDownloadStatement?: (settlement: SettlementItem) => void;
}

export default function SettlementCard({
  settlement,
  onDownloadStatement,
}: SettlementCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (settlement.id) {
      navigator.clipboard.writeText(settlement.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedDate = settlement.settlement_date
    ? new Date(settlement.settlement_date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  const formattedPaidDate = settlement.paid_at
    ? new Date(settlement.paid_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const shortId = settlement.id ? `${settlement.id.substring(0, 8)}...` : "N/A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="group relative overflow-hidden rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-xl border border-white/10 hover:border-amber-500/30 p-5 transition-all duration-300 shadow-lg shadow-black/20"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left side main details */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Settlement ID */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-slate-300">
              <Hash className="w-3 h-3 text-slate-400" />
              <span>{shortId}</span>
              <button
                onClick={handleCopyId}
                className="ml-1 text-slate-400 hover:text-white transition-colors"
                title="Copy Settlement ID"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            {/* Status Chip */}
            <SettlementStatusChip status={settlement.status} />

            {/* Date */}
            <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white tracking-tight">
              ₹{(settlement.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-medium text-slate-400">
              ({settlement.orders_count || 0} Orders Included)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Method: <strong className="text-slate-200 font-medium">UPI / Direct Transfer</strong>
              </span>
            </div>

            {settlement.upi_reference && (
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Ref: <strong className="text-slate-200 font-mono">{settlement.upi_reference}</strong>
                </span>
              </div>
            )}

            {formattedPaidDate && (
              <div className="text-slate-400">
                Paid: <span className="text-slate-300 font-medium">{formattedPaidDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center sm:flex-col lg:flex-row gap-2.5 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
          <Link
            href={`/shop/settlements/${settlement.id}`}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 text-slate-200 hover:text-white text-xs font-bold transition-all duration-200 group/btn"
          >
            <span>View Details</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </Link>

          {onDownloadStatement && (
            <button
              onClick={() => onDownloadStatement(settlement)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all duration-200"
              title="Download Statement PDF"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Statement</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
