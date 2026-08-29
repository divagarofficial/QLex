"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Package,
  Clock,
  ShieldCheck,
  Banknote,
  FileText,
  Building2,
  Calendar,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Ban,
  RotateCcw,
  Receipt,
  Download,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { MyOrderItem, OrderDetailsResponse } from "@/types/student";
import { fetchOrderDetails } from "@/services/student";
import { generateReceiptPDF } from "@/utils/generateReceiptPDF";

// Status configuration map for chips
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; glow: string }
> = {
  draft: {
    label: "Draft",
    color: "text-white/60",
    bg: "bg-white/[0.05]",
    border: "border-white/10",
    glow: "",
  },
  pending_payment: {
    label: "Pending Payment",
    color: "text-amber-400",
    bg: "bg-amber-400/[0.1]",
    border: "border-amber-400/20",
    glow: "shadow-amber-400/10",
  },
  paid: {
    label: "Paid",
    color: "text-sky-400",
    bg: "bg-sky-400/[0.1]",
    border: "border-sky-400/20",
    glow: "shadow-sky-400/10",
  },
  accepted: {
    label: "Accepted",
    color: "text-champagne-400",
    bg: "bg-champagne-400/[0.1]",
    border: "border-champagne-400/20",
    glow: "shadow-champagne-400/10",
  },
  printing: {
    label: "Printing",
    color: "text-cyan-400",
    bg: "bg-cyan-400/[0.12]",
    border: "border-cyan-400/30",
    glow: "shadow-cyan-400/20",
  },
  ready_for_pickup: {
    label: "Ready for Pickup",
    color: "text-emerald-400",
    bg: "bg-emerald-400/[0.12]",
    border: "border-emerald-400/30",
    glow: "shadow-emerald-400/20",
  },
  completed: {
    label: "Completed",
    color: "text-emerald-400",
    bg: "bg-emerald-400/[0.08]",
    border: "border-emerald-400/20",
    glow: "",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-rose-400",
    bg: "bg-rose-400/[0.1]",
    border: "border-rose-400/20",
    glow: "",
  },
  payment_failed: {
    label: "Payment Failed",
    color: "text-rose-400",
    bg: "bg-rose-400/[0.1]",
    border: "border-rose-400/20",
    glow: "",
  },
  expired: {
    label: "Expired",
    color: "text-white/40",
    bg: "bg-white/[0.03]",
    border: "border-white/10",
    glow: "",
  },
  rejected: {
    label: "Rejected",
    color: "text-rose-400",
    bg: "bg-rose-400/[0.1]",
    border: "border-rose-400/20",
    glow: "",
  },
};

const PAYMENT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-400/[0.1]" },
  paid: { label: "Paid", color: "text-emerald-400", bg: "bg-emerald-400/[0.1]" },
  failed: { label: "Failed", color: "text-rose-400", bg: "bg-rose-400/[0.1]" },
  refunded: { label: "Refunded", color: "text-sky-400", bg: "bg-sky-400/[0.1]" },
};

function getStatusStyle(status: string) {
  return (
    STATUS_CONFIG[status] || {
      label: status.replace(/_/g, " ").toUpperCase(),
      color: "text-white/60",
      bg: "bg-white/[0.05]",
      border: "border-white/10",
      glow: "",
    }
  );
}

function getPaymentStyle(status: string) {
  return (
    PAYMENT_CONFIG[status] || {
      label: status,
      color: "text-white/60",
      bg: "bg-white/[0.05]",
    }
  );
}

interface MyOrderCardProps {
  order: MyOrderItem;
  isActive?: boolean;
}

export default function MyOrderCard({ order, isActive = false }: MyOrderCardProps) {
  const router = useRouter();
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  const statusStyle = getStatusStyle(order.status);
  const paymentStyle = getPaymentStyle(order.payment_status);

  // Check token type
  const isPriorityToken = order.is_priority || (order.token ? order.token.startsWith("P-") : false);

  // Formatted date & time
  const createdDate = new Date(order.created_at);
  const dateFormatted = createdDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeFormatted = createdDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleDownloadReceipt = async () => {
    if (downloadingReceipt) return;
    setDownloadingReceipt(true);

    try {
      const authToken =
        typeof window !== "undefined" ? localStorage.getItem("qlex_token") : null;

      let details: OrderDetailsResponse | null = null;
      if (authToken) {
        try {
          details = await fetchOrderDetails(authToken, order.order_id);
        } catch {
          // Fallback to basic order info if details fetch fails
        }
      }

      generateReceiptPDF({ order, details });
      toast.success(`Receipt downloaded for Order #${order.order_id.slice(0, 8)}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate receipt PDF. Please try again.");
    } finally {
      setDownloadingReceipt(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`deep-glass group relative overflow-hidden rounded-2xl border ${
        isActive ? "border-amber-400/30" : "border-white/10"
      } p-6 transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50`}
    >
      <div className="deep-glass-reflection" />
      <div className="deep-glass-rim" />
      <div className="deep-glass-sweep" />

      {/* Ambient background glow for active cards */}
      {isActive && (
        <div className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
      )}

      <div className="relative z-10 space-y-5">
        {/* Card Top Bar: Icon, Order ID, Token, Priority & Status Chip */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="crystal-badge">
              <Package size={20} className={isActive ? "text-amber-400" : "text-white/60"} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-white tracking-wide">
                  Order #{order.order_id.slice(0, 8)}
                </span>
                {isPriorityToken && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    <Sparkles size={10} />
                    PRIORITY
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-white/40">
                Created on {dateFormatted} at {timeFormatted}
              </p>
            </div>
          </div>

          {/* Token & Large Status Chip */}
          <div className="flex items-center gap-2">
            {order.token && (
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-mono font-semibold text-amber-300">
                Token: {order.token}
              </div>
            )}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusStyle.bg} ${statusStyle.border} ${statusStyle.color} ${statusStyle.glow}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
              {statusStyle.label}
            </span>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {/* Print Shop */}
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Building2 size={12} />
              Print Shop
            </div>
            <p className="mt-1 text-xs font-semibold text-white/90 truncate">
              {order.shop_name || "QLex Central Print Hub"}
            </p>
          </div>

          {/* Documents Count */}
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-3">
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <FileText size={12} />
              Documents
            </div>
            <p className="mt-1 text-xs font-semibold text-white/90">
              {order.documents} {order.documents === 1 ? "file" : "files"}
            </p>
          </div>

          {/* Payment Status */}
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-3">
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Banknote size={12} />
              Payment Status
            </div>
            <span
              className={`mt-1 inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold ${paymentStyle.bg} ${paymentStyle.color}`}
            >
              {paymentStyle.label}
            </span>
          </div>

          {/* Total Amount */}
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-3">
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Banknote size={12} />
              Total Amount
            </div>
            <p className="mt-1 text-sm font-extrabold text-white">
              ₹{Number(order.total_amount).toFixed(2)}
            </p>
          </div>

          {/* Estimated Completion Time */}
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.05] p-3 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-xs text-amber-300/80">
              <Clock size={12} className="text-amber-400" />
              Estimated Time
            </div>
            <p className="mt-1 text-xs font-extrabold text-amber-300">
              {(() => {
                const status = (order.status || "").toLowerCase();
                if (status === "completed" || status === "served") return "Completed";
                if (status === "ready_for_pickup" || status === "ready") return "Ready for Pickup";
                if (status === "cancelled") return "Cancelled";
                if (status === "expired") return "Expired";
                if (status === "rejected") return "Rejected";
                if (status === "payment_failed") return "Payment Failed";

                // Safeguard: Check if order is from a previous day
                const now = new Date();
                const isPreviousDay = createdDate.toDateString() !== now.toDateString() && createdDate < now;
                if (isPreviousDay) {
                  return "Expired";
                }

                // Active orders from today only
                if (order.estimated_completion_time) {
                  const compDate = new Date(order.estimated_completion_time);
                  if (!isNaN(compDate.getTime()) && compDate > now) {
                    return `Ready ~${compDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
                  }
                }

                if (order.estimated_wait_minutes !== undefined && order.estimated_wait_minutes !== null && order.estimated_wait_minutes > 0) {
                  return `~${order.estimated_wait_minutes} min wait`;
                }

                return status === "printing" ? "Printing..." : "Queued";
              })()}
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/[0.06]">
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary View Details Button */}
            <button
              onClick={() => router.push(`/student/orders/${order.order_id}`)}
              className="crystal-btn cursor-pointer"
              aria-label={`View details for order ${order.order_id}`}
            >
              <span>View Details</span>
              <ArrowRight size={14} />
            </button>

            {/* Active order quick actions */}
            {isActive && (
              <>
                <button
                  onClick={() => router.push("/student/token")}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white cursor-pointer flex items-center gap-1.5"
                  aria-label="Track Token"
                >
                  <Clock size={13} className="text-amber-400" />
                  Track Token
                </button>
                <button
                  onClick={() => router.push("/student/live-queue")}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white cursor-pointer flex items-center gap-1.5"
                  aria-label="Live Queue"
                >
                  <ExternalLink size={13} className="text-sky-400" />
                  Live Queue
                </button>
              </>
            )}

            {/* Cancel order button (disabled with tooltip) */}
            {isActive && (
              <button
                disabled
                title="Order is queued in shop system. Contact shop counter for cancellation."
                className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-xs font-medium text-white/30 cursor-not-allowed flex items-center gap-1.5"
              >
                <Ban size={13} />
                Cancel Order
              </button>
            )}
          </div>

          {/* Future-Ready Actions (Reorder / Receipts / Invoices) */}
          <div className="flex items-center gap-2">
            {!isActive && order.status === "completed" && (
              <button
                disabled
                title="Reorder feature coming soon"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/50 cursor-not-allowed opacity-75 hover:opacity-100 flex items-center gap-1.5"
              >
                <RotateCcw size={13} />
                Reorder
              </button>
            )}

            <button
              onClick={handleDownloadReceipt}
              disabled={downloadingReceipt}
              title="Download PDF Receipt"
              className="rounded-xl border border-amber-400/20 bg-amber-400/[0.08] px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-400/20 hover:border-amber-400/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-400/5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloadingReceipt ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-amber-300 border-t-transparent animate-spin" />
                  <span className="hidden sm:inline">Downloading...</span>
                </>
              ) : (
                <>
                  <Download size={13} className="text-amber-400" />
                  <span className="hidden sm:inline">Receipt PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
