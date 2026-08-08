"use client";

import { useEffect, useState, useCallback } from "react";
import SettlementsHeader from "@/components/shop/settlements/SettlementsHeader";
import SettlementOverview from "@/components/shop/settlements/SettlementOverview";
import NextSettlementCard from "@/components/shop/settlements/NextSettlementCard";
import PendingSettlementCard from "@/components/shop/settlements/PendingSettlementCard";
import SettlementHistory from "@/components/shop/settlements/SettlementHistory";
import SkeletonLoader from "@/components/shop/settlements/SkeletonLoader";
import Popup from "@/components/popup/Popup";
import {
  fetchPendingSettlements,
  fetchSettlementHistory,
  fetchTodayRevenue,
  generateTodaySettlement,
} from "@/services/shop";
import type { SettlementItem, TodayRevenue } from "@/types/shop";
import { AlertCircle, FileText, Download, CheckCircle2 } from "lucide-react";

export default function SettlementsPage() {
  const [pendingSettlements, setPendingSettlements] = useState<SettlementItem[]>([]);
  const [historySettlements, setHistorySettlements] = useState<SettlementItem[]>([]);
  const [todayRevenue, setTodayRevenue] = useState<TodayRevenue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Popup state for error handling
  const [errorModal, setErrorModal] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  // Statement download modal state
  const [downloadModal, setDownloadModal] = useState<{
    open: boolean;
    settlement: SettlementItem | null;
  }>({
    open: false,
    settlement: null,
  });

  const loadData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      const [pending, history, revenue] = await Promise.all([
        fetchPendingSettlements(),
        fetchSettlementHistory(),
        fetchTodayRevenue().catch(() => ({ total_orders: 0, total_revenue: 0 })),
      ]);

      setPendingSettlements(pending || []);
      setHistorySettlements(history || []);
      setTodayRevenue(revenue);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Failed to load settlement data:", err);
      setErrorModal({
        open: true,
        message: err.message || "Failed to retrieve settlement information from backend server.",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute stats strictly from backend data
  const todayEarningsAmount = todayRevenue?.total_revenue || 0;

  const pendingTotalAmount = pendingSettlements.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  const completedTotalAmount = historySettlements.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  const totalLifetimeAmount = pendingTotalAmount + completedTotalAmount;

  // Primary next pending settlement
  const primaryPending = pendingSettlements.length > 0 ? pendingSettlements[0] : null;

  // Combine all settlements for the history list view
  const allSettlements = [...pendingSettlements, ...historySettlements];

  const handleDownloadStatement = (settlement: SettlementItem) => {
    setDownloadModal({
      open: true,
      settlement,
    });
  };

  const executeDownloadStatement = () => {
    if (!downloadModal.settlement) return;
    // Download statement logic / CSV trigger
    const item = downloadModal.settlement;
    const content = `QLex Settlement Statement\nID: ${item.id}\nDate: ${item.settlement_date}\nAmount: INR ${item.amount}\nStatus: ${item.status}\nRef: ${item.upi_reference || "N/A"}\nOrders: ${item.orders_count || 0}\n`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `QLex_Settlement_${item.settlement_date || "statement"}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    setDownloadModal({ open: false, settlement: null });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500/30 selection:text-amber-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <>
            {/* Header */}
            <SettlementsHeader
              lastUpdated={lastUpdated}
              isRefreshing={isRefreshing}
              onRefresh={() => loadData(true)}
            />

            {/* Overview Stats */}
            <SettlementOverview
              todayEarnings={todayEarningsAmount}
              pendingAmount={pendingTotalAmount}
              completedAmount={completedTotalAmount}
              totalLifetimeEarnings={totalLifetimeAmount}
              pendingCount={pendingSettlements.length}
            />

            {/* Layout Grid: Desktop 2-column or Hero top */}
            <div className="space-y-8">
              {/* Next Settlement Hero */}
              <NextSettlementCard pendingSettlement={primaryPending} />

              {/* Pending Settlement Detailed Progress Card */}
              {primaryPending && (
                <PendingSettlementCard settlement={primaryPending} />
              )}

              {/* Settlement History List & Filters */}
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Settlement History & Transactions
                  </h2>
                  <p className="text-xs text-slate-400">
                    Comprehensive ledger of completed and pending merchant payouts.
                  </p>
                </div>

                <SettlementHistory
                  settlements={allSettlements}
                  onDownloadStatement={handleDownloadStatement}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Error Popup Modal */}
      <Popup
        open={errorModal.open}
        onClose={() => setErrorModal({ open: false, message: "" })}
        title="Settlement Service Warning"
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
            Acknowledge
          </button>
        </Popup.Footer>
      </Popup>

      {/* Statement Download Popup Modal */}
      <Popup
        open={downloadModal.open}
        onClose={() => setDownloadModal({ open: false, settlement: null })}
        title="Download Settlement Statement"
        description="Official Merchant Ledger Export"
        icon={<FileText className="w-6 h-6 text-amber-400" />}
        variant="info"
      >
        <Popup.Body>
          {downloadModal.settlement && (
            <div className="space-y-3 text-sm text-slate-300">
              <p>
                Generate and download the official transaction statement for settlement date{" "}
                <strong className="text-white font-mono">
                  {downloadModal.settlement.settlement_date}
                </strong>
                .
              </p>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Settlement ID:</span>
                  <span className="text-white">{downloadModal.settlement.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Net Amount:</span>
                  <span className="text-amber-300 font-bold">
                    ₹{(downloadModal.settlement.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-emerald-400">{downloadModal.settlement.status}</span>
                </div>
              </div>
            </div>
          )}
        </Popup.Body>
        <Popup.Footer>
          <div className="flex gap-2 justify-end w-full">
            <button
              onClick={() => setDownloadModal({ open: false, settlement: null })}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10"
            >
              Cancel
            </button>
            <button
              onClick={executeDownloadStatement}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report</span>
            </button>
          </div>
        </Popup.Footer>
      </Popup>
    </div>
  );
}
