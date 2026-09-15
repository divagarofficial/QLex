"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import DashboardHeader from "./DashboardHeader";
import WelcomeCard from "./WelcomeCard";
import SummaryCards from "./SummaryCards";
import NextOrderCard from "./NextOrderCard";
import QueueOverview from "./QueueOverview";
import RecentOrders from "./RecentOrders";
import SettlementCard from "./SettlementCard";
import QuickActions from "./QuickActions";
import NotificationPanel from "./NotificationPanel";
import OrderDetailsModal from "./OrderDetailsModal";
import EmptyState from "./EmptyState";
import SkeletonLoader from "./SkeletonLoader";

import {
  fetchTodaysOrders,
  fetchActiveShopOrders,
  fetchTodayRevenue,
  fetchPendingSettlements,
  fetchSettlementHistory,
  fetchLiveQueueSummary,
  printShopOrder,
  markOrderReady,
  serveShopOrder,
  rejectShopOrder,
} from "@/services/shop";

import type {
  TodayOrderItem,
  TodayRevenue,
  SettlementItem,
  LiveQueueSummary,
} from "@/types/shop";

import PrintAgentStatusCard from "./PrintAgentStatusCard";
import CounterQRCodeModal from "./CounterQRCodeModal";
import SupportCard from "@/components/common/SupportCard";
import Popup from "@/components/popup/Popup";
import { AlertTriangle, CheckCircle2, QrCode } from "lucide-react";

import { Building2, Printer } from "lucide-react";

interface ShopDashboardProps {
  defaultHub?: "QLex Central Print Hub" | "QLex Satellite Print Hub";
  targetShopSlug?: string;
  targetShopName?: string;
}

export default function ShopDashboard({
  defaultHub = "QLex Central Print Hub",
  targetShopSlug,
  targetShopName,
}: ShopDashboardProps) {
  const router = useRouter();
  const initialHubName = targetShopName || (targetShopSlug ? targetShopSlug.replace(/-/g, " ").toUpperCase() : defaultHub);
  const [activeHub, setActiveHub] = useState<string>(initialHubName);


  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [inspectOrderId, setInspectOrderId] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  // Backend state
  const [todaysOrders, setTodaysOrders] = useState<TodayOrderItem[]>([]);
  const [revenue, setRevenue] = useState<TodayRevenue>({ total_orders: 0, total_revenue: 0 });
  const [pendingSettlements, setPendingSettlements] = useState<SettlementItem[]>([]);
  const [historySettlements, setHistorySettlements] = useState<SettlementItem[]>([]);
  const [liveQueue, setLiveQueue] = useState<LiveQueueSummary>({
    currently_printing: null,
    priority_queue: [],
    regular_queue: [],
  });

  // Reusable Popup State
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

  const loadDashboardData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const [ordersRes, activeRes, revRes, pendRes, histRes, queueRes] = await Promise.all([
        fetchTodaysOrders(activeHub).catch(() => []),
        fetchActiveShopOrders(activeHub).catch(() => []),
        fetchTodayRevenue(activeHub).catch(() => ({ total_orders: 0, total_revenue: 0 })),
        fetchPendingSettlements().catch(() => []),
        fetchSettlementHistory().catch(() => []),
        fetchLiveQueueSummary().catch(() => ({
          currently_printing: null,
          priority_queue: [],
          regular_queue: [],
        })),
      ]);

      // Combine ordersRes and activeRes ensuring no duplicates
      const orderMap = new Map<string, TodayOrderItem>();
      ordersRes.forEach((o) => orderMap.set(o.order_id, o));
      activeRes.forEach((a) => {
        if (!orderMap.has(a.id)) {
          orderMap.set(a.id, {
            token: a.token || `R-1`,
            order_id: a.id,
            student_id: a.student_id || "STUDENT",
            student_name: a.student_name || "Student",
            register_number: a.register_number,
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

      setTodaysOrders(Array.from(orderMap.values()));
      setRevenue(revRes);
      setPendingSettlements(pendRes);
      setHistorySettlements(histRes);
      setLiveQueue(queueRes);
    } catch (err) {
      console.error("Dashboard error loading data:", err);
      if (isInitial) {
        setPopupState({
          open: true,
          variant: "error",
          title: "Unable to load Dashboard",
          description: "Could not connect to the backend server. Please verify network status.",
        });
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [activeHub]);

  // Initial fetch and 10-second polling interval
  useEffect(() => {
    loadDashboardData(true);
    const interval = setInterval(() => {
      loadDashboardData(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // Determine HERO Order to Process:
  // 1. Any order currently PRINTING or READY (stay on Hero card until served)
  // 2. Current active WAITING / ACCEPTED order (is_current == true)
  const activeQueueOrders = todaysOrders.filter(
    (o) => {
      const qs = (o.queue_state || "").toUpperCase();
      return qs !== "SERVED" && qs !== "COMPLETED" && qs !== "REJECTED" && qs !== "EXPIRED" && qs !== "CANCELLED" && !o.token?.startsWith("S-");
    }
  );

  let heroOrder = activeQueueOrders.find((o) => {
    const qs = (o.queue_state || "").toUpperCase();
    return qs === "PRINTING" || qs === "READY" || qs === "READY_FOR_PICKUP";
  });

  if (!heroOrder) {
    heroOrder = activeQueueOrders.find((o) => o.is_current && ["WAITING", "ACCEPTED", "PAID"].includes((o.queue_state || "").toUpperCase()));
  }

  if (!heroOrder) {
    heroOrder = activeQueueOrders.find((o) => o.is_priority && ["WAITING", "ACCEPTED", "PAID"].includes((o.queue_state || "").toUpperCase()));
  }

  if (!heroOrder) {
    heroOrder = activeQueueOrders.find((o) => !o.is_priority && ["WAITING", "ACCEPTED", "PAID"].includes((o.queue_state || "").toUpperCase()));
  }

  if (!heroOrder && activeQueueOrders.length > 0) {
    heroOrder = activeQueueOrders[0];
  }

  // Order Actions
  const handlePrintOrder = async (orderId: string) => {
    setActionLoading(true);
    try {
      await printShopOrder(orderId);
      setPopupState({
        open: true,
        variant: "success",
        title: "Print Job Started",
        description: "Order status updated to PRINTING. Document sent to printer.",
      });
      await loadDashboardData(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to trigger print job.";
      setPopupState({
        open: true,
        variant: "error",
        title: "Print Action Failed",
        description: msg,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReadyOrder = async (orderId: string) => {
    setActionLoading(true);
    try {
      await markOrderReady(orderId);
      setPopupState({
        open: true,
        variant: "success",
        title: "Ready for Pickup",
        description: "Order marked as Ready for Pickup. Student notified.",
      });
      await loadDashboardData(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to mark order as ready.";
      setPopupState({
        open: true,
        variant: "error",
        title: "Action Failed",
        description: msg,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleServeOrder = async (orderId: string) => {
    setActionLoading(true);
    try {
      await serveShopOrder(orderId);
      setPopupState({
        open: true,
        variant: "success",
        title: "Order Marked as Served",
        description: "Customer print job completed. Next queue order unlocked.",
      });
      await loadDashboardData(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to mark order as served.";
      setPopupState({
        open: true,
        variant: "error",
        title: "Action Error",
        description: msg,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    setActionLoading(true);
    try {
      await rejectShopOrder(orderId);
      setPopupState({
        open: true,
        variant: "success",
        title: "Order Rejected",
        description: "Order has been cancelled and queue sequence advanced.",
      });
      await loadDashboardData(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reject order.";
      setPopupState({
        open: true,
        variant: "error",
        title: "Action Error",
        description: msg,
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500/30">
      {/* Header Navigation */}
      <DashboardHeader
        unreadNotificationCount={todaysOrders.length}
        onToggleNotifications={() => setShowNotifications(true)}
      />

      {/* Main Operations Dashboard Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-8 space-y-6">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Welcome Card */}
            <WelcomeCard />

            {/* Counter QR Standee Promo Banner */}
            <div className="deep-glass rounded-2xl p-4 border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-transparent to-champagne-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Express Counter Standee QR</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ⚡ No-Login Ordering
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Display your counter QR code so walk-in customers can order without account login (/acme).
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowQRModal(true)}
                className="px-4 py-2 rounded-xl bg-champagne-500 hover:bg-champagne-400 text-obsidian text-xs font-bold shadow-md shadow-champagne-500/20 transition-all flex items-center gap-1.5 flex-shrink-0"
              >
                <QrCode className="w-4 h-4" /> Print Standee QR
              </button>
            </div>

            {/* Today's Summary Stat Cards */}
            <SummaryCards
              todaysOrders={todaysOrders}
              revenue={revenue}
              pendingSettlements={pendingSettlements}
            />

            {/* HERO SECTION: Next Order To Process or Empty State */}
            {heroOrder ? (
              <NextOrderCard
                orderItem={heroOrder}
                onPrint={handlePrintOrder}
                onReady={handleReadyOrder}
                onServe={handleServeOrder}
                onReject={handleRejectOrder}
                onInspect={(id) => setInspectOrderId(id)}
                actionLoading={actionLoading}
              />
            ) : (
              <EmptyState />
            )}

            {/* Queue Overview */}
            <QueueOverview todaysOrders={todaysOrders} liveQueue={liveQueue} />

            {/* Recent Orders List */}
            <RecentOrders
              todaysOrders={todaysOrders}
              onInspect={(id) => setInspectOrderId(id)}
            />

            {/* Settlement Preview */}
            <SettlementCard
              revenue={revenue}
              pendingSettlements={pendingSettlements}
              historySettlements={historySettlements}
            />

            {/* Quick Action Navigation Cards */}
            <QuickActions />

            {/* Auto-Print Agent Live Status & Control */}
            <PrintAgentStatusCard shopName="QLex Central Print Hub" />

            {/* Support & Assistance */}
            <SupportCard />
          </motion.div>
        )}
      </main>

      {/* Notification Drawer */}
      <NotificationPanel
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
        todaysOrders={todaysOrders}
        pendingSettlements={pendingSettlements}
      />

      {/* Order Specifications Modal */}
      <OrderDetailsModal
        orderId={inspectOrderId}
        onClose={() => setInspectOrderId(null)}
      />

      {/* Reusable QLex Popup Modal for Alerts & Errors */}
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
            <AlertTriangle className="h-6 w-6 text-red-400" />
          )
        }
        showCloseButton={true}
      />

      {/* Counter Standee QR Modal */}
      <CounterQRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        shopName="Acme Print Hub"
        shopSlug="acme"
      />
    </div>
  );
}
