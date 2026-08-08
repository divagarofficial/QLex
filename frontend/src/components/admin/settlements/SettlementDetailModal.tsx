"use client";

import Link from "next/link";
import StatusChip from "./StatusChip";
import SettlementBreakdown from "./SettlementBreakdown";
import { SettlementItem, downloadSettlementStatement, formatToIST } from "@/services/adminSettlements";
import {
  X,
  Building2,
  Calendar,
  CreditCard,
  Download,
  ExternalLink,
  ShoppingBag,
  User,
  Zap,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";

interface SettlementDetailModalProps {
  settlement: SettlementItem | null;
  onClose: () => void;
  onProcessPayout: (settlement: SettlementItem) => void;
}

export default function SettlementDetailModal({
  settlement,
  onClose,
  onProcessPayout,
}: SettlementDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!settlement) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(settlement.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPending = settlement.status === "pending";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Settlement Details
              </h2>
              <StatusChip status={settlement.status} />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span className="font-mono">ID: {settlement.id}</span>
              <button
                onClick={handleCopyId}
                className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                title="Copy Full ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shop & Banking Information Card */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Building2 className="w-4 h-4" />
            Shop & Merchant Account Info
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[11px] text-slate-500 block">Shop Name</span>
              <span className="font-bold text-slate-100">{settlement.shop_name}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Merchant Owner</span>
              <span className="font-medium text-slate-300 flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                {settlement.owner_name}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Bank Name</span>
              <span className="font-medium text-slate-300">{settlement.bank_name}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Masked Account</span>
              <span className="font-mono text-slate-300">{settlement.account_number}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Settlement Cycle</span>
              <span className="font-medium text-slate-300">{settlement.settlement_cycle}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Current Status</span>
              <span className="font-semibold text-cyan-400 capitalize">{settlement.status}</span>
            </div>
          </div>
        </div>

        {/* Financial Breakdown Component */}
        <SettlementBreakdown settlement={settlement} />

        {/* Transaction Reference & Notes */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
              UPI Reference Number:
            </span>
            <span className="font-mono font-bold text-slate-200">
              {settlement.upi_reference || "Not Completed"}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-slate-400">
            <span>Generated: <strong className="text-slate-200">{formatToIST(settlement.generated_at)}</strong></span>
            {settlement.paid_at && (
              <span>Paid: <strong className="text-emerald-400">{formatToIST(settlement.paid_at)}</strong></span>
            )}
          </div>

          {settlement.notes && (
            <div className="pt-2 border-t border-slate-800">
              <span className="text-slate-400 block font-medium">Payout Notes:</span>
              <p className="text-slate-300 mt-0.5 italic">{settlement.notes}</p>
            </div>
          )}
        </div>

        {/* Navigation & Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/shops/${settlement.shop_id || "RIT_PRINT_SHOP"}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>View Shop</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Link>

            <Link
              href={`/admin/orders?settlementId=${settlement.id}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
              <span>View Orders ({settlement.orders_count || 0})</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadSettlementStatement(settlement)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold transition-all border border-emerald-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Statement</span>
            </button>

            {isPending && (
              <button
                onClick={() => {
                  onClose();
                  onProcessPayout(settlement);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Process Payout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
