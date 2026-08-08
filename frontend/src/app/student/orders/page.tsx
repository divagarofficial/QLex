"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, History, HelpCircle } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Popup from "@/components/popup/Popup";
import OrderStatsCards from "@/components/orders/OrderStatsCards";
import OrderSearchFilters, {
  type FilterCategory,
  type SortOption,
} from "@/components/orders/OrderSearchFilters";
import MyOrderCard from "@/components/orders/MyOrderCard";
import MyOrdersEmptyState from "@/components/orders/MyOrdersEmptyState";
import MyOrdersSkeleton from "@/components/orders/MyOrdersSkeleton";

import {
  fetchMyOrders,
  fetchWaitingRoomStatus,
  enterWaitingRoom,
  getWaitingRoomSession,
  setWaitingRoomSession,
} from "@/services/student";
import type { MyOrderItem } from "@/types/student";

export default function MyOrdersPage() {
  const router = useRouter();

  // State Management
  const [orders, setOrders] = useState<MyOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);

  // Error Popup state
  const [popupState, setPopupState] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant: "error" | "warning" | "info";
  }>({
    open: false,
    title: "",
    description: "",
    variant: "error",
  });

  // Fetch orders from backend
  const loadOrders = useCallback(async (isSilentRefresh = false) => {
    const authToken =
      typeof window !== "undefined" ? localStorage.getItem("qlex_token") : null;

    if (!authToken) {
      setLoading(false);
      return;
    }

    try {
      // Step 1: Ensure waiting room session header is initialized
      if (!getWaitingRoomSession()) {
        try {
          const wr = await enterWaitingRoom(authToken, "my_orders").catch(() =>
            fetchWaitingRoomStatus(authToken)
          );
          if (wr && wr.session_token) {
            setWaitingRoomSession(wr.session_token);
          }
        } catch {
          // Bypassed if waiting room not enforced
        }
      }

      // Step 2: Fetch orders from backend API
      const res = await fetchMyOrders(authToken);
      if (res && Array.isArray(res.orders)) {
        setOrders(res.orders);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      if (!isSilentRefresh) {
        setPopupState({
          open: true,
          title: "Failed to Load Orders",
          description:
            err.message ||
            "Unable to retrieve your order history from QLex backend server.",
          variant: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and 8-second polling
  useEffect(() => {
    loadOrders(false);

    const interval = setInterval(() => {
      loadOrders(true);
    }, 8000);

    return () => clearInterval(interval);
  }, [loadOrders]);

  // Filtering & Search Logic (Memoized)
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search Query Matching (Order ID or Token)
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        const matchesId = order.order_id.toLowerCase().includes(query);
        const matchesToken = order.token ? order.token.toLowerCase().includes(query) : false;
        if (!matchesId && !matchesToken) return false;
      }

      // Filter Category Matching
      if (activeFilter === "all") return true;

      const normStatus = (order.status || "").toLowerCase();
      const normPayment = (order.payment_status || "").toLowerCase();

      if (activeFilter === "pending") {
        return ["pending_payment", "paid", "accepted", "waiting", "draft"].includes(normStatus);
      }

      if (activeFilter === "queued_printing") {
        return normStatus === "printing";
      }

      if (activeFilter === "ready") {
        return ["ready_for_pickup", "ready"].includes(normStatus);
      }

      if (activeFilter === "completed") {
        return ["completed", "served"].includes(normStatus);
      }

      if (activeFilter === "cancelled") {
        return ["cancelled", "expired", "payment_failed", "rejected"].includes(normStatus);
      }

      if (activeFilter === "payment_pending") {
        return normPayment === "pending";
      }

      if (activeFilter === "payment_completed") {
        return normPayment === "paid";
      }

      return true;
    });
  }, [orders, searchQuery, activeFilter]);

  // Sorting Logic (Memoized)
  const sortedOrders = useMemo(() => {
    const list = [...filteredOrders];
    if (sortBy === "newest") {
      return list.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    if (sortBy === "oldest") {
      return list.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }
    if (sortBy === "amount_high") {
      return list.sort(
        (a, b) => (Number(b.total_amount) || 0) - (Number(a.total_amount) || 0)
      );
    }
    if (sortBy === "amount_low") {
      return list.sort(
        (a, b) => (Number(a.total_amount) || 0) - (Number(b.total_amount) || 0)
      );
    }
    if (sortBy === "status") {
      return list.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
    }
    return list;
  }, [filteredOrders, sortBy]);

  // Partition into Active Orders & Previous Orders History
  const activeStatuses = [
    "draft",
    "pending_payment",
    "paid",
    "accepted",
    "printing",
    "ready_for_pickup",
    "waiting",
    "ready",
  ];

  const activeOrders = useMemo(() => {
    return sortedOrders.filter((o) => activeStatuses.includes((o.status || "").toLowerCase()));
  }, [sortedOrders]);

  const historyOrders = useMemo(() => {
    return sortedOrders.filter((o) => !activeStatuses.includes((o.status || "").toLowerCase()));
  }, [sortedOrders]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#030406] text-white selection:bg-amber-400 selection:text-slate-950">
        {/* Background Mesh Overlay */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-amber-500/5 blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-[120px]" />
        </div>

        {/* Main Content Container */}
        <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
          {/* Page Header */}
          <header className="space-y-4">
            <Link
              href="/student/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-white/70 backdrop-blur-md transition hover:bg-white/[0.08] hover:text-white"
            >
              <ArrowLeft size={14} />
              <span>Back to Dashboard</span>
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
                  My Orders
                </h1>
                <p className="mt-1 text-sm text-white/50">
                  Manage and track all your print orders in real-time.
                </p>
              </div>

              <button
                onClick={() => router.push("/student/new-order")}
                className="crystal-btn shrink-0 self-start sm:self-auto cursor-pointer"
              >
                + Create New Order
              </button>
            </div>
          </header>

          {loading ? (
            <MyOrdersSkeleton />
          ) : orders.length === 0 ? (
            <MyOrdersEmptyState
              onLearnMore={() => setShowHowItWorksModal(true)}
            />
          ) : (
            <div className="space-y-10">
              {/* Statistics Cards Overview */}
              <section className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40 px-1">
                  Statistics Overview
                </h2>
                <OrderStatsCards orders={orders} />
              </section>

              {/* Search & Filters Controls */}
              <section>
                <OrderSearchFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  totalResults={filteredOrders.length}
                />
              </section>

              {/* Section 1: Current Active Orders */}
              {activeOrders.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                    <Clock className="text-amber-400" size={18} />
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      Current Orders
                    </h2>
                    <span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-400/20">
                      {activeOrders.length} active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {activeOrders.map((order) => (
                      <MyOrderCard
                        key={order.order_id}
                        order={order}
                        isActive={true}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Section 2: Previous Order History */}
              {historyOrders.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                    <History className="text-white/40" size={18} />
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      Order History
                    </h2>
                    <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/50 border border-white/10">
                      {historyOrders.length} previous
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {historyOrders.map((order) => (
                      <MyOrderCard
                        key={order.order_id}
                        order={order}
                        isActive={false}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Filter No Results Fallback */}
              {filteredOrders.length === 0 && (
                <div className="deep-glass rounded-2xl border border-white/10 p-10 text-center space-y-3">
                  <p className="text-base font-semibold text-white/80">
                    No orders match your filter criteria.
                  </p>
                  <p className="text-xs text-white/40">
                    Try adjusting your search terms or filter selection.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveFilter("all");
                    }}
                    className="mt-2 text-xs font-bold text-amber-400 hover:underline cursor-pointer"
                  >
                    Reset all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Backend Error Popup */}
        <Popup
          open={popupState.open}
          onClose={() => setPopupState({ ...popupState, open: false })}
          title={popupState.title}
          description={popupState.description}
          variant={popupState.variant}
        >
          <Popup.Footer>
            <button
              type="button"
              onClick={() => {
                setPopupState({ ...popupState, open: false });
                loadOrders(false);
              }}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              Retry Connection
            </button>
          </Popup.Footer>
        </Popup>

        {/* How QLex Works Modal */}
        <Popup
          open={showHowItWorksModal}
          onClose={() => setShowHowItWorksModal(false)}
          title="How QLex Print Ordering Works"
          description="Instant document printing in 4 simple steps."
          variant="info"
        >
          <div className="space-y-4 py-2 text-xs text-white/80">
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-bold">1</span>
              <p><strong>Upload PDF Documents</strong>: Upload single or multiple documents and configure print settings (Color/B&W, Single/Double sided, Copies).</p>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-bold">2</span>
              <p><strong>Checkout & Payment</strong>: Confirm order price breakdown and complete secure payment.</p>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-bold">3</span>
              <p><strong>Digital Token Generation</strong>: Get an instant token (e.g. P-001 or R-004) and track live queue status in real-time.</p>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-bold">4</span>
              <p><strong>Collect at Counter</strong>: Show your digital token at the QLex print shop counter to pick up your printed documents.</p>
            </div>
          </div>
          <Popup.Footer>
            <button
              type="button"
              onClick={() => {
                setShowHowItWorksModal(false);
                router.push("/student/new-order");
              }}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              Start New Order Now
            </button>
          </Popup.Footer>
        </Popup>
      </div>
    </ProtectedRoute>
  );
}
