"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
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

export default function PaymentDetailClient({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const params = useParams();
  const rawParam = params?.paymentId as string | undefined;
  const activePaymentId = rawParam && rawParam !== "placeholder" ? rawParam : paymentId;

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
    const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("qlex_token") : null);
    if (!activeToken || !activePaymentId) return;

    try {
      setIsLoading(true);
      const res = await fetchPayments(activeToken);
      const found = res.payments?.find(
        (p) => String(p.payment_id) === activePaymentId || String(p.order_id) === activePaymentId
      );

      if (found) {
        setPayment(found);
        try {
          const orderRes = await fetchOrderDetails(activeToken, found.order_id);
          setOrderDetails(orderRes);
        } catch {
          // Ignore order fallback errors
        }
      } else {
        setPayment(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load payment details.";
      const isUnauthorized = (err as any)?.status === 401 || (err as any)?.response?.status === 401;
      if (isUnauthorized) {
        logout();
        router.push("/student/login");
        return;
      }
      setErrorPopup({
        open: true,
        title: "Payment Retrieval Error",
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
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-bold text-white/90">Transaction Record Not Found</h2>
              <p className="text-xs text-white/40 mt-1">
                The requested payment reference (#{paymentId.slice(0, 8)}) could not be located in your history.
              </p>
              <Link href="/student/payments" className="mt-6 crystal-btn">
                ← Return to Payment History
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const formattedPaidAt = payment.paid_at
    ? new Date(payment.paid_at).toLocaleString([], {
        dateStyle: "full",
        timeStyle: "short",
      })
    : "Pending Verification";

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
              Txn ID: {payment.payment_id}
            </span>
          </div>

          {/* Hero Payment Detail Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="deep-glass relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6"
          >
            <div className="deep-glass-reflection" />
            <div className="relative z-10 space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white/95">
                      Payment Details
                    </h1>
                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                      <Shield size={13} className="text-emerald-400" />
                      <span>Razorpay Secure Gateway • Encrypted Transaction</span>
                    </div>
                  </div>
                </div>

                <PaymentStatusChip status={payment.status} />
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                  <span className="text-xs text-white/40">Amount Paid</span>
                  <div className="mt-1 font-mono text-3xl font-black text-emerald-400">
                    ₹{Number(payment.amount).toFixed(2)}
                  </div>
                </div>

                <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                  <span className="text-xs text-white/40">Associated Token</span>
                  <div className="mt-1 font-mono text-2xl font-black text-amber-400">
                    {payment.token ? `#${payment.token}` : "Pending Token"}
                  </div>
                </div>

                <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                  <span className="text-xs text-white/40">Order Reference</span>
                  <div className="mt-1 font-mono text-sm font-semibold text-white/90 truncate">
                    #{payment.order_id.slice(0, 8)}
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <div className="flex items-center gap-2 rounded-xl bg-white/[0.02] border border-white/5 p-3 text-xs text-white/60">
                <Calendar size={14} className="text-amber-400" />
                <span>Transaction Date: <span className="font-mono text-white/90">{formattedPaidAt}</span></span>
              </div>

              {/* Order Document Summary (if available) */}
              {orderDetails && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2">
                    <FileText size={16} className="text-amber-400" />
                    <span>Paid Order Breakdown ({orderDetails.documents?.length || 0} files)</span>
                  </h3>
                  <div className="space-y-2">
                    {orderDetails.documents?.map((doc, idx) => (
                      <div
                        key={doc.id || idx}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/[0.02] border border-white/10 p-4 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-white/90">{doc.file_name}</div>
                          <div className="text-white/40 mt-0.5">
                            {doc.print_type} • {doc.print_side} • {doc.paper_size} • {doc.copies} Copies
                          </div>
                        </div>
                        <div className="font-mono font-bold text-white/80">
                          ₹{Number(doc.document_total).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setReceiptOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-5 py-3 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <FileText size={16} />
                  <span>Download Digital Tax Receipt</span>
                </button>

                <Link
                  href={`/student/orders/${payment.order_id}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs font-medium text-white/80 hover:bg-white/10"
                >
                  <ExternalLink size={14} />
                  <span>View Complete Order Page</span>
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

      {/* Error Popup */}
      <Popup
        open={errorPopup.open}
        onClose={() => setErrorPopup((prev) => ({ ...prev, open: false }))}
        variant="error"
        size="md"
        title={errorPopup.title}
        description={errorPopup.description}
      >
        <Popup.Footer>
          <button onClick={() => loadData()} className="popup-btn-primary">
            Retry
          </button>
        </Popup.Footer>
      </Popup>
    </ProtectedRoute>
  );
}
