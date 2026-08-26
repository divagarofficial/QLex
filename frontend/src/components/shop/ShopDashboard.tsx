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
import Popup from "@/components/popup/Popup";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { Building2, Printer } from "lucide-react";

interface ShopDashboardProps {
  defaultHub?: "QLex Central Print Hub" | "QLex Satellite Print Hub";
}

export default function ShopDashboard({ defaultHub = "QLex Central Print Hub" }: ShopDashboardProps) {
  const router = useRouter();
  const [activeHub, setActiveHub] = useState<"QLex Central Print Hub" | "QLex Satellite Print Hub">(defaultHub);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [inspectOrderId, setInspectOrderId] = useState<string | null>(null);

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
      const [ordersRes, revRes, pendRes, histRes, queueRes] = await Promise.all([
        fetchTodaysOrders(activeHub).catch(() => []),
        fetchTodayRevenue(activeHub).catch(() => ({ total_orders: 0, total_revenue: 0 })),
        fetchPendingSettlements().catch(() => []),
        fetchSettlementHistory().catch(() => []),
        fetchLiveQueueSummary().catch(() => ({
          currently_printing: null,
          priority_queue: [],
          regular_queue: [],
        })),
      ]);

      setTodaysOrders(ordersRes);
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
  // 2. Current active WAITING order (is_current == true)
  const activeQueueOrders = todaysOrders.filter(
    (o) => o.queue_state !== "SERVED" && o.queue_state !== "REJECTED"
  );

  let heroOrder = activeQueueOrders.find(
    (o) => o.queue_state === "PRINTING" || o.queue_state === "READY" || o.queue_state === "READY_FOR_PICKUP"
  );

  if (!heroOrder) {
    heroOrder = activeQueueOrders.find((o) => o.is_current && o.queue_state === "WAITING");
  }

  if (!heroOrder) {
    heroOrder = activeQueueOrders.find((o) => o.is_priority && o.queue_state === "WAITING");
  }

  if (!heroOrder) {
    heroOrder = activeQueueOrders.find((o) => !o.is_priority && o.queue_state === "WAITING");
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
            {/* Print Hub Selector Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-white/[0.04] border border-white/10 backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${activeHub === "QLex Satellite Print Hub" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/15 text-amber-400 border border-amber-500/30"}`}>
                  {activeHub === "QLex Satellite Print Hub" ? <Building2 className="h-6 w-6" /> : <Printer className="h-6 w-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-white/50">Shop Terminal</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${activeHub === "QLex Satellite Print Hub" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"}`}>
                      {activeHub === "QLex Satellite Print Hub" ? "Faculty & Staff Hub" : "Student Central Hub"}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-white mt-0.5">{activeHub}</h2>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-2xl border border-white/10 w-full sm:w-auto">
                <button
                  onClick={() => setActiveHub("QLex Central Print Hub")}
                  className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    activeHub === "QLex Central Print Hub"
                      ? "bg-gradient-to-r from-amber-400 to-amber-600 text-obsidian shadow-lg shadow-amber-500/20 scale-[1.02]"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>🏢 Central Print Hub</span>
                </button>

                <button
                  onClick={() => router.push("/shop/satellite")}
                  className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    activeHub === "QLex Satellite Print Hub"
                      ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-obsidian shadow-lg shadow-emerald-500/20 scale-[1.02]"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>🛰️ Satellite Print Hub</span>
                </button>
              </div>
            </div>

            {/* Welcome Card */}
            <WelcomeCard />

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
            <PrintAgentStatusCard />
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
    </div>
  );
}
