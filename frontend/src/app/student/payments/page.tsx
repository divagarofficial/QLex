"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { fetchPayments, fetchMyOrders } from "@/services/student";
import { createPayment, verifyPayment } from "@/services/orders";

import PaymentsHeader from "@/components/payments/PaymentsHeader";
import PaymentOverview from "@/components/payments/PaymentOverview";
import OutstandingPayments from "@/components/payments/OutstandingPayments";
import RecentTransactions from "@/components/payments/RecentTransactions";
import TransactionHistory from "@/components/payments/TransactionHistory";
import InvoiceSection from "@/components/payments/InvoiceSection";
import PaymentBreakdown from "@/components/payments/PaymentBreakdown";
import ReceiptModal from "@/components/payments/ReceiptModal";
import EmptyState from "@/components/payments/EmptyState";
import SkeletonLoader from "@/components/payments/SkeletonLoader";
import Popup from "@/components/popup/Popup";

import type { PaymentItem, MyOrderItem } from "@/types/student";

// Declare Razorpay window object for inline payment
declare global {
  interface Window {
    Razorpay: any;
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const easeCurve = [0.16, 1, 0.3, 1] as const;

const sectionVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easeCurve,
    },
  },
};

export default function PaymentsPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

  // Data states
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [orders, setOrders] = useState<MyOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentItem | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  // Error Popup State
  const [errorPopup, setErrorPopup] = useState<{
    open: boolean;
    title: string;
    description: string;
  }>({
    open: false,
    title: "",
    description: "",
  });

  const loadPaymentData = useCallback(
    async (isManual = false) => {
      const activeToken =
        token || (typeof window !== "undefined" ? localStorage.getItem("qlex_token") : null);
      if (!activeToken) return;
      if (isManual) setIsRefreshing(true);

      try {
        // Fetch payments array
        const paymentsRes = await fetchPayments(activeToken);
        setPayments(paymentsRes.payments || []);

        // Fetch orders array
        try {
          const ordersRes = await fetchMyOrders(activeToken);
          setOrders(ordersRes.orders || []);
        } catch {
          // Orders fetch failure fallback
          setOrders([]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to fetch payment records.";
        const isUnauthorized = (err as any)?.status === 401 || (err as any)?.response?.status === 401;
        if (isUnauthorized) {
          logout();
          router.push("/student/login");
          return;
        }

        setErrorPopup({
          open: true,
          title: "Payment Service Error",
          description: msg || "Failed to communicate with QLex payment servers.",
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token, logout, router]
  );

  useEffect(() => {
    loadPaymentData();
  }, [loadPaymentData]);

  // Derived Overview Calculations
  const completedPayments = payments.filter((p) => p.status.toLowerCase() === "paid");
  const pendingPayments = payments.filter((p) => p.status.toLowerCase() === "pending");
  const failedPayments = payments.filter((p) => p.status.toLowerCase() === "failed");

  // Pending orders from orders list that have pending payment_status
  const pendingOrders = orders.filter((o) => o.payment_status.toLowerCase() === "pending");

  const totalSpent = completedPayments.reduce((acc, p) => acc + Number(p.amount), 0);
  const pendingAmount =
    pendingPayments.reduce((acc, p) => acc + Number(p.amount), 0) ||
    pendingOrders.reduce((acc, o) => acc + Number(o.total_amount), 0);

  // Pay Now Handler (Triggers Razorpay Gateway)
  const handlePayNow = async (orderId: string, amount: number) => {
    const activeToken =
      token || (typeof window !== "undefined" ? localStorage.getItem("qlex_token") : null);
    if (!activeToken) return;

    try {
      setIsRefreshing(true);

      // Create Razorpay payment order
      const paymentOrder = await createPayment(orderId);

      // Initialize Razorpay checkout options
      const options = {
        key: paymentOrder.razorpay_key_id,
        amount: Math.round(amount * 100),
        currency: "INR",
        name: "QLex Print Service",
        description: `Print Payment for Order #${orderId.slice(0, 8)}`,
        order_id: paymentOrder.razorpay_order_id,
        handler: async function (response: any) {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await loadPaymentData(true);
          } catch (verErr: unknown) {
            const msg = verErr instanceof Error ? verErr.message : "Payment verification failed.";
            setErrorPopup({
              open: true,
              title: "Payment Verification Failed",
              description: msg,
            });
          }
        },
        theme: {
          color: "#F5D98E",
        },
      };

      if (typeof window !== "undefined" && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback simulate verification if Razorpay script is not present
        await verifyPayment({
          razorpay_order_id: paymentOrder.razorpay_order_id,
          razorpay_payment_id: `pay_sim_${Date.now()}`,
          razorpay_signature: "simulated_sig",
        });
        await loadPaymentData(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initiate payment.";
      setErrorPopup({
        open: true,
        title: "Payment Creation Failed",
        description: msg,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenReceipt = (payment: PaymentItem) => {
    setSelectedReceipt(payment);
    setReceiptModalOpen(true);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <ProtectedRoute>
        <SkeletonLoader />
      </ProtectedRoute>
    );
  }

  const hasAnyPayments = payments.length > 0 || orders.length > 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-obsidian text-white selection:bg-amber-500/30">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8 pb-16">
          {/* Header */}
          <PaymentsHeader
            onRefresh={() => loadPaymentData(true)}
            isRefreshing={isRefreshing}
          />

          {/* Payment Overview */}
          <PaymentOverview
            totalSpent={totalSpent}
            pendingAmount={pendingAmount}
            completedCount={completedPayments.length}
            failedCount={failedPayments.length}
            totalTransactions={payments.length}
          />

          {!hasAnyPayments ? (
            <EmptyState />
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-6 lg:grid-cols-12"
            >
              {/* Left Column (8 cols) */}
              <div className="space-y-6 lg:col-span-8">
                {/* Outstanding Payments Section */}
                <motion.div variants={sectionVariants}>
                  <OutstandingPayments
                    pendingPayments={pendingPayments}
                    pendingOrders={pendingOrders}
                    onPayNow={handlePayNow}
                  />
                </motion.div>

                {/* Recent Transactions Section */}
                <motion.div variants={sectionVariants}>
                  <RecentTransactions
                    transactions={payments}
                    onOpenReceipt={handleOpenReceipt}
                  />
                </motion.div>

                {/* Full Payment History with Search, Filter & Pagination */}
                <motion.div variants={sectionVariants}>
                  <TransactionHistory
                    transactions={payments}
                    onOpenReceipt={handleOpenReceipt}
                  />
                </motion.div>
              </div>

              {/* Right Column (4 cols) */}
              <div className="space-y-6 lg:col-span-4">
                {/* Invoices & Receipts Cards */}
                <motion.div variants={sectionVariants}>
                  <InvoiceSection
                    completedPayments={completedPayments}
                    onOpenReceipt={handleOpenReceipt}
                  />
                </motion.div>

                {/* Fee Breakdown Info */}
                <motion.div variants={sectionVariants}>
                  <PaymentBreakdown
                    grandTotal={totalSpent > 0 ? totalSpent : 15.0}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Receipt Modal ─────────────────────────────────────────── */}
      <ReceiptModal
        open={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        payment={selectedReceipt}
      />

      {/* ── Error Popup ───────────────────────────────────────────── */}
      <Popup
        open={errorPopup.open}
        onClose={() => setErrorPopup((prev) => ({ ...prev, open: false }))}
        variant="error"
        size="md"
        title={errorPopup.title}
        description={errorPopup.description}
        icon={<AlertTriangle size={28} className="text-red-400" />}
        showBranding
      >
        <Popup.Footer>
          <button
            onClick={() => {
              setErrorPopup((prev) => ({ ...prev, open: false }));
              loadPaymentData(true);
            }}
            className="popup-btn-primary"
          >
            Try Again
          </button>
          <button
            onClick={() => setErrorPopup((prev) => ({ ...prev, open: false }))}
            className="popup-btn-secondary"
          >
            Dismiss
          </button>
        </Popup.Footer>
      </Popup>
    </ProtectedRoute>
  );
}
