"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Printer,
  Download,
  PackageCheck,
  CheckCircle2,
  XCircle,
  Crown,
  RefreshCw,
  Loader2,
  FileText,
  Copy,
  Layers,
  Sparkles,
} from "lucide-react";
import type { ShopOrderDetails, DetailedOrderDocument } from "@/types/shop";
import {
  fetchOrderDetails,
  fetchOrderSummary,
  printShopOrder,
  markOrderReady,
  serveShopOrder,
  rejectShopOrder,
} from "@/services/shop";

import FilePreviewer from "./FilePreviewer";
import FinancialBreakdown from "./FinancialBreakdown";
import StatusChip from "./StatusChip";
import PaymentBadge from "./PaymentBadge";
import Popup from "@/components/popup/Popup";

interface ShopOrderDetailsPageProps {
  orderId: string;
}

export default function ShopOrderDetailsPage({ orderId }: ShopOrderDetailsPageProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [details, setDetails] = useState<ShopOrderDetails | null>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [selectedDocIndex, setSelectedDocIndex] = useState<number>(0);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [downloadingAll, setDownloadingAll] = useState<boolean>(false);
  const [systemPrinting, setSystemPrinting] = useState<boolean>(false);

  // Popup state
  const [popupState, setPopupState] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant: "default" | "success" | "error" | "warning" | "confirmation";
  }>({
    open: false,
    title: "",
    description: "",
    variant: "default",
  });

  // Reject Modal state
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>("");

  // Load Order Details from Backend
  const loadOrderDetails = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const [shopRes, summaryRes] = await Promise.all([
          fetchOrderDetails(orderId).catch(() => null),
          fetchOrderSummary(orderId).catch(() => null),
        ]);

        if (shopRes) setDetails(shopRes);
        if (summaryRes) setSummaryData(summaryRes);

        if (!shopRes && !summaryRes) {
          throw new Error("Order specifications could not be loaded.");
        }
      } catch (err: any) {
        console.error("Error loading order details:", err);
        setPopupState({
          open: true,
          title: "Order Not Found",
          description: err.message || "Failed to load order specification from backend.",
          variant: "error",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderId]
  );

  useEffect(() => {
    loadOrderDetails();
  }, [loadOrderDetails]);

  // Handle Order State Transitions
  const handlePrintStateUpdate = async () => {
    setActionLoading(true);
    try {
      await printShopOrder(orderId);
      setPopupState({
        open: true,
        title: "Status Moved to Printing",
        description: "Order queue state updated to PRINTING on backend.",
        variant: "success",
      });
      await loadOrderDetails(true);
    } catch (err: any) {
      setPopupState({
        open: true,
        title: "Action Failed",
        description: err.message || "Could not move order status to Printing.",
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkReady = async () => {
    setActionLoading(true);
    try {
      await markOrderReady(orderId);
      setPopupState({
        open: true,
        title: "Ready for Pickup",
        description: "Order marked as READY FOR PICKUP. Alert sent to student.",
        variant: "success",
      });
      await loadOrderDetails(true);
    } catch (err: any) {
      setPopupState({
        open: true,
        title: "Action Failed",
        description: err.message || "Could not mark order as Ready.",
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleServe = async () => {
    setActionLoading(true);
    try {
      await serveShopOrder(orderId);
      setPopupState({
        open: true,
        title: "Order Completed",
        description: "Order marked as SERVED / Ready for pickup.",
        variant: "success",
      });
      await loadOrderDetails(true);
    } catch (err: any) {
      setPopupState({
        open: true,
        title: "Action Failed",
        description: err.message || "Could not mark order as Served.",
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    setActionLoading(true);
    try {
      await rejectShopOrder(orderId);
      setShowRejectModal(false);
      setRejectReason("");
      setPopupState({
        open: true,
        title: "Order Rejected",
        description: "Order has been moved to Rejected status.",
        variant: "warning",
      });
      await loadOrderDetails(true);
    } catch (err: any) {
      setPopupState({
        open: true,
        title: "Rejection Failed",
        description: err.message || "Could not reject order.",
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0D14] text-zinc-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
          <span className="text-sm font-semibold">Loading Order Specifications...</span>
        </div>
      </div>
    );
  }

  const isPriority = details?.is_priority ?? summaryData?.is_priority ?? false;
  const rawToken = details?.token || summaryData?.token || "";
  const token = rawToken && (rawToken.startsWith("P-") || rawToken.startsWith("R-"))
    ? rawToken
    : isPriority
    ? "P-1"
    : "R-1";
  const regNo = `REG-${(details?.student_id || summaryData?.student_id || "STUDENT").slice(0, 8).toUpperCase()}`;
  const shortId = orderId.slice(0, 8).toUpperCase();
  const rawQueueState = details?.queue_state || details?.status || summaryData?.status || summaryData?.queue_state || "WAITING";
  const queueState = String(rawQueueState).toUpperCase();
  const paymentStatus = summaryData?.payment_status || "paid";
  const grandTotal = Number(details?.grand_total || summaryData?.grand_total || 0);

  // Map documents
  const documents: DetailedOrderDocument[] = details?.documents
    ? details.documents.map((d: any) => ({
        id: d.id,
        original_filename: d.original_filename || "Document.pdf",
        stored_filename: d.stored_filename || null,
        page_count: d.page_count || 1,
        copies: d.copies || 1,
        print_type: d.print_type || "black_white",
        paper_size: d.paper_size || "A4",
        print_side: d.print_side || "single",
        document_total: d.document_total || 0,
        url: d.url || (d.stored_filename ? `http://localhost:8000/uploads/drafts/${orderId}/${d.stored_filename}` : null),
        services: d.services || [],
      }))
    : summaryData?.documents
    ? summaryData.documents.map((d: any) => ({
        id: d.id,
        original_filename: d.original_filename || "Document.pdf",
        stored_filename: d.stored_filename || null,
        page_count: d.page_count || 1,
        copies: d.copies || 1,
        print_type: d.print_type || "black_white",
        paper_size: d.paper_size || "A4",
        print_side: d.print_side || "single",
        document_total: d.document_total || 0,
        url: d.url || (d.stored_filename ? `http://localhost:8000/uploads/drafts/${orderId}/${d.stored_filename}` : null),
        services: d.services || [],
      }))
    : [];

  const activeDoc = documents[selectedDocIndex] || documents[0];
  const activePdfUrl = activeDoc
    ? activeDoc.url || (activeDoc.stored_filename ? `http://localhost:8000/uploads/drafts/${orderId}/${activeDoc.stored_filename}` : `http://localhost:8000/uploads/drafts/${orderId}/${activeDoc.original_filename}`)
    : `http://localhost:8000/uploads/drafts/${orderId}`;

  // Download All Files Handler
  const handleDownloadAll = () => {
    setDownloadingAll(true);
    try {
      documents.forEach((doc) => {
        const fileUrl = doc.url || `http://localhost:8000/uploads/drafts/${orderId}/${doc.original_filename}`;
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = doc.original_filename || `document_${doc.id}.pdf`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    } catch (err) {
      console.error("Batch download error:", err);
    } finally {
      setTimeout(() => setDownloadingAll(false), 600);
    }
  };

  // Computer's Printing Service Handler
  const handleSystemPrint = () => {
    setSystemPrinting(true);
    try {
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.src = activePdfUrl;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          const printWin = window.open(activePdfUrl, "_blank");
          if (printWin) {
            printWin.focus();
            printWin.print();
          }
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            setSystemPrinting(false);
          }, 1000);
        }
      };
    } catch (err) {
      console.error("System print error:", err);
      window.open(activePdfUrl, "_blank");
      setSystemPrinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-zinc-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/shop/orders")}
            className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md text-zinc-300 transition-all hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-amber-300 cursor-pointer"
            title="Back to Orders Workbench"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
          </button>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`flex h-8 px-3 items-center justify-center rounded-xl border text-sm font-black tracking-tight font-mono ${
                  isPriority
                    ? "border-amber-400/50 bg-amber-400/20 text-amber-300"
                    : "border-purple-400/40 bg-purple-500/15 text-purple-300"
                }`}
              >
                {isPriority && <Crown className="h-3.5 w-3.5 mr-1 text-amber-300" />}
                {token}
              </span>

              <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
                Order #{shortId}
              </h1>

              <StatusChip status={queueState} />
              <PaymentBadge status={paymentStatus} />
            </div>

            <p className="mt-1 text-xs text-zinc-400 font-medium flex items-center gap-2">
              <span>{regNo}</span>
              <span>•</span>
              <span>Grand Total: ₹{grandTotal.toFixed(2)}</span>
            </p>
          </div>
        </div>

        {/* Primary Action Buttons: Download & Computer Print Service */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownloadAll}
            disabled={downloadingAll}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:border-amber-400/40 hover:bg-amber-500/20 hover:text-amber-300 transition-all cursor-pointer shadow-md"
            title="Download Document Files to Computer"
          >
            <Download className={`h-4 w-4 ${downloadingAll ? "animate-bounce text-amber-400" : ""}`} />
            <span>{downloadingAll ? "Downloading Files..." : "Download File(s)"}</span>
          </button>

          {/* Computer's Printing Service Button */}
          <button
            type="button"
            onClick={handleSystemPrint}
            disabled={systemPrinting}
            className="flex items-center gap-2 rounded-2xl border border-amber-400/50 bg-amber-400/20 px-5 py-2.5 text-xs font-black text-amber-200 hover:bg-amber-400/30 transition-all cursor-pointer shadow-lg shadow-amber-400/15"
            title="Open Computer System Print Dialog"
          >
            <Printer className={`h-4 w-4 ${systemPrinting ? "animate-spin text-amber-300" : ""}`} />
            <span>{systemPrinting ? "Opening Print Dialog..." : "Print via System Printer"}</span>
          </button>
        </div>
      </div>

      {/* Queue Processing Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-300">Queue State Control:</span>
          <span className="text-xs text-zinc-400">Current status is <span className="text-amber-300 font-bold uppercase">{queueState}</span></span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => loadOrderDetails(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-amber-400" : ""}`} />
            <span>Refresh</span>
          </button>

          {(queueState === "WAITING" || queueState === "PENDING" || queueState === "PAID" || queueState === "ACCEPTED" || queueState === "DRAFT") && (
            <button
              type="button"
              onClick={handlePrintStateUpdate}
              disabled={actionLoading}
              className="flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/20 px-3.5 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-400/30 transition-all cursor-pointer shadow-md shadow-amber-400/10"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Mark as Printing</span>
            </button>
          )}

          {(queueState === "PRINTING" || queueState === "WAITING" || queueState === "PENDING" || queueState === "PAID" || queueState === "ACCEPTED") && (
            <button
              type="button"
              onClick={handleMarkReady}
              disabled={actionLoading}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-3.5 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-500/30 transition-all cursor-pointer shadow-md shadow-emerald-500/10"
            >
              <PackageCheck className="h-3.5 w-3.5" />
              <span>Mark Ready for Pickup</span>
            </button>
          )}

          {(queueState === "PRINTING" || queueState === "READY" || queueState === "READY_FOR_PICKUP" || queueState === "WAITING" || queueState === "PENDING" || queueState === "PAID") && (
            <button
              type="button"
              onClick={handleServe}
              disabled={actionLoading}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/50 bg-emerald-500/25 px-3.5 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/40 transition-all cursor-pointer shadow-lg shadow-emerald-500/15"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Complete Order</span>
            </button>
          )}

          {queueState !== "SERVED" && queueState !== "COMPLETED" && queueState !== "REJECTED" && (
            <button
              type="button"
              onClick={() => setShowRejectModal(true)}
              disabled={actionLoading}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-300 hover:border-rose-500/40 hover:bg-rose-500/20 transition-all cursor-pointer"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Reject</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Document Previewer Component */}
      <FilePreviewer
        documents={documents}
        selectedDocIndex={selectedDocIndex}
        onSelectDoc={(idx) => setSelectedDocIndex(idx)}
        orderId={orderId}
        onPrintComplete={() => {
          // Give the user a moment to see the success state, then return to queue
          setTimeout(() => router.push("/shop/orders"), 2000);
        }}
      />

      {/* Financial Breakdown Table */}
      <FinancialBreakdown
        documents={documents}
        subtotal={summaryData?.subtotal || grandTotal}
        convenienceFee={Number(summaryData?.convenience_fee || 0)}
        platformFee={Number(summaryData?.platform_fee || 0)}
        priorityFee={Number(summaryData?.priority_fee || 0)}
        grandTotal={grandTotal}
        paymentStatus={paymentStatus}
      />

      {/* Notification Popup */}
      <Popup
        open={popupState.open}
        onClose={() => setPopupState((prev) => ({ ...prev, open: false }))}
        title={popupState.title}
        description={popupState.description}
        variant={popupState.variant}
        showCloseButton
      />

      {/* Reject Confirmation Modal Popup */}
      <Popup
        open={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason("");
        }}
        title="Confirm Order Rejection"
        description={`Are you sure you want to reject Order #${shortId} for Student ${regNo}?`}
        variant="warning"
        showCloseButton
      >
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Rejection Reason (Optional):
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Unreadable file formatting, invalid document, student request..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white placeholder-zinc-500 backdrop-blur-md focus:border-rose-500/40 focus:outline-none focus:ring-1 focus:ring-rose-500/30"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason("");
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReject}
              disabled={actionLoading}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/20 px-4 py-2 text-xs font-bold text-rose-200 hover:bg-rose-500/30 transition-all cursor-pointer"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Confirm Reject</span>
            </button>
          </div>
        </div>
      </Popup>
    </div>
  );
}
