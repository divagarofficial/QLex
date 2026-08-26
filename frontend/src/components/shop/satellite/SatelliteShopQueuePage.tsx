"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  Clock,
  Printer,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  MapPin,
} from "lucide-react";

import DashboardHeader from "@/components/shop/DashboardHeader";
import NotificationPanel from "@/components/shop/NotificationPanel";
import SatelliteQueueList from "@/components/shop/SatelliteQueueList";
import OrderDetailsModal from "@/components/shop/OrderDetailsModal";
import SkeletonLoader from "@/components/shop/SkeletonLoader";
import Popup from "@/components/popup/Popup";

import {
  fetchTodaysOrders,
  printShopOrder,
  markOrderReady,
  serveShopOrder,
  rejectShopOrder,
} from "@/services/shop";

import type { TodayOrderItem } from "@/types/shop";

const SATELLITE_HUB = "QLex Satellite Print Hub";

export default function SatelliteShopQueuePage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [inspectOrderId, setInspectOrderId] = useState<string | null>(null);

  const [todaysOrders, setTodaysOrders] = useState<TodayOrderItem[]>([]);

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

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const ordersRes = await fetchTodaysOrders(SATELLITE_HUB).catch(() => []);
      setTodaysOrders(ordersRes);
    } catch (err) {
      console.error("Satellite Queue load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);
    const interval = setInterval(() => loadData(true), 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handlePrint = async (orderId: string) => {
    setActionLoading(true);
    try {
      await printShopOrder(orderId);
      await loadData(true);
    } catch (err: any) {
      setPopupState({
        open: true,
        variant: "error",
        title: "Print Failed",
        description: err.message || "Failed to print job.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReady = async (orderId: string) => {
    setActionLoading(true);
    try {
      await markOrderReady(orderId);
      await loadData(true);
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

  const handleServe = async (orderId: string) => {
    setActionLoading(true);
    try {
      await serveShopOrder(orderId);
      await loadData(true);
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

  const handleReject = async (orderId: string) => {
    setActionLoading(true);
    try {
      await rejectShopOrder(orderId);
      await loadData(true);
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

  return (
    <div className="min-h-screen bg-[#030406] text-white font-sans selection:bg-emerald-500/30">
      <DashboardHeader
        unreadNotificationCount={todaysOrders.length}
        onToggleNotifications={() => setShowNotifications(true)}
        hubTitle="Satellite Hub Terminal"
        isSatellite={true}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-emerald-950/60 border border-emerald-500/25 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Satellite Queue Workbench</span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Sequential S-Token Dispatch
                </span>
              </div>
              <h1 className="text-2xl font-black text-white mt-0.5">Satellite Live S-Queue</h1>
            </div>
          </div>

          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all cursor-pointer text-emerald-300"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-emerald-400" : ""}`} />
            <span>Sync Live Queue</span>
          </button>
        </div>

        {/* Live Queue Container */}
        {loading ? (
          <SkeletonLoader />
        ) : (
          <SatelliteQueueList
            todaysOrders={todaysOrders}
            onPrint={handlePrint}
            onReady={handleReady}
            onServe={handleServe}
            onReject={handleReject}
            onInspect={(id) => setInspectOrderId(id)}
            actionLoading={actionLoading}
          />
        )}
      </main>

      <NotificationPanel
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
        todaysOrders={todaysOrders}
        pendingSettlements={[]}
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
        showCloseButton={true}
      />
    </div>
  );
}
