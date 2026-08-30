"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Printer,
  Download,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Layers,
  FileCode,
  Sparkles,
  Loader2,
  Eye,
} from "lucide-react";
import type { TodayOrderItem, ShopOrderDetails } from "@/types/shop";
import { fetchOrderDetails } from "@/services/shop";
import { cn } from "@/lib/utils";
import { getFileUrl } from "@/utils/fileUrl";
import { getDocumentDisplayPrice } from "@/utils/pricing";

interface NextOrderCardProps {
  orderItem: TodayOrderItem | null;
  onPrint: (orderId: string) => Promise<void>;
  onReady?: (orderId: string) => Promise<void>;
  onServe: (orderId: string) => Promise<void>;
  onReject: (orderId: string) => Promise<void>;
  onInspect: (orderId: string) => void;
  actionLoading: boolean;
}

export default function NextOrderCard({
  orderItem,
  onPrint,
  onReady,
  onServe,
  onReject,
  onInspect,
  actionLoading,
}: NextOrderCardProps) {
  const [details, setDetails] = useState<ShopOrderDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [downloaded, setDownloaded] = useState<boolean>(false);

  // Fetch full details whenever the hero orderItem changes
  useEffect(() => {
    if (!orderItem) {
      setDetails(null);
      setDownloaded(false);
      return;
    }

    let isMounted = true;
    setLoadingDetails(true);

    fetchOrderDetails(orderItem.order_id)
      .then((data) => {
        if (isMounted) setDetails(data);
      })
      .catch((err) => {
        console.error("Failed to load order details for next order:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingDetails(false);
      });

    return () => {
      isMounted = false;
    };
  }, [orderItem?.order_id]);

  if (!orderItem) {
    return null; // Empty state handles zero orders
  }

  // Derive aggregate metrics from details documents
  const documents = details?.documents || [];
  const docCount = documents.length || orderItem.documents || 1;
  const totalPages = documents.reduce((sum, d) => sum + (d.printable_page_count || d.page_count) * d.copies, 0) || docCount * 2;
  const copiesCount = documents.reduce((max, d) => Math.max(max, d.copies), 1);
  const primaryPrintType = documents[0]?.print_type === "COLOR" ? "Color" : "Black & White";
  const primaryPaperSize = documents[0]?.paper_size || "A4";
  const primarySides = documents[0]?.print_side === "DOUBLE" ? "Double Sided" : "Single Sided";
  const grandTotal = details?.grand_total || 0;

  // Estimated print time (roughly 3 seconds per page + 10s setup)
  const estMinutes = Math.max(1, Math.ceil((totalPages * 3 + 10) / 60));

  const qs = (orderItem.queue_state || "").toUpperCase();
  const isPrinting = qs === "PRINTING";
  const isReady = qs === "READY" || qs === "READY_FOR_PICKUP";
  const studentRegisterNo = `REG-${orderItem.student_id.slice(0, 8).toUpperCase()}`;

  const handleDownload = () => {
    setDownloaded(true);
    // If document file path exists, trigger direct download
    if (documents.length > 0) {
      documents.forEach((doc) => {
        const link = document.createElement("a");
        link.href = getFileUrl(doc.url, orderItem.order_id, doc.stored_filename || doc.original_filename);
        link.download = doc.original_filename;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="deep-glass relative overflow-hidden rounded-3xl border-2 border-amber-400/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(231,200,115,0.15)]"
    >
      {/* Top Gold Lighting Ribbon */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
      <div className="pointer-events-none absolute -top-12 -right-12 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl" />

      {/* Header Badge & Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 shadow-[0_0_20px_rgba(231,200,115,0.2)]">
            <Printer className="h-6 w-6 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                HERO OPERATIONAL CARD
              </span>
              {orderItem.is_priority ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-500/30 to-yellow-500/30 px-3 py-0.5 text-[11px] font-extrabold text-amber-200 shadow-md">
                  <Zap className="h-3 w-3 fill-amber-300 text-amber-300" />
                  PRIORITY PASS
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-400">
                  REGULAR QUEUE
                </span>
              )}
            </div>

            <h3 className="text-2xl font-black text-white sm:text-3xl tracking-tight mt-0.5">
              Next Order To Process
            </h3>
          </div>
        </div>

        {/* Token Badge */}
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border-2 border-amber-400/50 bg-black/60 px-5 py-2 text-center backdrop-blur-xl shadow-xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">
              TOKEN
            </span>
            <span className="text-3xl font-black text-amber-300 tracking-tight">
              {orderItem.token}
            </span>
          </div>
        </div>
      </div>

      {/* Main Order Details Grid */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {/* Student Register No */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Register No
          </span>
          <span className="text-sm font-bold text-white mt-1 block truncate">
            {studentRegisterNo}
          </span>
        </div>

        {/* Document Count */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block flex items-center gap-1">
            <FileText className="h-3 w-3 text-amber-400" />
            Documents
          </span>
          <span className="text-sm font-bold text-white mt-1 block">
            {docCount} {docCount === 1 ? "File" : "Files"}
          </span>
        </div>

        {/* Total Pages */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block flex items-center gap-1">
            <Layers className="h-3 w-3 text-blue-400" />
            Total Pages
          </span>
          <span className="text-sm font-bold text-white mt-1 block">
            {totalPages} Pages
          </span>
        </div>

        {/* Copies & Options */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block flex items-center gap-1">
            <FileCode className="h-3 w-3 text-purple-400" />
            Print Spec
          </span>
          <span className="text-xs font-bold text-amber-200 mt-1 block truncate">
            {primaryPrintType} • {primaryPaperSize}
          </span>
        </div>

        {/* Sides & Copies */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Sides & Copies
          </span>
          <span className="text-xs font-bold text-white mt-1 block truncate">
            {primarySides} ({copiesCount}x)
          </span>
        </div>

        {/* Est Print Time & Amount */}
        <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-3.5 backdrop-blur-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block flex items-center gap-1">
            <Clock className="h-3 w-3 text-amber-400" />
            Est Time / Amount
          </span>
          <span className="text-xs font-bold text-white mt-1 block">
            ~{estMinutes} min • ₹{Number(grandTotal).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Document List Preview */}
      {documents.length > 0 && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
          <span className="text-xs font-bold text-zinc-400 mb-2 block uppercase tracking-wider">
            Files To Print
          </span>
          <div className="flex flex-col gap-2">
            {documents.map((doc) => {
              const displayPrice = getDocumentDisplayPrice(
                doc,
                documents,
                Number(details?.subtotal || 0),
                Number(details?.convenience_fee || 0),
                Number(details?.platform_fee || 0),
                Number(details?.grand_total || (orderItem as any)?.total_amount || 0),
                Number(details?.priority_fee || 0)
              );

              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-xl bg-white/5 p-2.5 px-3 border border-white/5"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-semibold text-white truncate">
                      {doc.original_filename}
                    </span>
                    <span className="text-[11px] text-zinc-400 shrink-0">
                      ({doc.printable_page_count || doc.page_count} pages{doc.custom_pages && doc.custom_pages.trim().toUpperCase() !== "ALL" ? ` • Range: ${doc.custom_pages}` : ""} • {doc.copies} copy)
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-amber-300 shrink-0">
                    ₹{displayPrice.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Bar Indicator */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-zinc-400">Current Queue State:</span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
              isPrinting
                ? "bg-amber-500/20 text-amber-300 border border-amber-400/40 animate-pulse"
                : isReady
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                : "bg-blue-500/20 text-blue-300 border border-blue-400/40"
            )}
          >
            {isPrinting ? "Printing In Progress" : isReady ? "Ready for Pickup" : "Waiting for Operator"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onInspect(orderItem.order_id)}
          className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
        >
          <Eye className="h-4 w-4" />
          <span>Inspect Full Order Specs</span>
        </button>
      </div>

      {/* Action Buttons Sequence: Download -> Print -> Served -> Reject */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Step 1: Download */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownload}
          disabled={actionLoading}
          className={cn(
            "flex items-center justify-center gap-2 rounded-2xl py-3.5 px-4 font-bold text-xs transition-all cursor-pointer border",
            downloaded
              ? "border-blue-400/50 bg-blue-500/20 text-blue-200"
              : "border-white/15 bg-white/10 text-white hover:bg-white/20"
          )}
        >
          <Download className="h-4 w-4" />
          <span>{downloaded ? "Downloaded ✓" : "Download Files"}</span>
        </motion.button>

        {/* Step 2: Print */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onPrint(orderItem.order_id)}
          disabled={actionLoading || isPrinting || isReady}
          className={cn(
            "flex items-center justify-center gap-2 rounded-2xl py-3.5 px-4 font-bold text-xs transition-all cursor-pointer border shadow-lg",
            isPrinting
              ? "border-amber-400/50 bg-amber-500/30 text-amber-200"
              : "border-amber-400/40 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 hover:border-amber-400/80 hover:from-amber-500/30 hover:to-yellow-500/30"
          )}
        >
          {actionLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
          ) : (
            <Printer className="h-4 w-4" />
          )}
          <span>{isPrinting ? "Printing..." : "Print Order"}</span>
        </motion.button>

        {/* Step 3: Ready / Served */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => (isPrinting && onReady ? onReady(orderItem.order_id) : onServe(orderItem.order_id))}
          disabled={actionLoading}
          className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 py-3.5 px-4 font-bold text-xs text-emerald-300 shadow-lg hover:border-emerald-400/80 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all cursor-pointer"
        >
          {actionLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-emerald-300" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <span>{isPrinting ? "Ready for Pickup" : "Mark Served"}</span>
        </motion.button>

        {/* Step 4: Reject */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onReject(orderItem.order_id)}
          disabled={actionLoading}
          className="flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 py-3.5 px-4 font-bold text-xs text-red-400 hover:border-red-500/60 hover:bg-red-500/20 transition-all cursor-pointer"
        >
          {actionLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-red-400" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <span>Reject Order</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
