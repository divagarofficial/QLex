"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Building2,
  Receipt,
  Hash,
  Copy,
  Check,
  CreditCard,
  AlertCircle,
  FileText,
  Sparkles,
  Download,
} from "lucide-react";
import { useParams } from "next/navigation";
import SettlementStatusChip from "@/components/shop/settlements/SettlementStatusChip";
import SettlementBreakdown from "@/components/shop/settlements/SettlementBreakdown";
import BankInformationCard from "@/components/shop/settlements/BankInformationCard";
import SkeletonLoader from "@/components/shop/settlements/SkeletonLoader";
import Popup from "@/components/popup/Popup";
import { fetchSettlementById, generateUpiPayment } from "@/services/shop";
import type { SettlementItem } from "@/types/shop";

export default function SettlementDetailClient({ settlementId }: { settlementId: string }) {
  const params = useParams();
  const rawParam = params?.settlementId as string | undefined;
  const activeSettlementId = rawParam && rawParam !== "placeholder" ? rawParam : settlementId;

  const [settlement, setSettlement] = useState<SettlementItem | null>(null);
  const [upiDetails, setUpiDetails] = useState<{
    upi_id: string;
    payee_name: string;
    amount: number;
    reference: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const [errorModal, setErrorModal] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  const loadSettlement = useCallback(async () => {
    if (!activeSettlementId) return;
    try {
      setIsLoading(true);
      const data = await fetchSettlementById(activeSettlementId);
      setSettlement(data);

      // Attempt to fetch UPI payment details if supported
      generateUpiPayment(activeSettlementId)
        .then((upi) => setUpiDetails(upi))
        .catch(() => null);
    } catch (err: any) {
      console.error("Failed to load settlement details:", err);
      setErrorModal({
        open: true,
        message: err.message || "Unable to fetch requested settlement details from backend server.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeSettlementId]);

  useEffect(() => {
    loadSettlement();
  }, [loadSettlement]);

  const handleCopyId = () => {
    if (settlementId) {
      navigator.clipboard.writeText(settlementId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedDate = settlement?.settlement_date
    ? new Date(settlement.settlement_date).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "N/A";

  const formattedGeneratedAt = settlement?.generated_at
    ? new Date(settlement.generated_at).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "N/A";

  const formattedPaidAt = settlement?.paid_at
    ? new Date(settlement.paid_at).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500/30 selection:text-amber-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* Navigation Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <Link
            href="/shop/settlements"
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 text-slate-300 hover:text-white text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Settlements</span>
          </Link>

          <span className="text-xs font-mono text-slate-400">
            ID: <strong className="text-slate-200">{settlementId.substring(0, 8)}...</strong>
          </span>
        </div>

        {isLoading ? (
          <SkeletonLoader />
        ) : !settlement ? (
          <div className="text-center py-16 space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Settlement Record Not Found</h2>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              The requested settlement ID could not be located in the backend database.
            </p>
            <Link
              href="/shop/settlements"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              Return to Settlements List
            </Link>
          </div>
        ) : (
          <>
            {/* Header Hero Banner */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/30 border border-white/10 p-6 lg:p-8 backdrop-blur-2xl shadow-2xl space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <SettlementStatusChip status={settlement.status} />

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-xs text-slate-300">
                      <Hash className="w-3.5 h-3.5 text-slate-400" />
                      <span>{settlement.id}</span>
                      <button
                        onClick={handleCopyId}
                        className="ml-1 text-slate-400 hover:text-white transition-colors"
                        title="Copy Settlement ID"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Settlement Amount
                    </span>
                    <div className="text-4xl lg:text-5xl font-black text-white tracking-tight mt-1 flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-amber-400">₹</span>
                      <span className="bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
                        {(settlement.amount || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <span>Target Date: <strong className="text-white">{formattedDate}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-emerald-400" />
                      <span>Orders: <strong className="text-white">{settlement.orders_count || 0} Orders</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right side metadata */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2 min-w-[260px] text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Generated At:</span>
                    <span className="font-mono text-slate-200">{formattedGeneratedAt}</span>
                  </div>

                  {formattedPaidAt && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Transferred At:</span>
                      <span className="font-mono text-emerald-300 font-semibold">{formattedPaidAt}</span>
                    </div>
                  )}

                  {settlement.upi_reference && (
                    <div className="flex justify-between pt-1 border-t border-white/10">
                      <span className="text-slate-400">Bank Ref:</span>
                      <span className="font-mono text-amber-300 font-bold">{settlement.upi_reference}</span>
                    </div>
                  )}

                  {upiDetails && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">UPI Payee:</span>
                      <span className="font-mono text-slate-200">{upiDetails.upi_id}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Grid Layout: Financial Breakdown & Bank Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Financial Breakdown Card */}
              <SettlementBreakdown settlement={settlement} />

              {/* Merchant Bank Details Card */}
              <div className="space-y-6">
                <BankInformationCard />

                {/* Additional Settlement Information */}
                <div className="p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    Settlement Notes & Audit Log
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {settlement.notes ||
                      "Automatic end-of-day payout batch processed by QLex Merchant Service. All paid print orders for this date are reconciled and included in this transfer."}
                  </p>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Transfers are processed according to merchant bank business hours.</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Error Popup Modal */}
      <Popup
        open={errorModal.open}
        onClose={() => setErrorModal({ open: false, message: "" })}
        title="Settlement Detail Warning"
        description="Backend Communication Notice"
        icon={<AlertCircle className="w-6 h-6 text-rose-400" />}
        variant="error"
      >
        <Popup.Body>
          <p className="text-sm text-slate-300">{errorModal.message}</p>
        </Popup.Body>
        <Popup.Footer>
          <button
            onClick={() => setErrorModal({ open: false, message: "" })}
            className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-bold transition-all"
          >
            Close
          </button>
        </Popup.Footer>
      </Popup>
    </div>
  );
}
