"use client";

import { useState } from "react";
import { SettlementItem } from "@/services/adminSettlements";
import { X, CheckCircle2, CreditCard, FileText, Zap } from "lucide-react";

interface CompleteSettlementModalProps {
  settlement: SettlementItem | null;
  onClose: () => void;
  onConfirm: (settlementId: string, upiReference: string, notes?: string) => Promise<void>;
}

export default function CompleteSettlementModal({
  settlement,
  onClose,
  onConfirm,
}: CompleteSettlementModalProps) {
  const [upiReference, setUpiReference] = useState<string>(
    settlement ? `UPI-QLX-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}` : ""
  );
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  if (!settlement) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiReference.trim()) {
      setErrorMsg("Please provide a valid UPI Transaction Reference ID.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      await onConfirm(settlement.id, upiReference.trim(), notes.trim());
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to process settlement completion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Complete Settlement Payout</h3>
              <p className="text-xs text-slate-400">Record bank transfer completion</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Financial Summary */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Merchant Shop</span>
            <span className="font-bold text-slate-200">{settlement.shop_name}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block font-medium">Net Payout Amount</span>
            <span className="text-lg font-extrabold text-emerald-400">
              ₹{(settlement.net_settlement_amount || settlement.amount).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
              UPI / Bank Reference Number *
            </label>
            <input
              type="text"
              value={upiReference}
              onChange={(e) => setUpiReference(e.target.value)}
              placeholder="e.g. UPI-987654321000 or HDFC000123"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Payout Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal remarks or transfer memo..."
              rows={2}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {errorMsg && (
            <p className="text-rose-400 text-xs font-semibold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-950/40 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Processing..." : "Confirm & Complete"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
