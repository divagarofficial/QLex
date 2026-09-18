"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import NonCollegeShopHeader from "./NonCollegeShopHeader";
import CounterQRCodeModal from "./CounterQRCodeModal";
import OrderDetailsModal from "./OrderDetailsModal";
import Popup from "@/components/popup/Popup";

import {
  fetchTodaysOrders,
  fetchActiveShopOrders,
  fetchTodayRevenue,
  fetchPrintAgentHealth,
  markOrderReady,
  serveShopOrder,
  markOrderServed,
  rejectShopOrder,
} from "@/services/shop";

import { fetchPublicShopBySlug, type PublicShop } from "@/services/expressOrders";
import type { TodayOrderItem, TodayRevenue, PrintAgentHealth } from "@/types/shop";

import {
  PackageSearch,
  Search,
  RefreshCw,
  Printer,
  CheckCircle2,
  Clock,
  Zap,
  Eye,
  XCircle,
  Filter,
  AlertCircle,
  WifiOff,
} from "lucide-react";

function formatOrderTime(dateInput?: string): string {
  if (!dateInput) return "Recently";
  const str = String(dateInput).trim().replace(" ", "T");
  const d = new Date(str);
  if (isNaN(d.getTime())) return "Recently";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

interface NonCollegeShopOrdersPageProps {
  shopSlug?: string;
}

export default function NonCollegeShopOrdersPage({
  shopSlug: inputSlug = "acme-offset-and-printers",
}: NonCollegeShopOrdersPageProps) {
  const router = useRouter();
  const shopSlug = (inputSlug || "acme-offset-and-printers").toLowerCase();

  // Require 4-digit PIN authentication for THIS SPECIFIC SHOP
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("qlex_shop_token") : null;
    const slug = typeof window !== "undefined" ? localStorage.getItem("qlex_shop_slug") : null;
    if (!token || (slug && slug !== shopSlug)) {
      router.replace(`/shop/${encodeURIComponent(shopSlug)}/login`);
    }
  }, [router, shopSlug]);


  const [shopProfile, setShopProfile] = useState<PublicShop | null>(null);

  const [shopName, setShopName] = useState<string>(
    shopSlug.includes("acme") ? "ACME OFFSET AND PRINTERS" : shopSlug.replace(/-/g, " ").toUpperCase()
  );

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [inspectOrderId, setInspectOrderId] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const [orders, setOrders] = useState<TodayOrderItem[]>([]);
  const [revenue, setRevenue] = useState<TodayRevenue>({ total_orders: 0, total_revenue: 0 });
  const [agentHealth, setAgentHealth] = useState<PrintAgentHealth | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

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
        console.log(`[NonCollegeShopOrdersPage] Profile lookup for ${shopSlug}:`, e);
      }
    }
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [shopSlug]);

  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const targetName = shopProfile?.name || shopName;
      const [todaysRes, activeRes, revRes, healthRes] = await Promise.all([
        fetchTodaysOrders(targetName).catch(() => []),
        fetchActiveShopOrders(targetName).catch(() => []),
        fetchTodayRevenue(targetName).catch(() => ({ total_orders: 0, total_revenue: 0 })),
        fetchPrintAgentHealth(targetName).catch(() => null),
      ]);

      const orderMap = new Map<string, TodayOrderItem>();
      todaysRes.forEach((o) => orderMap.set(o.order_id, o));
      activeRes.forEach((a) => {
        const existing = orderMap.get(a.id);
        if (existing) {
          orderMap.set(a.id, {
            ...existing,
            subtotal: existing.subtotal || a.subtotal,
            grand_total: existing.grand_total || a.grand_total,
            document_items: existing.document_items && existing.document_items.length > 0 ? existing.document_items : (a.documents as any),
            assigned_printer: existing.assigned_printer || a.assigned_printer,
          });
        } else {
          orderMap.set(a.id, {
            token: a.token || "E-1",
            order_id: a.id,
            student_id: a.student_id || "",
            student_name: a.student_name || "Express Customer",
            register_number: a.register_number || "📱 Guest",
            assigned_printer: a.assigned_printer,
            documents: a.document_count || (a.documents ? a.documents.length : 1),
            document_items: (a.documents as any) || [],
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

      setOrders(Array.from(orderMap.values()));
      setRevenue(revRes);
      setAgentHealth(healthRes);
    } catch (err) {
      console.error("Orders Page Load Error:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [shopName, shopProfile?.name]);

  useEffect(() => {
    loadData(true);
    const interval = setInterval(() => loadData(false), 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Handlers
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
      await loadData(false);
    } catch (err: any) {
      setPopupState({
        open: true,
        variant: "error",
        title: "Update Failed",
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
        description: "Order completed and handed over.",
      });
      await loadData(false);
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
      await rejectShopOrder(orderId, "Rejected by shop operator");
      setPopupState({
        open: true,
        variant: "success",
        title: "Order Rejected",
        description: "Order rejected and customer notified.",
      });
      await loadData(false);
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

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.student_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.register_number || "").toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (statusFilter === "WAITING") return o.queue_state === "WAITING" || o.queue_state === "PENDING" || o.queue_state === "ACCEPTED";
      if (statusFilter === "PRINTING") return o.queue_state === "PRINTING";
      if (statusFilter === "READY") return o.queue_state === "READY_FOR_PICKUP" || o.queue_state === "READY";
      if (statusFilter === "PRIORITY") return o.is_priority;

      return true;
    });
  }, [orders, searchQuery, statusFilter]);

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col font-sans">
      <NonCollegeShopHeader
        shopName={shopName}
        shopSlug={shopSlug}
        activeTab="orders"
        onRefresh={() => loadData(false)}
        onShowQR={() => setShowQRModal(true)}
        loading={loading}
      />

      <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <PackageSearch className="w-6 h-6 text-cyan-400" /> Orders Workbench — {shopName}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Filter, search, inspect, and process all customer print jobs for {shopName}.
            </p>
          </div>

          {/* Quick Filters & Count */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              Filtered: <strong className="text-cyan-400">{filteredOrders.length}</strong> / {orders.length}
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/10">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by token, customer name, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {["ALL", "WAITING", "PRINTING", "READY", "PRIORITY"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
            <p className="text-sm">Loading orders for {shopName}...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center text-slate-400 border border-dashed border-white/10 rounded-3xl bg-black/20 flex flex-col items-center gap-2">
            <PackageSearch className="w-12 h-12 text-slate-600" />
            <p className="text-base font-bold text-white">No matching orders found</p>
            <p className="text-xs text-slate-500">Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const isWaiting = order.queue_state === "WAITING" || order.queue_state === "PENDING" || order.queue_state === "ACCEPTED";
              const isPrinting = order.queue_state === "PRINTING";
              const isReady = order.queue_state === "READY_FOR_PICKUP" || order.queue_state === "READY";

              // Calculate valid total (subtotal or grand_total or document items total sum)
              const computedDocTotal = order.document_items
                ? order.document_items.reduce((acc, doc) => acc + Number(doc.document_total || 0), 0)
                : 0;
              const orderTotal = Number(order.subtotal || order.grand_total || computedDocTotal || 0);

              return (
                <motion.div
                  key={order.order_id}
                  layout
                  className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col gap-4 ${
                    isPrinting
                      ? "bg-cyan-950/30 border-cyan-500/40 shadow-lg shadow-cyan-950/50"
                      : isReady
                      ? "bg-emerald-950/20 border-emerald-500/30"
                      : "bg-slate-950/60 border-white/10"
                  }`}
                >
                  {/* Top Info Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 min-w-[72px]">
                        <span className="text-[10px] font-extrabold uppercase text-cyan-400 tracking-wider">Token</span>
                        <span className="text-xl font-black text-white">{order.token}</span>
                      </div>

                      <div className="space-y-1.5">
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
                          <span className="flex items-center gap-1">
                            Docs: <strong className="text-white">{order.documents || (order.document_items ? order.document_items.length : 1)}</strong>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            Total: <strong className="text-emerald-400 font-extrabold">₹{orderTotal.toFixed(2)}</strong>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {formatOrderTime(order.created_at)}
                          </span>
                        </div>

                        {/* Assigned Printer Info Badge */}
                        <div className="flex items-center gap-2 pt-1">
                          {order.assigned_printer ? (
                            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                              <Printer className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Printer: <strong>{order.assigned_printer}</strong></span>
                            </span>
                          ) : agentHealth?.is_connected && agentHealth.active_printers.length > 0 ? (
                            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                              <Printer className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Printer: <strong>{typeof agentHealth.active_printers[0] === "string" ? agentHealth.active_printers[0] : (agentHealth.active_printers[0] as any).printer_name || "Connected"}</strong> (Online)</span>
                            </span>
                          ) : agentHealth?.is_connected ? (
                            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                              <Printer className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Printer: <strong>Print Agent Connected</strong></span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-red-950/40 text-red-300 border border-red-500/30 flex items-center gap-1.5">
                              <WifiOff className="w-3.5 h-3.5 text-red-400" />
                              <span>Printer: <strong className="text-red-300">No Printer Connected</strong></span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Status and Actions */}
                    <div className="flex items-center gap-3 justify-end border-t md:border-t-0 pt-3 md:pt-0 border-white/10">
                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                          isPrinting
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse"
                            : isReady
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        }`}
                      >
                        {isPrinting ? "Printing" : isReady ? "Ready for Pickup" : "Waiting"}
                      </span>

                      <button
                        onClick={() => setInspectOrderId(order.order_id)}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                        title="Inspect Specs & Preview Document"
                      >
                        <Eye className="w-4 h-4 text-cyan-400" />
                        <span className="hidden sm:inline">Preview</span>
                      </button>

                      {isWaiting && (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleServeOrder(order.order_id)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg cursor-pointer flex items-center gap-1.5"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print & Serve</span>
                        </button>
                      )}

                      {isPrinting && (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleMarkReady(order.order_id)}
                          className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-extrabold text-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Ready</span>
                        </button>
                      )}

                      {isReady && (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleServeOrder(order.order_id)}
                          className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs border border-white/10 cursor-pointer"
                        >
                          Handed Over
                        </button>
                      )}

                      <button
                        disabled={actionLoading}
                        onClick={() => handleRejectOrder(order.order_id)}
                        className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 cursor-pointer"
                        title="Cancel Order"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Document Preview Cards Section */}
                  {order.document_items && order.document_items.length > 0 && (
                    <div className="mt-1 pt-3 border-t border-white/10 bg-black/30 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Attached Documents ({order.document_items.length})</span>
                        <span className="text-cyan-400 font-mono text-xs">Print Specifications Ready</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {order.document_items.map((doc, idx) => (
                          <div
                            key={doc.id || idx}
                            className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex flex-col justify-between gap-1.5 hover:border-cyan-500/40 transition-all"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-white truncate flex items-center gap-1.5" title={doc.original_filename}>
                                <span className="text-cyan-400">📄</span> {doc.original_filename}
                              </span>
                              <button
                                onClick={() => setInspectOrderId(order.order_id)}
                                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5 cursor-pointer font-bold shrink-0"
                              >
                                Preview
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                              <span className="bg-white/10 text-slate-200 px-2 py-0.5 rounded-md font-mono">
                                {doc.page_count} pgs • {doc.copies} copy
                              </span>
                              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-md font-semibold">
                                {doc.print_type === "COLOR" ? "Color" : "B&W"}
                              </span>
                              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-md font-semibold">
                                {doc.paper_size || "A4"}
                              </span>
                              <span className="bg-slate-800 text-slate-300 border border-white/10 px-2 py-0.5 rounded-md font-semibold">
                                {doc.print_side === "DOUBLE" ? "Double-Sided" : "Single-Sided"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
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
