"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Logo from "@/components/common/Logo";
import CounterQRCodeModal from "./CounterQRCodeModal";
import OrderDetailsModal from "./OrderDetailsModal";
import Popup from "@/components/popup/Popup";
import PrintAgentStatusCard from "./PrintAgentStatusCard";
import NonCollegeShopHeader from "./NonCollegeShopHeader";

import {
  fetchTodaysOrders,
  fetchActiveShopOrders,
  fetchTodayRevenue,
  markOrderReady,
  serveShopOrder,
  markOrderServed,
  rejectShopOrder,
  fetchPendingSettlements,
  fetchSettlementHistory,
  fetchPrintAgentHealth,
  type PrintAgentHealth,
} from "@/services/shop";

import {
  fetchPublicShopBySlug,
  type PublicShop,
} from "@/services/expressOrders";

import type { TodayOrderItem, TodayRevenue, SettlementItem } from "@/types/shop";

import {
  Store,
  QrCode,
  RefreshCw,
  Printer,
  CheckCircle2,
  Clock,
  Smartphone,
  Sparkles,
  Zap,
  TrendingUp,
  PackageCheck,
  Eye,
  CreditCard,
  DollarSign,
  Receipt,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  XCircle,
  MapPin,
  Phone,
  LogOut,
} from "lucide-react";

interface NonCollegeShopDashboardProps {
  shopSlug?: string;
  initialShopName?: string;
}

export default function NonCollegeShopDashboard({
  shopSlug: inputSlug = "acme-offset-and-printers",
  initialShopName,
}: NonCollegeShopDashboardProps) {
  const router = useRouter();

  // Clean slug
  const shopSlug = (inputSlug || "acme-offset-and-printers").toLowerCase();

  // Require 4-digit PIN authentication for THIS SPECIFIC SHOP before opening dashboard
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("qlex_shop_token") : null;
    const slug = typeof window !== "undefined" ? localStorage.getItem("qlex_shop_slug") : null;
    if (!token || (slug && slug !== shopSlug)) {
      router.replace(`/shop/${encodeURIComponent(shopSlug)}/login`);
    }
  }, [router, shopSlug]);



  const [shopProfile, setShopProfile] = useState<PublicShop | null>(null);

  const [shopName, setShopName] = useState<string>(
    initialShopName || (shopSlug.includes("acme") ? "ACME OFFSET AND PRINTERS" : shopSlug.replace(/-/g, " ").toUpperCase())
  );

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [inspectOrderId, setInspectOrderId] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);

  const [orders, setOrders] = useState<TodayOrderItem[]>([]);
  const [revenue, setRevenue] = useState<TodayRevenue>({ total_orders: 0, total_revenue: 0 });
  const [pendingSettlements, setPendingSettlements] = useState<SettlementItem[]>([]);
  const [historySettlements, setHistorySettlements] = useState<SettlementItem[]>([]);
  const [agentHealth, setAgentHealth] = useState<PrintAgentHealth | null>(null);

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

  // Load shop metadata
  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        const profile = await fetchPublicShopBySlug(shopSlug);
        if (profile && isMounted) {
          setShopProfile(profile);
          if (profile.name) {
            setShopName(profile.name);
          }
        }
      } catch (e) {
        console.log(`[NonCollegeShopDashboard] Shop profile lookup for ${shopSlug}:`, e);
      }
    }
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [shopSlug]);

  // Load shop real data (Orders, Revenue, Agent, Settlements)
  const loadShopData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const targetName = shopProfile?.name || shopName;
      const [todaysRes, activeRes, revRes, pendRes, histRes, agentRes] = await Promise.all([
        fetchTodaysOrders(targetName).catch(() => []),
        fetchActiveShopOrders(targetName).catch(() => []),
        fetchTodayRevenue(targetName).catch(() => ({ total_orders: 0, total_revenue: 0 })),
        fetchPendingSettlements(targetName).catch(() => []),
        fetchSettlementHistory(targetName).catch(() => []),
        fetchPrintAgentHealth(targetName).catch(() => null),
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
            subtotal: a.subtotal,
            grand_total: a.grand_total,
            payment_status: a.payment_status,
          });
        }
      });

      const combinedOrders = Array.from(orderMap.values());
      setOrders(combinedOrders);
      setRevenue(revRes);
      setPendingSettlements(pendRes);
      setHistorySettlements(histRes);
      if (agentRes) setAgentHealth(agentRes);
    } catch (err) {
      console.error("Shop Dashboard Load Error:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [shopName, shopProfile?.name]);

  useEffect(() => {
    loadShopData(true);
    const interval = setInterval(() => loadShopData(false), 5000);
    return () => clearInterval(interval);
  }, [loadShopData]);

  // Handle Mark Ready
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
      await loadShopData(false);
    } catch (err: any) {
      setPopupState({
        open: true,
        variant: "error",
        title: "Update Failed",
        description: err.message || "Failed to mark order ready.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Serve/Complete
  const handleServeOrder = async (orderId: string) => {
    setActionLoading(true);
    try {
      await markOrderServed(orderId).catch(() => serveShopOrder(orderId));
      setPopupState({
        open: true,
        variant: "success",
        title: "Order Served",
        description: "Job completed and archived.",
      });
      await loadShopData(false);
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

  // Handle Reject Order
  const handleRejectOrder = async (orderId: string) => {
    setActionLoading(true);
    try {
      await rejectShopOrder(orderId, "Rejected by shop operator");
      setPopupState({
        open: true,
        variant: "success",
        title: "Order Rejected",
        description: "Order rejected and customer notified.",
      });
      await loadShopData(false);
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

  // Net Settlement Calculation
  const totalSettlementPending = pendingSettlements.reduce((acc, curr) => acc + Number(curr.net_settlement_amount || curr.amount || 0), 0);
  const totalSettlementSettled = historySettlements.reduce((acc, curr) => acc + Number(curr.net_settlement_amount || curr.amount || 0), 0);

  const waitingOrders = orders.filter((o) => o.queue_state === "WAITING" || o.queue_state === "PENDING" || o.queue_state === "ACCEPTED");
  const printingOrders = orders.filter((o) => o.queue_state === "PRINTING");
  const readyOrders = orders.filter((o) => o.queue_state === "READY_FOR_PICKUP" || o.queue_state === "READY");
  const completedOrdersCount = revenue.total_orders || orders.length;

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Background Glow Orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navigation Header & Tabs */}
      <NonCollegeShopHeader
        shopName={shopName}
        shopSlug={shopSlug}
        activeTab="dashboard"
        onRefresh={() => loadShopData(false)}
        onShowQR={() => setShowQRModal(true)}
        loading={loading}
      />

      {/* Main Container */}
      <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Banner Details Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-white/10 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Building2 className="w-48 h-48 text-cyan-400" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-800/50">
                  {shopProfile?.tagline || "Express Commercial Print Kiosk"}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">{shopName}</h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                {shopProfile?.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {shopProfile.address}
                  </span>
                )}
                {shopProfile?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" /> {shopProfile.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> {shopProfile?.operating_hours || "Open 8:00 AM - 9:00 PM"}
                </span>
              </div>
            </div>

            {/* Direct Ordering Link Box */}
            <div className="deep-glass p-4 rounded-2xl border border-white/10 flex flex-col gap-1 min-w-[260px]">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" /> Walk-In Order Kiosk Link
              </span>
              <code className="text-xs font-mono font-bold text-cyan-300 bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5 truncate">
                qlexmindtech.vercel.app/{shopSlug}
              </code>
              <span className="text-[10px] text-slate-400 mt-0.5">Customers scan QR code at counter to order instantly</span>
            </div>
          </div>
        </div>

        {/* Top Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Today Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Revenue</span>
              <div className="text-2xl font-black text-white mt-1">₹{Number(revenue.total_revenue || 0).toFixed(2)}</div>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> Direct UPI Payouts
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </motion.div>

          {/* Card 2: Today Orders */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Orders Today</span>
              <div className="text-2xl font-black text-white mt-1">{completedOrdersCount}</div>
              <span className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1 mt-1">
                <PackageCheck className="w-3 h-3" /> {orders.length} Active in Pipeline
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Receipt className="w-6 h-6" />
            </div>
          </motion.div>

          {/* Card 3: Queue Waiting */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Waiting in Queue</span>
              <div className="text-2xl font-black text-amber-400 mt-1">{waitingOrders.length}</div>
              <span className="text-[11px] text-amber-300/80 font-semibold flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" /> Ready for Printing
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Printer className="w-6 h-6" />
            </div>
          </motion.div>

          {/* Card 4: Ready for Pickup */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl bg-slate-900/80 border border-white/10 p-5 shadow-xl flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ready for Pickup</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">{readyOrders.length}</div>
              <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Awaiting Customer Collection
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </motion.div>
        </div>

        {/* Print Agent Status Bar */}
        <PrintAgentStatusCard shopName={shopName} />

        {/* Live Express Print Queue Section */}
        <div className="rounded-3xl bg-slate-900/90 border border-white/10 p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" /> Live Print Workbench & Express Orders
              </h3>
              <p className="text-xs text-slate-400">
                Real-time queue for {shopName}. Orders submitted online or scanned at counter appear here.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                Total Queue: <strong className="text-white">{orders.length}</strong>
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
              <p className="text-sm font-medium">Fetching real-time shop queue for {shopName}...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-3 border border-dashed border-white/10 rounded-2xl bg-black/20">
              <Printer className="w-12 h-12 text-slate-600" />
              <div className="space-y-1">
                <p className="text-base font-bold text-slate-200">No active orders right now</p>
                <p className="text-xs text-slate-500 max-w-sm">
                  New orders scanned via QR code or submitted online for {shopName} will show up here automatically.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const isWaiting = order.queue_state === "WAITING" || order.queue_state === "PENDING" || order.queue_state === "ACCEPTED";
                const isPrinting = order.queue_state === "PRINTING";
                const isReady = order.queue_state === "READY_FOR_PICKUP" || order.queue_state === "READY";

                return (
                  <motion.div
                    key={order.order_id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isPrinting
                        ? "bg-cyan-950/30 border-cyan-500/40 shadow-lg shadow-cyan-500/5"
                        : isReady
                        ? "bg-emerald-950/20 border-emerald-500/30"
                        : "bg-slate-950/60 border-white/10 hover:border-white/20"
                    }`}
                  >
                    {/* Token & Order Details */}
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 min-w-[72px]">
                        <span className="text-[10px] font-extrabold uppercase text-cyan-400 tracking-wider">Token</span>
                        <span className="text-xl font-black text-white">{order.token}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-white text-base">
                            {order.student_name || "Express Customer"}
                          </span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
                            {order.register_number || "Guest"}
                          </span>
                          {order.is_priority && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                              <Zap className="w-3 h-3" /> Priority
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span>
                            Docs: <strong className="text-white">{order.documents}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Total: <strong className="text-emerald-400">₹{Number(order.subtotal || order.grand_total || 0).toFixed(2)}</strong>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge & Action Controls */}
                    <div className="flex items-center gap-3 justify-end border-t md:border-t-0 pt-3 md:pt-0 border-white/10">
                      {/* Queue Status Pill */}
                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                          isPrinting
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse"
                            : isReady
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        }`}
                      >
                        {isPrinting ? (
                          <>
                            <Printer className="w-3.5 h-3.5 animate-bounce" /> Printing In Progress
                          </>
                        ) : isReady ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Pickup
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" /> Waiting
                          </>
                        )}
                      </span>

                      {/* Inspect Order Details */}
                      <button
                        onClick={() => setInspectOrderId(order.order_id)}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                        title="Inspect Order Files & Specs"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Actions based on state */}
                      {isWaiting && (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleServeOrder(order.order_id)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Print & Serve</span>
                        </button>
                      )}

                      {isPrinting && (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleMarkReady(order.order_id)}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mark Ready</span>
                        </button>
                      )}

                      {isReady && (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleServeOrder(order.order_id)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Handed Over (Serve)</span>
                        </button>
                      )}

                      {/* Reject button */}
                      <button
                        disabled={actionLoading}
                        onClick={() => handleRejectOrder(order.order_id)}
                        className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                        title="Reject Order"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Daily Revenue & UPI Settlement Ledger Section */}
        <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" /> {shopName} Daily Revenue & Settlement Ledger
              </h3>
              <p className="text-xs text-slate-400">
                Daily earnings from counter QR orders and online customer jobs for {shopName}.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Net Today Revenue</span>
              <div className="text-lg font-black text-emerald-400">₹{Number(revenue.total_revenue || 0).toFixed(2)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-1">
              <span className="text-xs text-slate-400 font-semibold">Total Revenue Generated</span>
              <div className="text-xl font-bold text-white">₹{Number(revenue.total_revenue || 0).toFixed(2)}</div>
            </div>
            <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-1">
              <span className="text-xs text-slate-400 font-semibold">Disbursed Settlements</span>
              <div className="text-xl font-bold text-emerald-400">₹{Number(totalSettlementSettled || 0).toFixed(2)}</div>
            </div>
            <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-1">
              <span className="text-xs text-slate-400 font-semibold">Pending Processing</span>
              <div className="text-xl font-bold text-amber-400">₹{Number(totalSettlementPending || 0).toFixed(2)}</div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals & Popups */}
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
