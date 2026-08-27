"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import WelcomeCard from "./WelcomeCard";
import PlatformOverview from "./PlatformOverview";
import LiveActivityCard from "./LiveActivityCard";
import WaitingRoomControl from "./WaitingRoomControl";
import ShopStatusGrid from "./ShopStatusGrid";
import PendingSettlements from "./PendingSettlements";
import RecentOrders from "./RecentOrders";
import RecentPayments from "./RecentPayments";
import NotificationsPanel from "./NotificationsPanel";
import QuickActions from "./QuickActions";
import SupportCard from "@/components/common/SupportCard";
import SkeletonLoader from "./SkeletonLoader";
import EmptyState from "./EmptyState";
import Popup from "@/components/popup/Popup";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import AdminProtectedRoute from "../AdminProtectedRoute";


import {
  getAdminOverview,
  getAdminDashboardCounts,
  getRecentOrders,
  getRecentPayments,
  getAdminShops,
  getAdminNotifications,
  getPendingSettlementsList,
  getServerHealth,
  type AdminOverview,
  type AdminDashboardCounts,
  type RecentOrderItem,
  type RecentPaymentItem,
  type AdminShopItem,
  type AdminNotificationItem,
  type SettlementItem,
  type ServerHealth,
} from "@/services/adminDashboard";

function AdminDashboardContent() {

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State data store
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [counts, setCounts] = useState<AdminDashboardCounts | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrderItem[]>([]);
  const [recentPayments, setRecentPayments] = useState<RecentPaymentItem[]>([]);
  const [shops, setShops] = useState<AdminShopItem[]>([]);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [settlements, setSettlements] = useState<SettlementItem[]>([]);
  const [health, setHealth] = useState<ServerHealth | null>(null);

  // Error Popup state
  const [popupState, setPopupState] = useState<{
    open: boolean;
    title: string;
    description: string;
  }>({
    open: false,
    title: "",
    description: "",
  });

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const [
        ovData,
        countsData,
        ordersData,
        paymentsData,
        shopsData,
        notifData,
        settlementsData,
        healthData,
      ] = await Promise.all([
        getAdminOverview(),
        getAdminDashboardCounts(),
        getRecentOrders(),
        getRecentPayments(),
        getAdminShops(),
        getAdminNotifications(),
        getPendingSettlementsList(),
        getServerHealth().catch(() => null),
      ]);

      setOverview(ovData);
      setCounts(countsData);
      setRecentOrders(ordersData);
      setRecentPayments(paymentsData);
      setShops(shopsData);
      setNotifications(notifData);
      setSettlements(settlementsData);
      setHealth(healthData);
    } catch (err: any) {
      console.error("Admin Dashboard Fetch Error:", err);
      const errMsg = err?.message || "Failed to fetch backend data.";
      setError(errMsg);

      if (!isSilent) {
        setPopupState({
          open: true,
          title: "Backend Connection Error",
          description: "Could not retrieve live platform statistics from the FastAPI backend. Please check server status.",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);

    // Periodic auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadData]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="relative min-h-screen w-full bg-[#030406] text-white flex flex-col selection:bg-blue-500/30 selection:text-blue-200">
      {/* Top Header */}
      <DashboardHeader
        unreadNotificationsCount={unreadCount}
        onRefresh={() => loadData(true)}
        isRefreshing={refreshing}
      />

      {/* Main Body with Sidebar + Content */}
      <div className="flex flex-1 w-full">
        {/* Sidebar */}
        <DashboardSidebar
          serverStatus={health?.status || counts?.server_status || "HEALTHY"}
          databaseStatus={health?.database || "CONNECTED"}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {loading ? (
            <SkeletonLoader />
          ) : error && !overview ? (
            <EmptyState
              title="Dashboard Data Unavailable"
              message="The QLex backend server appears unreachable. Verify backend is running on http://localhost:8000."
              onRetry={() => loadData(false)}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* 1. Welcome Hero Card */}
              <WelcomeCard
                adminName="QLex Administrator"
                serverStatus={health?.status || counts?.server_status || "HEALTHY"}
              />

              {/* 2. Platform Overview Cards */}
              {overview && <PlatformOverview data={overview} />}

              {/* 3. Live Queue Activity Card */}
              {counts && <LiveActivityCard counts={counts} />}

              {/* 3.5 Smart Waiting Room Control Telemetry Widget */}
              <div className="mb-8">
                <WaitingRoomControl />
              </div>

              {/* 4. Registered Print Shops Grid */}
              <ShopStatusGrid shops={shops} />

              {/* 5. Pending Settlements Banner */}
              {overview && (
                <PendingSettlements
                  settlements={settlements}
                  pendingAmount={overview.pending_settlements_amount}
                  pendingCount={overview.pending_settlements_count}
                />
              )}

              {/* 6. Recent Orders & Payments Feeds */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <RecentOrders orders={recentOrders} />
                <RecentPayments payments={recentPayments} />
              </div>

              {/* 7. System Events & Notifications */}
              <NotificationsPanel notifications={notifications} />

              {/* 8. Quick Navigation Shortcuts */}
              <QuickActions />

              {/* 9. Platform Support & Help Desk */}
              <div className="mt-8">
                <SupportCard />
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Reusable QLex Popup Modal for Error Handling */}
      <Popup
        open={popupState.open}
        onClose={() => setPopupState((prev) => ({ ...prev, open: false }))}
        title={popupState.title}
        description={popupState.description}
        variant="error"
        icon={<ShieldAlert className="h-6 w-6 text-red-400" />}
        showCloseButton={true}
        dismissOnBackdrop={true}
        dismissOnEsc={true}
      />
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminProtectedRoute>
      <AdminDashboardContent />
    </AdminProtectedRoute>
  );
}


