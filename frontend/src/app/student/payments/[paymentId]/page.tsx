"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Calendar, Store, FileText, CheckCircle2, Shield, Printer, ExternalLink, AlertTriangle } from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { fetchPayments, fetchOrderDetails } from "@/services/student";
import PaymentStatusChip from "@/components/payments/PaymentStatusChip";
import ReceiptModal from "@/components/payments/ReceiptModal";
import SkeletonLoader from "@/components/payments/SkeletonLoader";
import Popup from "@/components/popup/Popup";

import type { PaymentItem, OrderDetailsResponse } from "@/types/student";

export default function PaymentDetailPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const resolvedParams = use(params);
  const paymentId = resolvedParams.paymentId;

  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

  const [payment, setPayment] = useState<PaymentItem | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [errorPopup, setErrorPopup] = useState<{ open: boolean; title: string; description: string }>({
    open: false,
    title: "",
    description: "",
  });

  const loadData = useCallback(async () => {
    if (!token || !paymentId) return;

    try {
      // 1. Fetch payments list to locate target payment record
      const paymentsRes = await fetchPayments(token);
      const foundPayment = paymentsRes.payments?.find(
        (p) => p.payment_id === paymentId || p.order_id === paymentId
      );

      if (foundPayment) {
        setPayment(foundPayment);
        // 2. Fetch order details for fee & document breakdown
        try {
          const details = await fetchOrderDetails(token, foundPayment.order_id);
          setOrderDetails(details);
        } catch {
          setOrderDetails(null);
        }
      } else {
        // Fallback: search order details directly
        try {
          const details = await fetchOrderDetails(token, paymentId);
          setOrderDetails(details);
          setPayment({
            payment_id: paymentId,
            order_id: details.order_id,
            token: details.token,
            amount: details.total_amount,
            status: details.payment_status,
            paid_at: details.created_at,
          });
        } catch {
          setPayment(null);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load payment detail.";
      if (msg.includes("Invalid credentials") || msg.includes("Not authenticated")) {
        logout();
        router.push("/student/login");
        return;
      }
      setErrorPopup({
        open: true,
        title: "Payment Record Not Found",
        description: msg,
      });
    } finally {
      setIsLoading(false);
    }
  }, [token, paymentId, logout, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <SkeletonLoader />
      </ProtectedRoute>
    );
  }

  if (!payment) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-obsidian text-white flex flex-col items-center justify-center p-4">
          <div className="deep-glass relative w-full max-w-md p-8 rounded-3xl text-center space-y-4">
            <div className="deep-glass-reflection" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-4">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-bold text-white/90">Transaction Not Found</h2>
              <p className="text-xs text-white/40 mt-1">
                The requested payment record (#{paymentId.slice(0, 8)}) could not be retrieved.
              </p>
              <Link
                href="/student/payments"
                className="mt-6 crystal-btn"
              >
                ← Back to Payments
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const amount = Number(payment.amount);
  const printSubtotal = orderDetails?.subtotal ? Number(orderDetails.subtotal) : amount;
  const convenienceFee = orderDetails?.convenience_fee ? Number(orderDetails.convenience_fee) : 0;
  const platformFee = orderDetails?.platform_fee ? Number(orderDetails.platform_fee) : 0;
  const priorityFee = orderDetails?.priority_fee ? Number(orderDetails.priority_fee) : 0;

  const formattedDate = payment.paid_at
    ? new Date(payment.paid_at).toLocaleString([], {
        dateStyle: "full",
        timeStyle: "short",
      })
    : "N/A";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-obsidian text-white selection:bg-amber-500/30">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 space-y-6 pb-16">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <Link
              href="/student/payments"
              className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 transition-all hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
            </Link>
            <span className="text-xs font-mono text-white/40">
              Payment ID: {payment.payment_id}
            </span>
          </div>

          {/* Main Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="deep-glass relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6"
          >
            <div className="deep-glass-reflection" />
            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white/95">
                      Transaction Summary
                    </h1>
                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                      <Store size={13} />
                      <span>QLex Central Print Hub</span>
                    </div>
                  </div>
                </div>

                <PaymentStatusChip status={payment.status} className="px-4 py-1 text-sm" />
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                  <span className="text-xs text-white/40">Amount Paid</span>
                  <div className="mt-1 font-mono text-3xl font-black text-emerald-400">
                    ₹{amount.toFixed(2)}
                  </div>
                </div>

                <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                  <span className="text-xs text-white/40">Token Assigned</span>
                  <div className="mt-1 font-mono text-2xl font-bold text-amber-300">
                    {payment.token ? `Token #${payment.token}` : "Regular Queue"}
                  </div>
                </div>

                <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                  <span className="text-xs text-white/40">Payment Gateway</span>
                  <div className="mt-1 font-mono text-lg font-semibold text-white/90">
                    Razorpay UPI
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <div className="flex items-center gap-2 rounded-xl bg-white/[0.02] border border-white/5 p-3 text-xs text-white/60">
                <Calendar size={14} className="text-amber-400" />
                <span>Transaction Timestamp: <span className="font-mono text-white/90">{formattedDate}</span></span>
              </div>

              {/* Fee Breakdown */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider">
                  Payment Fee Breakdown
                </h3>
                <div className="space-y-2 rounded-2xl bg-white/[0.02] border border-white/10 p-4 text-xs">
                  <div className="flex justify-between text-white/70">
                    <span>Print Subtotal</span>
                    <span className="font-mono">₹{printSubtotal.toFixed(2)}</span>
                  </div>
                  {convenienceFee > 0 && (
                    <div className="flex justify-between text-white/50">
                      <span>Convenience Fee</span>
                      <span className="font-mono">₹{convenienceFee.toFixed(2)}</span>
                    </div>
                  )}
                  {platformFee > 0 && (
                    <div className="flex justify-between text-white/50">
                      <span>Platform Fee</span>
                      <span className="font-mono">₹{platformFee.toFixed(2)}</span>
                    </div>
                  )}
                  {priorityFee > 0 && (
                    <div className="flex justify-between text-amber-300 font-semibold">
                      <span>Priority Fee</span>
                      <span className="font-mono">₹{priorityFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-white/10 pt-2 font-bold text-sm text-white/95">
                    <span>Total Amount Charged</span>
                    <span className="font-mono text-emerald-400">₹{amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                {payment.status.toLowerCase() === "paid" && (
                  <button
                    onClick={() => setReceiptOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-5 py-3 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <FileText size={16} />
                    <span>View Official Receipt</span>
                  </button>
                )}

                <Link
                  href="/student/orders"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs font-medium text-white/80 hover:bg-white/10"
                >
                  <ExternalLink size={14} />
                  <span>View Associated Order</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        payment={payment}
      />
    </ProtectedRoute>
  );
}
