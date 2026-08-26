"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import DashboardHeader from "./DashboardHeader";
import SatelliteSummaryCards from "./SatelliteSummaryCards";
import NextOrderCard from "./NextOrderCard";
import QueueOverview from "./QueueOverview";
import RecentOrders from "./RecentOrders";
import NotificationPanel from "./NotificationPanel";
import OrderDetailsModal from "./OrderDetailsModal";
import EmptyState from "./EmptyState";
import SkeletonLoader from "./SkeletonLoader";
import PrintAgentStatusCard from "./PrintAgentStatusCard";
import Popup from "@/components/popup/Popup";

import {
  fetchTodaysOrders,
  fetchLiveQueueSummary,
  printShopOrder,
  markOrderReady,
  serveShopOrder,
  rejectShopOrder,
} from "@/services/shop";

import type { TodayOrderItem, LiveQueueSummary } from "@/types/shop";
import { Building2, MapPin, CheckCircle2, AlertTriangle, Sparkles, PlusCircle } from "lucide-react";
import Link from "next/link";

const SATELLITE_HUB = "QLex Satellite Print Hub";

export default function SatelliteShopDashboard() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [inspectOrderId, setInspectOrderId] = useState<string | null>(null);

  // Backend state for Satellite Hub
  const [todaysOrders, setTodaysOrders] = useState<TodayOrderItem[]>([]);
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
      const [ordersRes, queueRes] = await Promise.all([
        fetchTodaysOrders(SATELLITE_HUB).catch(() => []),
        fetchLiveQueueSummary().catch(() => ({
          currently_printing: null,
          priority_queue: [],
          regular_queue: [],
        })),
      ]);

      setTodaysOrders(ordersRes);
      setLiveQueue(queueRes);
    } catch (err) {
      console.error("Satellite Dashboard error loading data:", err);
      if (isInitial) {
        setPopupState({
          open: true,
          variant: "error",
          title: "Unable to load Satellite Dashboard",
          description: "Could not connect to the backend server. Please verify network status.",
        });
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData(true);
    const interval = setInterval(() => {
      loadDashboardData(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // Determine HERO Order for Satellite Hub
  const activeQueueOrders = todaysOrders.filter(
    (o) => o.queue_state !== "SERVED" && o.queue_state !== "REJECTED"
  );

  let heroOrder = activeQueueOrders.find(
    (o) => o.queue_state === "PRINTING" || o.queue_state === "READY" || o.queue_state === "READY_FOR_PICKUP"
  );

  if (!heroOrder) {
    heroOrder = activeQueueOrders.find((o) => o.is_current && o.queue_state === "WAITING");
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
        title: "Print Job Triggered",
        description: "Satellite order status updated to PRINTING. Job sent to terminal printer.",
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
        description: "Order marked as Ready for Pickup. Staff/Faculty notified.",
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
        description: "Satellite print job completed. Next queue sequence unlocked.",
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
        title: "Order Cancelled",
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
    <div className="min-h-screen bg-[#030406] text-white font-sans selection:bg-emerald-500/30">
      {/* Header Navigation */}
      <DashboardHeader
        unreadNotificationCount={todaysOrders.length}
        onToggleNotifications={() => setShowNotifications(true)}
        hubTitle="Satellite Hub Terminal"
        isSatellite={true}
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
            {/* Terminal Header Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-emerald-950/50 via-slate-900/80 to-emerald-950/50 border border-emerald-500/25 backdrop-blur-xl shadow-2xl shadow-emerald-950/30">
              <div className="flex items-center gap-3.5">
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-inner">
                  <Building2 className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Terminal Location</span>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Room A103 • AI & Data Science
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-0.5">QLex Satellite Print Hub</h2>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>First Floor, A Block — Sequential S-Token Terminal (Zero-Cost Staff Allowance)</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <Link
                  href="/staff/new-order"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition duration-200 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>+ Create Staff Order</span>
                </Link>
              </div>
            </div>

            {/* Quick Action Navigation Cards */}
            <QuickActions isSatellite={true} />

            {/* Satellite Stat Cards */}
            <SatelliteSummaryCards todaysOrders={todaysOrders} />

            {/* HERO SECTION: Next Active S-Token Order To Process */}
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

            {/* Hardware Status & Telemetry */}
            <PrintAgentStatusCard />
          </motion.div>
        )}
      </main>

      {/* Notification Drawer */}
      <NotificationPanel
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
        todaysOrders={todaysOrders}
        pendingSettlements={[]}
      />

      {/* Order Specifications Inspection Modal */}
      <OrderDetailsModal
        orderId={inspectOrderId}
        onClose={() => setInspectOrderId(null)}
      />

      {/* Reusable QLex Popup Modal */}
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
