"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import NonCollegeShopHeader from "./NonCollegeShopHeader";
import CounterQRCodeModal from "./CounterQRCodeModal";
import OrderDetailsModal from "./OrderDetailsModal";
import Popup from "@/components/popup/Popup";
import PrintAgentStatusCard from "./PrintAgentStatusCard";

import {
  fetchTodaysOrders,
  fetchActiveShopOrders,
  markOrderReady,
  serveShopOrder,
  markOrderServed,
  rejectShopOrder,
} from "@/services/shop";

import { fetchPublicShopBySlug, type PublicShop } from "@/services/expressOrders";
import type { TodayOrderItem } from "@/types/shop";

import {
  Printer,
  Clock,
  CheckCircle2,
  Zap,
  Eye,
  XCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface NonCollegeShopQueuePageProps {
  shopSlug?: string;
}

export default function NonCollegeShopQueuePage({
  shopSlug: inputSlug = "acme-offset-and-printers",
}: NonCollegeShopQueuePageProps) {
  const shopSlug = (inputSlug || "acme-offset-and-printers").toLowerCase();

  const [shopProfile, setShopProfile] = useState<PublicShop | null>(null);
  const [shopName, setShopName] = useState<string>(
    shopSlug.includes("acme") ? "ACME OFFSET AND PRINTERS" : shopSlug.replace(/-/g, " ").toUpperCase()
  );

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [inspectOrderId, setInspectOrderId] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const [orders, setOrders] = useState<TodayOrderItem[]>([]);

  const [popupState, setPopupState] = useState<{
    open: boolean;
    variant: "error" | "success";
    title: string;
    description: string;
  }>({
    open: false,
    variant: "error",
    title: "",
    description: "",
  });

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        const profile = await fetchPublicShopBySlug(shopSlug);
        if (profile && isMounted && profile.name) {
          setShopProfile(profile);
          setShopName(profile.name);
        }
      } catch (e) {
        console.log(`[NonCollegeShopQueuePage] Profile lookup for ${shopSlug}:`, e);
      }
    }
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [shopSlug]);

  const loadQueue = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const targetName = shopProfile?.name || shopName;
      const [todaysRes, activeRes] = await Promise.all([
        fetchTodaysOrders(targetName).catch(() => []),
        fetchActiveShopOrders(targetName).catch(() => []),
      ]);

      const orderMap = new Map<string, TodayOrderItem>();
      todaysRes.forEach((o) => orderMap.set(o.order_id, o));
      activeRes.forEach((a) => {
        if (!orderMap.has(a.id)) {
          orderMap.set(a.id, {
            token: a.token || "E-1",
            order_id: a.id,
            student_id: a.student_id || "",
            student_name: a.student_name || "Express Customer",
            register_number: a.register_number || "📱 Guest",
            assigned_printer: a.assigned_printer,
            documents: a.document_count || (a.documents ? a.documents.length : 1),
            is_priority: a.is_priority,
            queue_state: (a.queue_state || a.status || "WAITING") as any,
            is_current: false,
            created_at: a.created_at,
            grand_total: a.grand_total,
            payment_status: a.payment_status,
          });
        }
      });

      setOrders(Array.from(orderMap.values()));
    } catch (err) {
      console.error("Queue Page Load Error:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [shopName, shopProfile?.name]);

  useEffect(() => {
    loadQueue(true);
    const interval = setInterval(() => loadQueue(false), 5000);
    return () => clearInterval(interval);
  }, [loadQueue]);

  const handleMarkReady = async (orderId: string) => {
    setActionLoading(true);
    try {
      await markOrderReady(orderId);
      setPopupState({
        open: true,
        variant: "success",
        title: "Order Ready",
        description: "Customer notified for pickup.",
      });
      await loadQueue(false);
    } catch (err: any) {
      setPopupState({
        open: true,
        variant: "error",
        title: "Action Failed",
        description: err.message || "Failed to mark ready.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleServeOrder = async (orderId: string) => {
    setActionLoading(true);
    try {
      await markOrderServed(orderId).catch(() => serveShopOrder(orderId));
      setPopupState({
        open: true,
        variant: "success",
        title: "Order Served",
        description: "Order completed.",
      });
      await loadQueue(false);
    } catch (err: any) {
      setPopupState({
        open: true,
        variant: "error",
        title: "Action Failed",
        description: err.message || "Failed to serve order.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    setActionLoading(true);
    try {
      await rejectShopOrder(orderId, "Rejected by operator");
      setPopupState({
        open: true,
        variant: "success",
        title: "Order Rejected",
        description: "Order rejected and customer notified.",
      });
      await loadQueue(false);
    } catch (err: any) {
      setPopupState({
        open: true,
        variant: "error",
        title: "Action Failed",
        description: err.message || "Failed to reject order.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const waitingOrders = orders.filter((o) => o.queue_state === "WAITING" || o.queue_state === "PENDING" || o.queue_state === "ACCEPTED");
  const printingOrders = orders.filter((o) => o.queue_state === "PRINTING");
  const readyOrders = orders.filter((o) => o.queue_state === "READY_FOR_PICKUP" || o.queue_state === "READY");

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col font-sans">
      <NonCollegeShopHeader
        shopName={shopName}
        shopSlug={shopSlug}
        activeTab="queue"
        onRefresh={() => loadQueue(false)}
        onShowQR={() => setShowQRModal(true)}
        loading={loading}
      />

      <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Printer className="w-6 h-6 text-cyan-400" /> Live Print Queue — {shopName}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Active print stream and document queue for {shopName}. Auto-refreshes every 5 seconds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              Active Jobs: <strong className="text-cyan-400">{orders.length}</strong>
            </span>
          </div>
        </div>

        {/* Print Agent Health */}
        <PrintAgentStatusCard shopName={shopName} />

        {/* Queue Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Waiting */}
          <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Waiting ({waitingOrders.length})
              </h3>
            </div>

            <div className="space-y-3">
              {waitingOrders.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">No waiting orders</div>
              ) : (
                waitingOrders.map((order) => (
                  <div key={order.order_id} className="p-4 rounded-2xl bg-black/40 border border-amber-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-white">{order.token}</span>
                      <span className="text-xs font-bold text-emerald-400">₹{Number(order.grand_total || 0).toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-slate-300 font-semibold">{order.student_name}</div>
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/5">
                      <span>Docs: {order.documents}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setInspectOrderId(order.order_id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleServeOrder(order.order_id)}
                          className="px-3 py-1 rounded-lg bg-cyan-500 text-black font-bold text-xs"
                        >
                          Print
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: Printing */}
          <div className="rounded-3xl bg-slate-900/60 border border-cyan-500/30 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <Printer className="w-4 h-4 animate-bounce" /> Printing ({printingOrders.length})
              </h3>
            </div>

            <div className="space-y-3">
              {printingOrders.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">No active printing jobs</div>
              ) : (
                printingOrders.map((order) => (
                  <div key={order.order_id} className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-cyan-300">{order.token}</span>
                      <span className="text-xs font-bold text-emerald-400">₹{Number(order.grand_total || 0).toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-slate-200 font-semibold">{order.student_name}</div>
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/5">
                      <span>Printer: {order.assigned_printer || "Agent Pool"}</span>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleMarkReady(order.order_id)}
                        className="px-3 py-1 rounded-lg bg-emerald-500 text-black font-extrabold text-xs"
                      >
                        Mark Ready
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3: Ready for Pickup */}
          <div className="rounded-3xl bg-slate-900/60 border border-emerald-500/30 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Ready for Pickup ({readyOrders.length})
              </h3>
            </div>

            <div className="space-y-3">
              {readyOrders.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">No orders awaiting pickup</div>
              ) : (
                readyOrders.map((order) => (
                  <div key={order.order_id} className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-emerald-300">{order.token}</span>
                      <span className="text-xs font-bold text-emerald-400">₹{Number(order.grand_total || 0).toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-slate-200 font-semibold">{order.student_name}</div>
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/5">
                      <span>Ready for customer</span>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleServeOrder(order.order_id)}
                        className="px-3 py-1 rounded-lg bg-slate-800 text-white font-bold text-xs border border-white/10"
                      >
                        Hand Over
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <CounterQRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        shopName={shopName}
        shopSlug={shopSlug}
      />

      <OrderDetailsModal
        orderId={inspectOrderId}
        onClose={() => setInspectOrderId(null)}
      />

      <Popup
        open={popupState.open}
        onClose={() => setPopupState((prev) => ({ ...prev, open: false }))}
        title={popupState.title}
        description={popupState.description}
        variant={popupState.variant}
        icon={
          popupState.variant === "success" ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          ) : (
            <XCircle className="h-6 w-6 text-red-400" />
          )
        }
        showCloseButton={true}
        dismissOnBackdrop={true}
        dismissOnEsc={true}
      />
    </div>
  );
}
