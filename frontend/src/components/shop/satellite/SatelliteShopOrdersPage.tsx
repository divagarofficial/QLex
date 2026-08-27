"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Printer,
  Search,
  Filter,
  RefreshCw,
  FileText,
  Download,
  Eye,
  AlertTriangle,
  MapPin,
  User,
  ShieldCheck,
} from "lucide-react";

import DashboardHeader from "@/components/shop/DashboardHeader";
import NotificationPanel from "@/components/shop/NotificationPanel";
import OrderDetailsModal from "@/components/shop/OrderDetailsModal";
import SkeletonLoader from "@/components/shop/SkeletonLoader";
import Popup from "@/components/popup/Popup";

import {
  fetchTodaysOrders,
  fetchActiveShopOrders,
  printShopOrder,
  markOrderReady,
  serveShopOrder,
  rejectShopOrder,
} from "@/services/shop";

import type { TodayOrderItem, ActiveShopOrder, EnrichedShopOrder } from "@/types/shop";
import { getFileUrl } from "@/utils/fileUrl";

const SATELLITE_HUB = "QLex Satellite Print Hub";

export default function SatelliteShopOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [inspectOrderId, setInspectOrderId] = useState<string | null>(null);

  // Orders State
  const [todaysOrders, setTodaysOrders] = useState<TodayOrderItem[]>([]);
  const [enrichedOrders, setEnrichedOrders] = useState<EnrichedShopOrder[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Popup Modal
  const [popupState, setPopupState] = useState<{
    open: boolean;
    variant: "error" | "success" | "warning";
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
      const [todayRes, activeRes] = await Promise.all([
        fetchTodaysOrders(SATELLITE_HUB).catch(() => []),
        fetchActiveShopOrders(SATELLITE_HUB).catch(() => []),
      ]);

      setTodaysOrders(todayRes);

      // Merge backend active orders with today response
      const queueMap = new Map<string, TodayOrderItem>();
      todayRes.forEach((q) => queueMap.set(q.order_id, q));

      const merged: EnrichedShopOrder[] = [];

      todayRes.forEach((q) => {
        merged.push({
          order_id: q.order_id,
          student_id: q.student_id,
          student_name: q.student_name,
          register_number: q.register_number,
          created_at: q.created_at || new Date().toISOString(),
          grand_total: q.grand_total || 0,
          is_priority: q.is_priority,
          payment_status: q.payment_status || "PAID",
          queue_state: q.queue_state,
          token: q.token,
          is_current: q.is_current,
          estimated_wait_minutes: q.estimated_wait_minutes,
          estimated_completion_time: q.estimated_completion_time,
          assigned_printer: q.assigned_printer,
          document_count: q.document_count || 1,
          total_pages: q.total_pages || 1,
          total_copies: 1,
          color_mode: q.color_mode,
          duplex_mode: q.duplex_mode,
          paper_size: q.paper_size,
          documents: [],
        });
      });

      // Add active orders if not in merged list
      activeRes.forEach((act) => {
        if (!merged.some((m) => m.order_id === act.id)) {
          merged.push({
            order_id: act.id,
            student_id: act.student_id || "",
            student_name: act.student_name,
            register_number: act.register_number,
            created_at: act.created_at || new Date().toISOString(),
            grand_total: act.grand_total || 0,
            is_priority: act.is_priority || false,
            payment_status: act.payment_status || "PAID",
            queue_state: (act.queue_state as any) || "WAITING",
            token: act.token || "",
            is_current: false,
            estimated_wait_minutes: act.estimated_wait_minutes || 0,
            estimated_completion_time: act.estimated_completion_time,
            assigned_printer: act.assigned_printer,
            document_count: act.document_count || 1,
            total_pages: act.total_pages || 1,
            total_copies: 1,
            documents: act.documents || [],
          });
        }
      });

      setEnrichedOrders(merged);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error loading Satellite Orders:", err);
      setPopupState({
        open: true,
        variant: "error",
        title: "Connection Error",
        description: "Failed to sync with QLex Satellite Hub server.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);
    const interval = setInterval(() => loadData(true), 12000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Order Handlers
  const handlePrint = async (orderId: string) => {
    setActionLoading(true);
    try {
      await printShopOrder(orderId);
      setPopupState({
        open: true,
        variant: "success",
        title: "Print Job Started",
        description: "Document sent to Satellite terminal printer.",
      });
      await loadData(true);
    } catch (err: any) {
      setPopupState({
        open: true,
        variant: "error",
        title: "Print Action Failed",
        description: err.message || "Failed to trigger print job.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReady = async (orderId: string) => {
    setActionLoading(true);
    try {
      await markOrderReady(orderId);
      setPopupState({
        open: true,
        variant: "success",
        title: "Ready for Pickup",
        description: "Staff notification dispatched for collection.",
      });
      await loadData(true);
    } catch (err: any) {
      setPopupState({
        open: true,
        variant: "error",
        title: "Action Failed",
        description: err.message || "Failed to mark order ready.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleServe = async (orderId: string) => {
    setActionLoading(true);
    try {
      await serveShopOrder(orderId);
      setPopupState({
        open: true,
        variant: "success",
        title: "Order Completed",
        description: "Satellite print order marked served.",
      });
      await loadData(true);
    } catch (err: any) {
      setPopupState({
        open: true,
        variant: "error",
        title: "Action Failed",
        description: err.message || "Failed to mark order served.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (orderId: string) => {
    setActionLoading(true);
    try {
      await rejectShopOrder(orderId);
      setPopupState({
        open: true,
        variant: "warning",
        title: "Order Cancelled",
        description: "Satellite order cancelled.",
      });
      await loadData(true);
    } catch (err: any) {
      setPopupState({
        open: true,
        variant: "error",
        title: "Action Failed",
        description: err.message || "Failed to cancel order.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered List
  const filteredOrders = useMemo(() => {
    return enrichedOrders.filter((order) => {
      if (!order.token?.startsWith("S-") && !(order as any).shop_name?.includes("Satellite")) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const shortId = order.order_id.toLowerCase();
        const token = order.token.toLowerCase();
        const name = (order.student_name || "").toLowerCase();
        const reg = (order.register_number || "").toLowerCase();
        if (!shortId.includes(q) && !token.includes(q) && !name.includes(q) && !reg.includes(q)) {
          return false;
        }
      }

      if (statusFilter !== "ALL") {
        const s = (order.queue_state || "").toUpperCase();
        if (statusFilter === "WAITING" && s !== "WAITING" && s !== "PENDING") return false;
        if (statusFilter === "PRINTING" && s !== "PRINTING") return false;
        if (statusFilter === "READY" && s !== "READY" && s !== "READY_FOR_PICKUP") return false;
        if (statusFilter === "SERVED" && s !== "SERVED" && s !== "COMPLETED") return false;
      }

      return true;
    });
  }, [enrichedOrders, searchQuery, statusFilter]);

  return (
    <div className="min-h-screen bg-[#030406] text-white font-sans selection:bg-emerald-500/30">
      <DashboardHeader
        unreadNotificationCount={todaysOrders.length}
        onToggleNotifications={() => setShowNotifications(true)}
        hubTitle="QLex Satellite Print Hub"
        isSatellite={true}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-8 space-y-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-emerald-950/60 border border-emerald-500/25 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Hub Address</span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  A103, Department of Artificial Intelligence and Data Science, First Floor, A Block
                </span>
              </div>
              <h1 className="text-2xl font-black text-white mt-0.5">QLex Satellite Print Hub Orders</h1>
            </div>
          </div>

          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all cursor-pointer text-emerald-300"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-emerald-400" : ""}`} />
            <span>Sync Live Orders</span>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-emerald-400/60" />
            <input
              type="text"
              placeholder="Search Staff, ID, or S-Token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "WAITING", "PRINTING", "READY", "SERVED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 shadow-md"
                    : "bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <SkeletonLoader />
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-white/10 bg-white/5 space-y-3">
            <ShoppingBag className="h-10 w-10 text-emerald-500/40 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Satellite Orders Found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              There are currently no staff print orders matching your selected criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, idx) => {
              const tokenStr = order.token || `S-${order.order_id.slice(0, 3).toUpperCase()}`;
              const isPrinting = order.queue_state === "PRINTING";
              const isReady = order.queue_state === "READY" || order.queue_state === "READY_FOR_PICKUP";

              return (
                <motion.div
                  key={order.order_id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-emerald-950/30 p-6 shadow-xl backdrop-blur-xl space-y-4 hover:border-emerald-500/40 transition-all"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 shadow-inner">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-400">SAT</span>
                        <span className="text-xl font-black leading-none">{tokenStr}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white">{order.student_name}</h3>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-extrabold text-emerald-300 uppercase">
                            Staff
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
                          <span>{order.register_number || "Staff ID: STF-A103"}</span>
                          <span>•</span>
                          <span>Zero-Cost Complimentary</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        isPrinting
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30 animate-pulse"
                          : isReady
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      }`}>
                        {order.queue_state || "WAITING"}
                      </span>

                      <button
                        onClick={() => setInspectOrderId(order.order_id)}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                        title="Inspect Specifications"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Specs Pill Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-2xl bg-black/40 border border-white/5 text-xs text-zinc-300">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block">Documents</span>
                      <span className="font-bold text-white">{order.document_count || 1} File(s)</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block">Total Pages</span>
                      <span className="font-bold text-white">{order.total_pages || 1} Pages</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block">Color & Layout</span>
                      <span className="font-bold text-emerald-300">{order.color_mode || "B&W"} • {order.duplex_mode || "Single"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block">Terminal Printer</span>
                      <span className="font-bold text-white">{order.assigned_printer || "Satellite HP DeskJet"}</span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => handleReject(order.order_id)}
                      disabled={actionLoading}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer"
                    >
                      Cancel Order
                    </button>

                    {!isPrinting && !isReady && (
                      <button
                        onClick={() => handlePrint(order.order_id)}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Printer className="h-4 w-4" />
                        <span>Print Satellite Job</span>
                      </button>
                    )}

                    {isPrinting && (
                      <button
                        onClick={() => handleReady(order.order_id)}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-cyan-400 to-blue-400 hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Mark Ready for Pickup</span>
                      </button>
                    )}

                    {isReady && (
                      <button
                        onClick={() => handleServe(order.order_id)}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Mark Served</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
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
