"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, AlertTriangle, RefreshCw } from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import {
  fetchMyOrders,
  fetchWaitingRoomStatus,
  enterWaitingRoom,
  setWaitingRoomSession,
  getWaitingRoomSession,
  fetchMyToken,
} from "@/services/student";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import QuickNavigationGrid from "@/components/dashboard/QuickNavigationGrid";
import ActiveOrderCard from "@/components/dashboard/ActiveOrderCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import QuickStats from "@/components/dashboard/QuickStats";
import SkeletonLoader from "@/components/dashboard/SkeletonLoader";
import Popup from "@/components/popup/Popup";
import type { MyOrderItem, MyTokenResponse } from "@/types/student";

// Stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const easeCurve = [0.16, 1, 0.3, 1] as const;

const sectionVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.65,
      ease: easeCurve,
    },
  },
};

export default function StudentDashboard() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

  // Data state
  const [orders, setOrders] = useState<MyOrderItem[]>([]);
  const [activeToken, setActiveToken] = useState<MyTokenResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Logout popup state
  const [logoutPopupOpen, setLogoutPopupOpen] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Fetch active token
      try {
        const tokenRes = await fetchMyToken(token);
        setActiveToken(tokenRes);
      } catch {
        setActiveToken(null);
      }

      // Step 2: Establish waiting room session
      let sessionEstablished = false;
      try {
        const status = await fetchWaitingRoomStatus(token);
        if (status.session_token) {
          setWaitingRoomSession(status.session_token);
          sessionEstablished = status.allowed;
        } else if (status.allowed) {
          const entered = await enterWaitingRoom(token, "my_orders");
          if (entered.session_token) {
            setWaitingRoomSession(entered.session_token);
            sessionEstablished = true;
          }
        }
      } catch {
        sessionEstablished = false;
      }

      // Step 3: Fetch orders
      if (sessionEstablished || getWaitingRoomSession()) {
        try {
          const ordersRes = await fetchMyOrders(token);
          setOrders(ordersRes.orders || []);
        } catch {
          setOrders([]);
        }
      } else {
        setOrders([]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load dashboard data.";
      setError(message);
      const isUnauthorized = (err as any)?.status === 401 || (err as any)?.response?.status === 401;
      if (isUnauthorized) {
        logout();
        router.push("/student/login");
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, logout, router]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Logout handlers
  const handleLogoutClick = () => {
    setLogoutPopupOpen(true);
  };

  const confirmLogout = () => {
    setLogoutPopupOpen(false);
    logout();
    if (typeof window !== "undefined") {
      localStorage.removeItem("qlex_token");
      window.location.href = "/student/login";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <ProtectedRoute>
        <SkeletonLoader />
      </ProtectedRoute>
    );
  }

  // Error state
  if (error) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-obsidian">
          <div className="deep-glass relative w-full max-w-md overflow-hidden p-8 text-center">
            <div className="deep-glass-reflection" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <AlertTriangle size={32} />
              </div>
              <h2 className="mt-5 text-2xl font-bold text-white">
                Something went wrong
              </h2>
              <p className="mt-2 text-sm text-zinc-400 font-light">
                {error}
              </p>
              <button
                onClick={fetchDashboardData}
                className="mt-6 crystal-btn"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Main Dashboard
  return (
    <ProtectedRoute>
      <div className="min-h-screen relative overflow-hidden bg-[#030406] text-white">
        {/* Environmental Background Lighting Beams */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-radial from-amber-500/12 via-amber-300/5 to-transparent blur-3xl opacity-60" />
        <div className="pointer-events-none absolute top-1/4 right-0 w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-3xl opacity-35" />
        <div className="pointer-events-none absolute bottom-10 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl opacity-30" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <DashboardHeader onLogout={handleLogoutClick} />

          {/* Main Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-8 space-y-8 mb-16"
          >
            {/* Welcome Section */}
            <motion.div variants={sectionVariants}>
              <WelcomeCard />
            </motion.div>

            {/* Quick Navigation Cards */}
            <motion.div variants={sectionVariants}>
              <QuickNavigationGrid />
            </motion.div>

            {/* Active Order Card */}
            <motion.div variants={sectionVariants}>
              <ActiveOrderCard orders={orders} />
            </motion.div>

            {/* Recent Activity + Quick Stats */}
            <motion.div
              variants={sectionVariants}
              className="grid grid-cols-1 gap-6 lg:grid-cols-2"
            >
              <RecentActivity orders={orders} />
              <QuickStats orders={orders} />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Logout Confirmation Popup */}
      <Popup
        open={logoutPopupOpen}
        onClose={() => setLogoutPopupOpen(false)}
        variant="confirmation"
        size="sm"
        title="Sign Out"
        description="Are you sure you want to sign out? You'll need to log in again to access your dashboard."
        icon={<LogOut size={28} />}
        showBranding
      >
        <Popup.Footer>
          <button
            onClick={confirmLogout}
            className="popup-btn-danger"
            aria-label="Confirm sign out"
          >
            Sign Out
          </button>
          <button
            onClick={() => setLogoutPopupOpen(false)}
            className="popup-btn-secondary"
            aria-label="Cancel sign out"
          >
            Cancel
          </button>
        </Popup.Footer>
      </Popup>
    </ProtectedRoute>
  );
}
