"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Store, Building2, AlertCircle, XCircle, CheckCircle2 } from "lucide-react";
import type {
  TodayOrderItem,
  ActiveShopOrder,
  EnrichedShopOrder,
  TodayRevenue,
  DetailedOrderDocument,
} from "@/types/shop";
import { getFileUrl } from "@/utils/fileUrl";
import { getPrintablePageCount } from "@/components/orders/PrintOptions";
import {
  fetchTodaysOrders,
  fetchActiveShopOrders,
  fetchTodayRevenue,
  fetchOrderDetails,
  fetchOrderSummary,
  printShopOrder,
  markOrderReady,
  serveShopOrder,
  rejectShopOrder,
} from "@/services/shop";

import OrdersHeader from "./OrdersHeader";
import SummaryCards from "./SummaryCards";
import SearchBar from "./SearchBar";
import FilterBar, {
  StatusFilter,
  PriorityFilter,
  PaymentFilter,
  SortOption,
} from "./FilterBar";
import PriorityOrdersSection from "./PriorityOrdersSection";
import RegularOrdersSection from "./RegularOrdersSection";
import SatelliteOrdersSection from "./SatelliteOrdersSection";
import CompletedPreview from "./CompletedPreview";
import BulkActions from "./BulkActions";
import EmptyState from "./EmptyState";
import SkeletonLoader from "./SkeletonLoader";
import Popup from "@/components/popup/Popup";

export default function ShopOrdersPage() {
  // Loading & State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Raw Backend Data
  const [todaysOrders, setTodaysOrders] = useState<TodayOrderItem[]>([]);
  const [activeOrders, setActiveOrders] = useState<ActiveShopOrder[]>([]);
  const [revenueData, setRevenueData] = useState<TodayRevenue | null>(null);
  const [enrichedOrders, setEnrichedOrders] = useState<EnrichedShopOrder[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("ALL");
  const [sortOption, setSortOption] = useState<SortOption>("PRIORITY_FIRST");

  // Selection state for Bulk UI
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Popup Modal state
  const [popupState, setPopupState] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant: "default" | "success" | "error" | "warning" | "confirmation";
  }>({
    open: false,
    title: "",
    description: "",
    variant: "default",
  });

  // Reject Confirmation Modal state
  const [rejectingOrder, setRejectingOrder] = useState<EnrichedShopOrder | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Fetch all orders from backend
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Parallel requests to backend APIs
      const [todayRes, activeRes, revenueRes] = await Promise.all([
        fetchTodaysOrders("QLex Central Print Hub").catch(() => []),
        fetchActiveShopOrders("QLex Central Print Hub").catch(() => []),
        fetchTodayRevenue("QLex Central Print Hub").catch(() => ({ total_orders: 0, total_revenue: 0 })),
      ]);

      setTodaysOrders(todayRes);
      setActiveOrders(activeRes);
      setRevenueData(revenueRes);

      // Merge & Enrich Orders with Backend Details
      const mergedList: EnrichedShopOrder[] = [];

      // Combine today queue items & active orders
      const queueMap = new Map<string, TodayOrderItem>();
      todayRes.forEach((q) => queueMap.set(q.order_id, q));

      const activeMap = new Map<string, ActiveShopOrder>();
      activeRes.forEach((a) => activeMap.set(a.id, a));

      // Collect all unique order IDs
      const allOrderIds = new Set<string>([
        ...todayRes.map((q) => q.order_id),
        ...activeRes.map((a) => a.id),
      ]);

      // Fetch order document specifications in parallel batches
      const orderDetailsPromises = Array.from(allOrderIds).map(async (orderId) => {
        const queueInfo = queueMap.get(orderId);
        const activeInfo = activeMap.get(orderId);

        let details: any = null;
        try {
          details = await fetchOrderDetails(orderId);
        } catch {
          try {
            details = await fetchOrderSummary(orderId);
          } catch {
            details = null;
          }
        }

        const isPriority = queueInfo
          ? queueInfo.is_priority
          : activeInfo
          ? activeInfo.is_priority
          : details?.is_priority ?? false;

        const isSatellite =
          details?.shop_name?.includes("Satellite") ||
          (queueInfo as any)?.shop_name?.includes("Satellite") ||
          (activeInfo as any)?.shop_name?.includes("Satellite");

        const token = activeInfo?.token
          ? activeInfo.token
          : queueInfo?.token
          ? queueInfo.token
          : details?.token
          ? details.token
          : isSatellite
          ? `S-${orderId.slice(0, 3).toUpperCase()}`
          : isPriority
          ? `P-${orderId.slice(0, 3).toUpperCase()}`
          : `R-${orderId.slice(0, 3).toUpperCase()}`;

        const queueState = queueInfo
          ? queueInfo.queue_state
          : activeInfo
          ? activeInfo.status
          : details?.status ?? "WAITING";

        const docs: DetailedOrderDocument[] = details?.documents
          ? details.documents.map((d: any) => {
              const printableCnt = d.printable_page_count ?? getPrintablePageCount(d.custom_pages, d.page_count || 1);
              return {
                id: d.id,
                original_filename: d.original_filename || "Document.pdf",
                stored_filename: d.stored_filename || null,
                page_count: d.page_count || 1,
                custom_pages: d.custom_pages || null,
                printable_page_count: printableCnt,
                copies: d.copies || 1,
                print_type: d.print_type || "black_white",
                paper_size: d.paper_size || "A4",
                print_side: d.print_side || "single",
                document_total: d.document_total || 0,
                url: getFileUrl(d.url, orderId, d.stored_filename || d.original_filename),
                services: d.services || [],
              };
            })
          : [];

        const totalPages = docs.reduce(
          (acc, d) => acc + (d.printable_page_count ?? d.page_count ?? 1) * (d.copies || 1),
          0
        );

        const totalCopies = docs.reduce((acc, d) => acc + (d.copies || 1), 0);

        return {
          order_id: orderId,
          token,
          student_id: details?.student_id || queueInfo?.student_id || "STUDENT",
          student_name: details?.student_name || queueInfo?.student_name || activeInfo?.student_name || "Student",
          register_number: details?.register_number || queueInfo?.register_number || activeInfo?.register_number || undefined,
          assigned_printer: details?.assigned_printer || queueInfo?.assigned_printer || activeInfo?.assigned_printer || undefined,
          is_priority: isPriority,
          queue_state: queueState as any,
          payment_status: details?.payment_status || activeInfo?.payment_status || "unpaid",
          grand_total: details?.grand_total || activeInfo?.grand_total || 0,
          created_at: activeInfo?.created_at || new Date().toISOString(),
          documents: docs,
          document_count: docs.length || queueInfo?.documents || 1,
          total_pages: totalPages || 1,
          total_copies: totalCopies || 1,
          is_current: queueInfo?.is_current ?? false,
          estimated_wait_minutes: details?.estimated_wait_minutes ?? queueInfo?.estimated_wait_minutes ?? activeInfo?.estimated_wait_minutes,
          estimated_completion_time: details?.estimated_completion_time ?? queueInfo?.estimated_completion_time ?? activeInfo?.estimated_completion_time,
        } as EnrichedShopOrder;
      });

      const enriched = await Promise.all(orderDetailsPromises);

      // Filter out any unpaid or pending payment orders from the shop queue
      const paidEnriched = enriched.filter(
        (o) =>
          String(o.payment_status).toLowerCase() === "paid" &&
          String(o.queue_state).toUpperCase() !== "DRAFT" &&
          String(o.queue_state).toUpperCase() !== "PENDING_PAYMENT"
      );

      // Sort by creation time to establish initial FCFS queue order
      paidEnriched.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      // Format token numbers as P-1, P-2... and R-1, R-2...
      let priCounter = 1;
      let regCounter = 1;

      const finalEnriched = paidEnriched.map((order) => {
        let tokenStr = order.token || "";
        const isStandard = /^[PR]-\d+$/i.test(tokenStr);

        if (!isStandard) {
          if (order.is_priority) {
            tokenStr = `P-${priCounter++}`;
          } else {
            tokenStr = `R-${regCounter++}`;
          }
        } else {
          const match = tokenStr.match(/\d+/);
          const num = match ? parseInt(match[0], 10) : 1;
          if (order.is_priority) {
            priCounter = Math.max(priCounter, num + 1);
          } else {
            regCounter = Math.max(regCounter, num + 1);
          }
        }

        return {
          ...order,
          token: tokenStr,
        };
      });

      setEnrichedOrders(finalEnriched);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Failed to load shop orders:", err);
      setPopupState({
        open: true,
        title: "Failed to Fetch Orders",
        description:
          err.message ||
          "Could not retrieve shop orders from backend. Please check connection and try again.",
        variant: "error",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Order Actions
  const handlePrintOrder = async (orderId: string) => {
    setActionLoading(true);
    try {
      await printShopOrder(orderId);
      setPopupState({
        open: true,
        title: "Printing Started",
        description: "Order status moved to PRINTING queue state.",
        variant: "success",
      });
    } catch (err: any) {
      setPopupState({
        open: true,
        title: "Action Failed",
        description: err.message || "Failed to update order status to Printing.",
        variant: "error",
      });
    } finally {
      await loadData(true);
      setActionLoading(false);
    }
  };

  const handleReadyOrder = async (orderId: string) => {
    setActionLoading(true);
    try {
      await markOrderReady(orderId);
      setPopupState({
        open: true,
        title: "Ready for Pickup",
        description: "Order marked as READY FOR PICKUP. Alert sent to student.",
        variant: "success",
      });
    } catch (err: any) {
      setPopupState({
        open: true,
        title: "Action Failed",
        description: err.message || "Failed to mark order as Ready.",
        variant: "error",
      });
    } finally {
      await loadData(true);
      setActionLoading(false);
    }
  };

  const handleServeOrder = async (orderId: string) => {
    setActionLoading(true);
    try {
      await serveShopOrder(orderId);
      setPopupState({
        open: true,
        title: "Order Completed",
        description: "Order marked as SERVED / Completed successfully.",
        variant: "success",
      });
    } catch (err: any) {
      setPopupState({
        open: true,
        title: "Action Failed",
        description: err.message || "Failed to mark order as Served.",
        variant: "error",
      });
    } finally {
      await loadData(true);
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingOrder) return;
    setActionLoading(true);
    try {
      await rejectShopOrder(rejectingOrder.order_id, rejectReason);
      setRejectingOrder(null);
      setRejectReason("");
      setPopupState({
        open: true,
        title: "Order Rejected",
        description: "Order has been moved to Rejected state.",
        variant: "warning",
      });
    } catch (err: any) {
      setPopupState({
        open: true,
        title: "Rejection Failed",
        description: err.message || "Failed to reject order.",
        variant: "error",
      });
    } finally {
      await loadData(true);
      setActionLoading(false);
    }
  };

  // Filtered & Processed Orders
  const filteredOrders = useMemo(() => {
    return enrichedOrders.filter((order) => {
      // 1. Search Query filter (Order #, Reg #, Token #, Document name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const shortId = order.order_id.toLowerCase();
        const token = order.token.toLowerCase();
        const regNo = (order.register_number || `REG-${order.student_id.slice(0, 8)}`).toLowerCase();

        const docMatch = order.documents.some((d) =>
          d.original_filename.toLowerCase().includes(q)
        );

        const textMatch =
          shortId.includes(q) || token.includes(q) || regNo.includes(q) || docMatch;

        if (!textMatch) return false;
      }

      // 2. Status Filter
      if (statusFilter !== "ALL") {
        const s = (order.queue_state || "").toUpperCase();
        if (statusFilter === "PENDING" && s !== "WAITING" && s !== "PENDING") return false;
        if (statusFilter === "ACCEPTED" && s !== "ACCEPTED" && s !== "PAID") return false;
        if (statusFilter === "PRINTING" && s !== "PRINTING") return false;
        if (statusFilter === "READY" && s !== "READY" && s !== "READY_FOR_PICKUP") return false;
        if (statusFilter === "COMPLETED" && s !== "SERVED" && s !== "COMPLETED") return false;
        if (statusFilter === "REJECTED" && s !== "REJECTED") return false;
      }

      // 3. Priority Filter
      if (priorityFilter === "PRIORITY" && !order.is_priority) return false;
      if (priorityFilter === "REGULAR" && order.is_priority) return false;

      // 4. Payment Filter
      if (paymentFilter !== "ALL") {
        const p = (order.payment_status || "").toLowerCase();
        if (paymentFilter === "PAID" && p !== "paid") return false;
        if (paymentFilter === "PENDING" && p !== "pending") return false;
      }

      return true;
    });
  }, [enrichedOrders, searchQuery, statusFilter, priorityFilter, paymentFilter]);

  // Helper to extract numeric token value
  const getTokenNum = (token: string): number => {
    const match = (token || "").match(/\d+/);
    return match ? parseInt(match[0], 10) : 999999;
  };

  // Sort Orders respecting FCFS Queue Order Rules & Token Number
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      const numA = getTokenNum(a.token);
      const numB = getTokenNum(b.token);

      if (sortOption === "PRIORITY_FIRST") {
        if (a.is_priority !== b.is_priority) {
          return a.is_priority ? -1 : 1;
        }
        if (numA !== numB) return numA - numB;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }

      if (sortOption === "TOKEN_ORDER") {
        if (a.is_priority !== b.is_priority) {
          return a.is_priority ? -1 : 1;
        }
        if (numA !== numB) return numA - numB;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }

      if (sortOption === "NEWEST") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }

      if (sortOption === "OLDEST") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }

      if (numA !== numB) return numA - numB;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [filteredOrders, sortOption]);

  const satelliteList = useMemo(
    () => sortedOrders.filter((o) => o.token.startsWith("S-") || (o as any).shop_name?.includes("Satellite")),
    [sortedOrders]
  );

  const priorityList = useMemo(
    () => sortedOrders.filter((o) => {
      const qs = (o.queue_state || "").toUpperCase();
      return o.is_priority && !o.token.startsWith("S-") && !(o as any).shop_name?.includes("Satellite") && qs !== "SERVED" && qs !== "COMPLETED" && qs !== "REJECTED";
    }),
    [sortedOrders]
  );

  const regularList = useMemo(
    () => sortedOrders.filter((o) => {
      const qs = (o.queue_state || "").toUpperCase();
      return !o.is_priority && !o.token.startsWith("S-") && !(o as any).shop_name?.includes("Satellite") && qs !== "SERVED" && qs !== "COMPLETED" && qs !== "REJECTED";
    }),
    [sortedOrders]
  );

  const completedList = useMemo(
    () => enrichedOrders.filter((o) => {
      const qs = (o.queue_state || "").toUpperCase();
      return qs === "SERVED" || qs === "COMPLETED";
    }),
    [enrichedOrders]
  );

  // Summary Counters
  const summaryCounts = useMemo(() => {
    const total = enrichedOrders.length;
    const pri = enrichedOrders.filter((o) => o.is_priority).length;
    const reg = enrichedOrders.filter((o) => !o.is_priority).length;
    const completed = completedList.length;
    return { total, pri, reg, completed };
  }, [enrichedOrders, completedList]);

  // Filter Reset Handler
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    statusFilter !== "ALL" ||
    priorityFilter !== "ALL" ||
    paymentFilter !== "ALL" ||
    sortOption !== "PRIORITY_FIRST";

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setPaymentFilter("ALL");
    setSortOption("PRIORITY_FIRST");
  };

  // Selection handlers
  const isAllSelected =
    sortedOrders.length > 0 && selectedOrderIds.length === sortedOrders.length;

  const handleSelectAll = () => {
    setSelectedOrderIds(sortedOrders.map((o) => o.order_id));
  };

  const handleClearSelection = () => {
    setSelectedOrderIds([]);
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-zinc-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <OrdersHeader
        onRefresh={() => loadData(true)}
        isRefreshing={refreshing}
        lastUpdated={lastUpdated}
      />

      {loading ? (
        <SkeletonLoader />
      ) : (
        <>
          {/* Summary Cards */}
          <SummaryCards
            totalOrders={summaryCounts.total}
            priorityOrders={summaryCounts.pri}
            regularOrders={summaryCounts.reg}
            completedToday={summaryCounts.completed}
          />

          {/* Search & Filters */}
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                resultCount={filteredOrders.length}
                totalCount={enrichedOrders.length}
              />
            </div>

            <FilterBar
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              priorityFilter={priorityFilter}
              onPriorityChange={setPriorityFilter}
              paymentFilter={paymentFilter}
              onPaymentChange={setPaymentFilter}
              sortOption={sortOption}
              onSortChange={setSortOption}
              onResetFilters={handleResetFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>

          {/* Bulk Operations UI Structure */}
          <BulkActions
            selectedCount={selectedOrderIds.length}
            totalCount={sortedOrders.length}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            isAllSelected={isAllSelected}
          />

          {/* Main Orders Content */}
          {sortedOrders.length === 0 ? (
            <EmptyState
              type={hasActiveFilters ? "no-results" : "no-orders"}
              onResetFilters={handleResetFilters}
            />
          ) : (
            <div className="space-y-8">
              {/* Priority Orders Section */}
              {(priorityFilter === "ALL" || priorityFilter === "PRIORITY") && (
                <PriorityOrdersSection
                  orders={priorityList}
                  onPrint={handlePrintOrder}
                  onReady={handleReadyOrder}
                  onServe={handleServeOrder}
                  onRejectTrigger={(o) => setRejectingOrder(o)}
                  isActionLoading={actionLoading}
                />
              )}

              {/* Regular Orders Section */}
              {(priorityFilter === "ALL" || priorityFilter === "REGULAR") && (
                <RegularOrdersSection
                  orders={regularList}
                  onPrint={handlePrintOrder}
                  onReady={handleReadyOrder}
                  onServe={handleServeOrder}
                  onRejectTrigger={(o) => setRejectingOrder(o)}
                  isActionLoading={actionLoading}
                />
              )}
            </div>
          )}

          {/* Recently Completed Preview Section */}
          <CompletedPreview completedOrders={completedList} />
        </>
      )}

      {/* Global Notification Popup Component */}
      <Popup
        open={popupState.open}
        onClose={() => setPopupState((prev) => ({ ...prev, open: false }))}
        title={popupState.title}
        description={popupState.description}
        variant={popupState.variant}
        showCloseButton
      />

      {/* Reject Confirmation Modal Popup */}
      <Popup
        open={!!rejectingOrder}
        onClose={() => {
          setRejectingOrder(null);
          setRejectReason("");
        }}
        title="Confirm Order Rejection"
        description={
          rejectingOrder
            ? `Are you sure you want to reject Order #${rejectingOrder.order_id.slice(0, 8).toUpperCase()} for Token ${rejectingOrder.token}?`
            : ""
        }
        variant="warning"
        showCloseButton
      >
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Rejection Reason (Optional):
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Invalid document format, unreadable file, student requested cancellation..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white placeholder-zinc-500 backdrop-blur-md focus:border-rose-500/40 focus:outline-none focus:ring-1 focus:ring-rose-500/30"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setRejectingOrder(null);
                setRejectReason("");
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReject}
              disabled={actionLoading}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/20 px-4 py-2 text-xs font-bold text-rose-200 hover:bg-rose-500/30 transition-all cursor-pointer"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Confirm Reject</span>
            </button>
          </div>
        </div>
      </Popup>
    </div>
  );
}
