"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Package, Clock, ShieldCheck, Banknote, ArrowRight, Hash, Sparkles } from "lucide-react";
import EmptyState from "./EmptyState";
import type { MyOrderItem } from "@/types/student";

// Status variant colors for display
const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  draft: { label: "Draft", color: "text-white/60", bg: "bg-white/[0.04]", border: "border-white/10" },
  pending_payment: { label: "Pending Payment", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30" },
  paid: { label: "Paid", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30" },
  accepted: { label: "Accepted", color: "text-amber-300", bg: "bg-amber-400/10", border: "border-amber-400/30" },
  printing: { label: "Printing", color: "text-sky-400", bg: "bg-sky-400/10", border: "border-sky-400/30" },
  ready_for_pickup: { label: "Ready for Pickup", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30" },
  completed: { label: "Completed", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  cancelled: { label: "Cancelled", color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/30" },
  payment_failed: { label: "Payment Failed", color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/30" },
  expired: { label: "Expired", color: "text-white/40", bg: "bg-white/[0.03]", border: "border-white/10" },
};

const PAYMENT_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-400/10" },
  paid: { label: "Paid", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  failed: { label: "Failed", color: "text-rose-400", bg: "bg-rose-400/10" },
  refunded: { label: "Refunded", color: "text-blue-400", bg: "bg-blue-400/10" },
};

function getStatusStyle(status: string) {
  const norm = (status || "").toLowerCase();
  if (norm === "served") return STATUS_STYLES.completed;
  if (norm === "ready") return STATUS_STYLES.ready_for_pickup;
  if (norm === "waiting" || norm === "queued") return STATUS_STYLES.accepted;
  return STATUS_STYLES[norm] || { label: status, color: "text-white/60", bg: "bg-white/[0.04]", border: "border-white/10" };
}

function getPaymentStyle(status: string) {
  const norm = (status || "").toLowerCase();
  return PAYMENT_STYLES[norm] || { label: status, color: "text-white/60", bg: "bg-white/[0.04]" };
}

function isActiveOrder(order: MyOrderItem): boolean {
  const s = (order.status || "").toUpperCase();
  const inactive = ["DRAFT", "CANCELLED", "COMPLETED", "SERVED", "EXPIRED", "REJECTED", "PAYMENT_FAILED"];
  return !inactive.includes(s);
}

interface ActiveOrderCardProps {
  orders: MyOrderItem[];
  isLoading?: boolean;
}

function ActiveOrderContent({ order, onTrack, onView }: {
  order: MyOrderItem;
  onTrack: () => void;
  onView: () => void;
}) {
  const statusStyle = getStatusStyle(order.status);
  const paymentStyle = getPaymentStyle(order.payment_status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="deep-glass group relative overflow-hidden"
    >
      <div className="deep-glass-reflection" />
      <div className="deep-glass-rim" />
      <div className="deep-glass-sweep" />

      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative z-10 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/30 text-amber-300 shadow-md">
              <Package size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">Active Order</h2>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-light mt-0.5">
                Real-time status updates enabled
              </p>
            </div>
          </div>

          {order.token && (
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-amber-400/10 border border-amber-400/30 backdrop-blur-xl shadow-lg">
              <Sparkles size={14} className="text-amber-400" />
              <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
                Token:
              </span>
              <span className="font-mono text-base font-black text-amber-300">
                {order.token}
              </span>
            </div>
          )}
        </div>

        {/* Order Details Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          {/* Order ID */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3.5">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <Hash size={13} className="text-zinc-500" />
              Order ID
            </div>
            <p className="mt-1 font-mono text-xs sm:text-sm font-bold text-white truncate">
              {order.order_id.slice(0, 8)}...
            </p>
          </div>

          {/* Status */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3.5">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <ShieldCheck size={13} className="text-zinc-500" />
              Status
            </div>
            <div className="mt-1">
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold border ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}`}>
                {statusStyle.label}
              </span>
            </div>
          </div>

          {/* Payment Status */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3.5">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <Banknote size={13} className="text-zinc-500" />
              Payment
            </div>
            <div className="mt-1">
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${paymentStyle.bg} ${paymentStyle.color}`}>
                {paymentStyle.label}
              </span>
            </div>
          </div>

          {/* Total Amount */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3.5">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <Banknote size={13} className="text-zinc-500" />
              Total
            </div>
            <p className="mt-1 text-sm font-extrabold text-white">
              ₹{Number(order.total_amount).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={onTrack}
            className="crystal-btn group/btn"
            aria-label="Track this order"
          >
            <Clock size={15} className="text-amber-300" />
            <span>Track Live Queue</span>
            <ArrowRight size={14} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
          </button>

          <button
            onClick={onView}
            className="crystal-btn"
            aria-label="View order details"
          >
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ActiveOrderCard({ orders, isLoading }: ActiveOrderCardProps) {
  const router = useRouter();

  if (isLoading) {
    return null;
  }

  const activeOrder = orders.find(isActiveOrder);

  if (!activeOrder) {
    return (
      <EmptyState
        icon={<Package size={28} />}
        title="No Active Orders"
        description="You don't have any active print orders right now. Upload your documents to skip the queue."
        action={{
          label: "Create New Order",
          onClick: () => router.push("/student/new-order"),
        }}
      />
    );
  }

  return (
    <ActiveOrderContent
      order={activeOrder}
      onTrack={() => router.push(`/student/live-queue`)}
      onView={() => router.push(`/student/orders`)}
    />
  );
}
