"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Printer, Clock, FileText, CheckCircle2, ShieldAlert, Download, Store, RefreshCw, AlertTriangle } from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { fetchOrderDetails } from "@/services/student";
import StatusBadge from "@/components/token/StatusBadge";
import PaymentStatusChip from "@/components/payments/PaymentStatusChip";
import ReceiptModal from "@/components/token/ReceiptModal";
import SkeletonLoader from "@/components/token/SkeletonLoader";
import Popup from "@/components/popup/Popup";

import type { OrderDetailsResponse } from "@/types/student";

export default function StudentOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;

  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

  const [order, setOrder] = useState<OrderDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const [errorPopup, setErrorPopup] = useState<{ open: boolean; title: string; description: string }>({
    open: false,
    title: "",
    description: "",
  });

  const loadData = useCallback(
    async (isManual = false) => {
      const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("qlex_token") : null);
      if (!activeToken || !orderId) return;

      if (isManual) setIsRefreshing(true);

      try {
        const res = await fetchOrderDetails(activeToken, orderId);
        setOrder(res);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load order details.";
        if (msg.includes("Invalid credentials") || msg.includes("Not authenticated")) {
          logout();
          router.push("/student/login");
          return;
        }
        setErrorPopup({
          open: true,
          title: "Order Retrieval Failed",
          description: msg,
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token, orderId, logout, router]
  );

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

  if (!order) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-obsidian text-white flex flex-col items-center justify-center p-4">
          <div className="deep-glass relative w-full max-w-md p-8 rounded-3xl text-center space-y-4">
            <div className="deep-glass-reflection" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-bold text-white/90">Order Not Found</h2>
              <p className="text-xs text-white/40 mt-1">
                The requested order (#{orderId.slice(0, 8)}) could not be retrieved.
              </p>
              <Link href="/student/orders" className="mt-6 crystal-btn">
                ← Back to My Orders
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleString([], {
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
              href="/student/orders"
              className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 transition-all hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={() => loadData(true)}
                disabled={isRefreshing}
                className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
              >
                <RefreshCw size={14} className={isRefreshing ? "animate-spin text-amber-400" : ""} />
                <span>Refresh</span>
              </button>
              <span className="text-xs font-mono text-white/40">
                Order ID: {order.order_id}
              </span>
            </div>
          </div>

          {/* Hero Order Card */}
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Printer size={24} />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white/95">
                      Order Summary #{order.order_id.slice(0, 8)}
                    </h1>
                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                      <Store size={13} />
                      <span>{order.shop_name || "QLex Central Print Hub"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={order.status} />
                  <PaymentStatusChip status={order.payment_status} />
                </div>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                  <span className="text-xs text-white/40">Token Assigned</span>
                  <div className="mt-1 font-mono text-3xl font-black text-amber-400">
                    {order.token ? `Token #${order.token}` : "Regular Queue"}
                  </div>
                </div>

                <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                  <span className="text-xs text-white/40">Total Price</span>
                  <div className="mt-1 font-mono text-3xl font-black text-emerald-400">
                    ₹{Number(order.total_amount).toFixed(2)}
                  </div>
                </div>

                <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4">
                  <span className="text-xs text-white/40">Order Type</span>
                  <div className="mt-1 font-mono text-lg font-semibold text-white/90">
                    {order.is_priority ? "⚡ Priority Dispatch" : "Standard Print"}
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <div className="flex items-center gap-2 rounded-xl bg-white/[0.02] border border-white/5 p-3 text-xs text-white/60">
                <Clock size={14} className="text-amber-400" />
                <span>Submitted at: <span className="font-mono text-white/90">{formattedDate}</span></span>
              </div>

              {/* Documents List */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={16} className="text-amber-400" />
                  <span>Submitted Documents ({order.documents?.length || 0})</span>
                </h3>
                <div className="space-y-2">
                  {order.documents && order.documents.length > 0 ? (
                    (() => {
                      const totalOrderFees = Number(order.convenience_fee || 0) + Number(order.platform_fee || 0);
                      const totalOrderPages = order.documents.reduce((sum, d) => sum + (d.page_count * d.copies), 0) || 1;

                      return order.documents.map((doc, idx) => {
                        const feeShare = ((doc.page_count * doc.copies) / totalOrderPages) * totalOrderFees;
                        const displayDocTotal = Number(doc.document_total || 0) + feeShare;

                        return (
                          <div
                            key={doc.id || idx}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/[0.02] border border-white/10 p-4 text-xs"
                          >
                            <div>
                              <div className="font-semibold text-white/90">{doc.file_name}</div>
                              <div className="text-white/40 mt-0.5">
                                {doc.print_type} • {doc.print_side} • {doc.paper_size} • {doc.copies} Copies ({doc.page_count} pages)
                              </div>
                            </div>
                            <div className="font-mono font-bold text-emerald-400 text-sm">
                              ₹{displayDocTotal.toFixed(2)}
                            </div>
                          </div>
                        );
                      });
                    })()
                  ) : (
                    <div className="text-xs text-white/40 italic p-3">No document breakdown attached.</div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setReceiptOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-5 py-3 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <FileText size={16} />
                  <span>View Official Receipt</span>
                </button>

                <Link
                  href="/student/token"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-xs font-medium text-white/80 hover:bg-white/10"
                >
                  <Printer size={14} />
                  <span>View Live Token Tracker</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        data={{
          token: order.token ? String(order.token) : "N/A",
          order_id: order.order_id,
          status: (order.status || "WAITING").toUpperCase() as any,
          payment_status: (order.payment_status || "PENDING").toUpperCase() as any,
          total_amount: Number(order.total_amount || 0),
          is_priority: Boolean(order.is_priority),
          created_at: order.created_at || new Date().toISOString(),
          estimated_wait_minutes: 5,
          shop: {
            name: order.shop_name || "QLex Central Print Hub",
            location: "Main Campus Hub",
            working_hours: "08:00 AM - 08:00 PM",
            contact_number: "+91 98765 43210",
          },
          documents: order.documents?.map(d => ({
            id: d.id,
            file_name: d.file_name,
            pages: d.page_count,
            copies: d.copies,
            is_color: (d.print_type || "").toUpperCase().includes("COL"),
            paper_size: d.paper_size,
            print_side: d.print_side,
            document_total: d.document_total,
          })) || [],
          total_pages: order.documents?.reduce((acc, d) => acc + (d.page_count * d.copies), 0) || 1,
          total_copies: order.documents?.reduce((acc, d) => acc + d.copies, 0) || 1,
          color_pages_count: 0,
          bw_pages_count: 0,
        }}
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
          <button onClick={() => loadData(true)} className="popup-btn-primary">
            Retry
          </button>
        </Popup.Footer>
      </Popup>
    </ProtectedRoute>
  );
}
