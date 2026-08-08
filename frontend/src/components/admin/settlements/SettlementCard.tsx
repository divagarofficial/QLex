"use client";

import Link from "next/link";
import StatusChip from "./StatusChip";
import SettlementBreakdown from "./SettlementBreakdown";
import { SettlementItem, downloadSettlementStatement, formatToIST } from "@/services/adminSettlements";
import {
  Building2,
  Calendar,
  CreditCard,
  Download,
  Eye,
  FileText,
  ShoppingBag,
  ExternalLink,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface SettlementCardProps {
  settlement: SettlementItem;
  onViewDetails: (settlement: SettlementItem) => void;
  onProcessPayout: (settlement: SettlementItem) => void;
}

export default function SettlementCard({
  settlement,
  onViewDetails,
  onProcessPayout,
}: SettlementCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(settlement.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedCreated = formatToIST(settlement.generated_at);
  const formattedPaid = settlement.paid_at ? formatToIST(settlement.paid_at) : null;

  const isPending = settlement.status === "pending";

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-slate-800/90 hover:border-cyan-500/40 p-5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-950/20 hover:-translate-y-1 flex flex-col justify-between gap-4">
      {/* Ambient background glow on hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />

      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-300 tracking-wider">
              SET-{settlement.id.slice(0, 8).toUpperCase()}
            </span>
            <button
              onClick={handleCopyId}
              className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
              title="Copy Full Settlement ID"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-200 font-semibold">{settlement.shop_name}</span>
          </div>
        </div>

        <StatusChip status={settlement.status} />
      </div>

      {/* Main Financial Amount Display */}
      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
            Net Settlement Payout
          </span>
          <div className="text-2xl font-extrabold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
            ₹{(settlement.net_settlement_amount || settlement.amount).toFixed(2)}
          </div>
        </div>

        <div className="text-right text-xs space-y-0.5">
          <span className="text-[11px] text-slate-400 block">Settlement Date</span>
          <span className="font-semibold text-slate-200 flex items-center gap-1 justify-end">
            <Calendar className="w-3 h-3 text-cyan-400" />
            {settlement.settlement_date}
          </span>
        </div>
      </div>

      {/* Details Meta Information */}
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Orders Included</span>
          <span className="font-medium text-slate-300">{settlement.orders_count || 0} Orders</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Settlement Cycle</span>
          <span className="font-medium text-slate-300">{settlement.settlement_cycle || "Daily"}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Transfer Method</span>
          <span className="font-medium text-slate-300 flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-cyan-400" />
            UPI Direct Payout
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-semibold">UPI Reference</span>
          <span className="font-mono text-slate-300 font-medium truncate block">
            {settlement.upi_reference || "Pending"}
          </span>
        </div>
      </div>

      {/* Compact Breakdown Preview */}
      <SettlementBreakdown settlement={settlement} compact />

      {/* Timestamps */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/60 pt-2.5">
        <span>Generated: {formattedCreated}</span>
        {formattedPaid && <span className="text-emerald-400 font-medium">Paid: {formattedPaid}</span>}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={() => onViewDetails(settlement)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700/60"
        >
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>View Details</span>
        </button>

        <button
          onClick={() => downloadSettlementStatement(settlement)}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700/60"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Statement</span>
        </button>

        <Link
          href={`/admin/shops/${settlement.shop_id || "RIT_PRINT_SHOP"}`}
          className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-900 text-slate-400 hover:text-cyan-300 text-[11px] font-medium transition-colors border border-slate-800"
        >
          <Building2 className="w-3 h-3" />
          <span>View Shop</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
        </Link>

        <Link
          href={`/admin/orders?settlementId=${settlement.id}`}
          className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-900 text-slate-400 hover:text-cyan-300 text-[11px] font-medium transition-colors border border-slate-800"
        >
          <ShoppingBag className="w-3 h-3" />
          <span>View Orders</span>
          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
        </Link>

        {isPending && (
          <button
            onClick={() => onProcessPayout(settlement)}
            className="col-span-2 mt-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Process & Complete Payout</span>
          </button>
        )}
      </div>
    </div>
  );
}
