"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Download,
  Eye,
  Printer,
  PackageCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Crown,
  FileText,
  Copy,
  Layers,
  Sparkles,
} from "lucide-react";
import type { EnrichedShopOrder } from "@/types/shop";
import StatusChip from "./StatusChip";
import PaymentBadge from "./PaymentBadge";
import { cn } from "@/lib/utils";
import { getFileUrl } from "@/utils/fileUrl";

interface OrderCardProps {
  order: EnrichedShopOrder;
  onPrint: (orderId: string) => Promise<void>;
  onReady?: (orderId: string) => Promise<void>;
  onServe: (orderId: string) => Promise<void>;
  onRejectTrigger: (order: EnrichedShopOrder) => void;
  isActionLoading?: boolean;
}

export default function OrderCard({
  order,
  onPrint,
  onReady,
  onServe,
  onRejectTrigger,
  isActionLoading = false,
}: OrderCardProps) {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);

  // Format order number & student register number
  const shortOrderId = order.order_id.slice(0, 8).toUpperCase();
  const regNo = order.register_number && order.register_number !== "N/A"
    ? order.register_number
    : `REG-${order.student_id.slice(0, 8).toUpperCase()}`;
  const studentName = order.student_name || "Student";
  const assignedPrinter = order.assigned_printer || null;

  // Format time
  const formattedTime = new Date(order.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Extract specs summary from documents if present
  const docSummary = order.documents && order.documents.length > 0
    ? order.documents[0]
    : null;

  const printTypeLabel = docSummary
    ? docSummary.print_type === "colour" || docSummary.print_type === "COLOR"
      ? "Colour"
      : "Black & White"
    : "Standard";

  const paperSizeLabel = docSummary ? docSummary.paper_size.toUpperCase() : "A4";

  const sideLabel = docSummary
    ? docSummary.print_side === "double" || docSummary.print_side === "DOUBLE"
      ? "Double-sided"
      : "Single-sided"
    : "Single-sided";

  const queueState = (order.queue_state || "").toUpperCase();

  // File Download handler
  const handleDownloadFiles = async () => {
    setDownloading(true);
    try {
      if (order.documents && order.documents.length > 0) {
        order.documents.forEach((doc) => {
          const fileUrl = getFileUrl(doc.url, order.order_id, doc.stored_filename || doc.original_filename);
          const link = document.createElement("a");
          link.href = fileUrl;
          link.download = doc.original_filename || `document_${doc.id}.pdf`;
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      } else {
        // Fallback draft download path
        const fallbackUrl = getFileUrl(null, order.order_id);
        window.open(fallbackUrl, "_blank");
      }
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setTimeout(() => setDownloading(false), 600);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border p-5 backdrop-blur-xl transition-all shadow-xl",
        order.is_priority
          ? "border-amber-400/40 bg-gradient-to-br from-amber-500/10 via-white/5 to-amber-950/20 shadow-[0_0_30px_rgba(231,200,115,0.12)] hover:border-amber-400/60"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
      )}
    >
      {/* Priority subtle ambient glow backdrop (NOT bright red!) */}
      {order.is_priority && (
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
      )}

      {/* Header section: Token, Student Reg, Order ID, Date */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* Token Badge */}
          <div
            className={cn(
              "flex h-12 w-14 flex-col items-center justify-center rounded-2xl border font-black tracking-tight shadow-md",
              order.is_priority
                ? "border-amber-400/50 bg-amber-400/20 text-amber-300 shadow-amber-400/20"
                : "border-purple-400/40 bg-purple-500/15 text-purple-300"
            )}
          >
            <span className="text-xs font-semibold uppercase opacity-80 flex items-center gap-0.5">
              {order.is_priority && <Crown className="h-3 w-3 text-amber-300 inline" />}
              {order.is_priority ? "PRI" : "REG"}
            </span>
            <span className="text-lg font-black leading-none">{order.token}</span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-bold text-white tracking-tight">
                {studentName}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-amber-300 border border-white/10 font-bold">
                {regNo}
              </span>
              <PaymentBadge status={order.payment_status} />
            </div>
            <div className="mt-1 flex items-center gap-2.5 text-xs text-zinc-400 font-mono flex-wrap">
              <span>Order #{shortOrderId}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-zinc-500" />
                {formattedTime}
              </span>
              {assignedPrinter && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-sans font-medium">
                    <Printer className="h-3 w-3 text-emerald-400" /> {assignedPrinter}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Current status chip */}
        <StatusChip status={queueState} />
      </div>

      {/* Specifications & Details section */}
      <div className="my-4 grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] font-semibold uppercase text-zinc-400 flex items-center gap-1">
            <FileText className="h-3 w-3 text-amber-400" />
            Documents
          </span>
          <p className="font-bold text-white">
            {order.document_count} {order.document_count === 1 ? "file" : "files"}
          </p>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] font-semibold uppercase text-zinc-400 flex items-center gap-1">
            <Layers className="h-3 w-3 text-blue-400" />
            Total Pages
          </span>
          <p className="font-bold text-white">{order.total_pages} pages</p>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] font-semibold uppercase text-zinc-400 flex items-center gap-1">
            <Copy className="h-3 w-3 text-purple-400" />
            Copies & Format
          </span>
          <p className="font-bold text-white">
            {order.total_copies}x ({paperSizeLabel})
          </p>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] font-semibold uppercase text-zinc-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-emerald-400" />
            Print Spec
          </span>
          <p className="font-bold text-zinc-200">
            {printTypeLabel} • {sideLabel}
          </p>
        </div>
      </div>

      {/* Document filenames preview if available */}
      {order.documents && order.documents.length > 0 && (
        <div className="mb-4 space-y-1">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Files in Order:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {order.documents.map((doc) => (
              <span
                key={doc.id}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-300 font-mono"
              >
                <FileText className="h-3 w-3 text-amber-400/80" />
                <span className="max-w-[180px] truncate">{doc.original_filename}</span>
                <span className="text-zinc-400">({doc.page_count}p)</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-400">Grand Total:</span>
          <span className="text-sm font-black text-amber-300 font-mono">
            ₹{Number(order.grand_total || 0).toFixed(2)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300 ml-1">
            <Clock className="h-3 w-3 text-amber-400" />
            {queueState === "COMPLETED" || queueState === "SERVED"
              ? "Completed"
              : order.estimated_completion_time
              ? `Est. Finish: ${new Date(order.estimated_completion_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (~${order.estimated_wait_minutes ?? 5}m)`
              : order.estimated_wait_minutes !== undefined
              ? `Est. Finish: ~${order.estimated_wait_minutes} mins`
              : `Est. Print: ~${Math.max(1, Math.ceil(((order.total_pages || 1) * 3 + 45) / 60))} mins`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Files */}
          <button
            type="button"
            onClick={handleDownloadFiles}
            disabled={downloading}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-amber-400/30 hover:bg-amber-500/10 hover:text-amber-300 transition-all cursor-pointer"
            title="Download Order Documents"
          >
            <Download className={`h-3.5 w-3.5 ${downloading ? "animate-bounce text-amber-400" : ""}`} />
            <span>{downloading ? "Downloading..." : "Download Files"}</span>
          </button>

          {/* View Details */}
          <button
            type="button"
            onClick={() => router.push(`/shop/orders/${order.order_id}`)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-300 transition-all cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>View Details</span>
          </button>

          {/* Start Printing (State: WAITING / PENDING / PAID / ACCEPTED) */}
          {(queueState === "WAITING" || queueState === "PENDING" || queueState === "PAID" || queueState === "ACCEPTED") && (
            <button
              type="button"
              onClick={() => onPrint(order.order_id)}
              disabled={isActionLoading}
              className="flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/20 px-3.5 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-400/30 hover:border-amber-400/60 shadow-md shadow-amber-400/10 transition-all cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Start Printing</span>
            </button>
          )}

          {/* Ready for Pickup (State: PRINTING / WAITING / PENDING) */}
          {(queueState === "PRINTING" || queueState === "WAITING" || queueState === "PENDING") && (
            <button
              type="button"
              onClick={() => (onReady ? onReady(order.order_id) : onServe(order.order_id))}
              disabled={isActionLoading}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-3.5 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-500/30 transition-all cursor-pointer"
            >
              <PackageCheck className="h-3.5 w-3.5" />
              <span>Ready for Pickup</span>
            </button>
          )}

          {/* Complete Order (State: PRINTING / READY / READY_FOR_PICKUP) */}
          {(queueState === "PRINTING" || queueState === "READY" || queueState === "READY_FOR_PICKUP") && (
            <button
              type="button"
              onClick={() => onServe(order.order_id)}
              disabled={isActionLoading}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/50 bg-emerald-500/25 px-3.5 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/40 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Complete Order</span>
            </button>
          )}

          {/* Reject button (for active orders) */}
          {queueState !== "SERVED" && queueState !== "COMPLETED" && queueState !== "REJECTED" && (
            <button
              type="button"
              onClick={() => onRejectTrigger(order)}
              disabled={isActionLoading}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-300 hover:border-rose-500/40 hover:bg-rose-500/20 transition-all cursor-pointer"
              title="Reject Order"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Reject</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
