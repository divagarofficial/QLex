"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, Radio } from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import {
  fetchLiveQueue,
  fetchMyToken,
  fetchMyOrders,
} from "@/services/student";

import LiveQueueHeader from "@/components/live-queue/LiveQueueHeader";
import QueueOverview from "@/components/live-queue/QueueOverview";
import CurrentServingCard from "@/components/live-queue/CurrentServingCard";
import MyQueueCard from "@/components/live-queue/MyQueueCard";
import QueueTimeline from "@/components/live-queue/QueueTimeline";
import LiveQueueList from "@/components/live-queue/LiveQueueList";
import ShopStatusCard from "@/components/live-queue/ShopStatusCard";
import QueueInsights from "@/components/live-queue/QueueInsights";
import NotificationPanel, {
  QueueNotification,
} from "@/components/live-queue/NotificationPanel";
import EmptyState from "@/components/live-queue/EmptyState";
import SkeletonLoader from "@/components/live-queue/SkeletonLoader";
import Popup from "@/components/popup/Popup";

import type { LiveQueueResponse, MyTokenResponse, MyOrderItem } from "@/types/student";

// ── Animation Variants ─────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const easeCurve = [0.16, 1, 0.3, 1] as const;

const sectionVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easeCurve,
    },
  },
};

export default function LiveQueuePage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

  // Core queue data state
  const [liveQueueData, setLiveQueueData] = useState<LiveQueueResponse | null>(null);
  const [myTokenData, setMyTokenData] = useState<MyTokenResponse | null>(null);
  const [orders, setOrders] = useState<MyOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Popup / Error state
  const [errorPopup, setErrorPopup] = useState<{
    open: boolean;
    title: string;
    description: string;
  }>({
    open: false,
    title: "",
    description: "",
  });

  // Local notifications log state
  const [notifications, setNotifications] = useState<QueueNotification[]>([
    {
      id: "1",
      title: "Live Queue Active",
      message: "Real-time updates enabled. Polling every 5 seconds.",
      timestamp: "Just now",
      type: "INFO",
      read: false,
    },
  ]);

  const prevPrintingRef = useRef<string | null>(null);

  // ── Main Data Fetcher ─────────────────────────────────────────────
  const loadQueueData = useCallback(
    async (isManualRefresh = false) => {
      const activeToken =
        token || (typeof window !== "undefined" ? localStorage.getItem("qlex_token") : null);
      if (!activeToken) return;

      if (isManualRefresh) setIsRefreshing(true);

      try {
        // 1. Fetch global live queue (currently printing, priority, regular)
        const liveRes = await fetchLiveQueue(activeToken);
        setLiveQueueData(liveRes);

        // Detect if active printing token changed
        if (
          prevPrintingRef.current &&
          prevPrintingRef.current !== liveRes.currently_printing &&
          liveRes.currently_printing
        ) {
          setNotifications((prev) => [
            {
              id: Date.now().toString(),
              title: "Queue Advanced",
              message: `Now serving Token ${liveRes.currently_printing}`,
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              type: "ADVANCED",
              read: false,
            },
            ...prev,
          ]);
        }
        prevPrintingRef.current = liveRes.currently_printing;

        // 2. Fetch current student's active token
        try {
          const myTokenRes = await fetchMyToken(activeToken);
          setMyTokenData(myTokenRes);
        } catch {
          // 404 means student has no active queue token
          setMyTokenData(null);
        }

        // 3. Fetch orders (for stats calculation)
        try {
          const ordersRes = await fetchMyOrders(activeToken);
          setOrders(ordersRes.orders || []);
        } catch {
          // Fallback if orders endpoint fails
        }

        setLastUpdated(new Date());
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to load live queue data.";

        if (msg.includes("Invalid credentials") || msg.includes("Not authenticated")) {
          logout();
          router.push("/student/login");
          return;
        }

        // Display reusable Popup modal for network/backend errors
        setErrorPopup({
          open: true,
          title: "Queue Communication Error",
          description: msg || "Unable to reach QLex live queue servers. Please check your connection.",
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token, logout, router]
  );

  // Initial load
  useEffect(() => {
    loadQueueData();
  }, [loadQueueData]);

  // ── Auto-Polling Interval (5 seconds) ─────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      loadQueueData(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [loadQueueData]);

  // ── Derived Queue Calculations ────────────────────────────────────
  const currentlyPrinting = liveQueueData?.currently_printing || null;
  const priorityQueue = liveQueueData?.priority_queue || [];
  const regularQueue = liveQueueData?.regular_queue || [];
  const totalInQueue =
    (currentlyPrinting ? 1 : 0) + priorityQueue.length + regularQueue.length;

  const myTokenStr = myTokenData?.token || null;

  // Calculate student position and students ahead
  let position: number | null = null;
  let studentsAhead = 0;

  if (myTokenStr) {
    if (currentlyPrinting === myTokenStr) {
      position = 1;
      studentsAhead = 0;
    } else {
      const priorityIdx = priorityQueue.indexOf(myTokenStr);
      if (priorityIdx !== -1) {
        studentsAhead = priorityIdx + (currentlyPrinting ? 1 : 0);
        position = priorityIdx + 1 + (currentlyPrinting ? 1 : 0);
      } else {
        const regularIdx = regularQueue.indexOf(myTokenStr);
        if (regularIdx !== -1) {
          studentsAhead =
            priorityQueue.length + regularIdx + (currentlyPrinting ? 1 : 0);
          position =
            priorityQueue.length + regularIdx + 1 + (currentlyPrinting ? 1 : 0);
        }
      }
    }
  }

  // Calculate shop status dynamically
  const shopStatus =
    totalInQueue > 10 ? "VERY_BUSY" : totalInQueue > 4 ? "BUSY" : "OPEN";

  // Estimated wait calculation
  const estimatedWaitMinutes =
    myTokenData?.estimated_wait_minutes ?? studentsAhead * 3;

  // Completed orders today count
  const completedTodayCount = orders.filter(
    (o) => o.status === "SERVED" || o.status === "READY"
  ).length;

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Loading state
  if (isLoading) {
    return (
      <ProtectedRoute>
        <SkeletonLoader />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-obsidian text-white selection:bg-amber-500/30">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8 pb-16">
          {/* Header */}
          <LiveQueueHeader
            lastUpdated={lastUpdated}
            isRefreshing={isRefreshing}
            onRefresh={() => loadQueueData(true)}
          />

          {/* Queue Overview Summary */}
          <QueueOverview
            currentActiveToken={currentlyPrinting}
            myToken={myTokenStr}
            studentsAhead={studentsAhead}
            estimatedWaitMinutes={estimatedWaitMinutes}
            queueSpeed="~3-5 min"
            shopStatus={shopStatus}
          />

          {/* Main Layout Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 lg:grid-cols-12"
          >
            {/* Left Primary Column (8 cols desktop) */}
            <div className="space-y-6 lg:col-span-8">
              {/* Currently Serving Hero Card */}
              <motion.div variants={sectionVariants}>
                <CurrentServingCard
                  currentServingToken={currentlyPrinting}
                  totalInQueue={totalInQueue}
                />
              </motion.div>

              {/* My Position Card */}
              <motion.div variants={sectionVariants}>
                <MyQueueCard
                  myTokenData={myTokenData}
                  position={position}
                  studentsAhead={studentsAhead}
                />
              </motion.div>

              {/* Queue Timeline */}
              <motion.div variants={sectionVariants}>
                <QueueTimeline
                  myToken={myTokenStr}
                  status={myTokenData?.status || null}
                  studentsAhead={studentsAhead}
                />
              </motion.div>

              {/* Empty state fallback if zero tokens in entire shop queue */}
              {totalInQueue === 0 && (
                <motion.div variants={sectionVariants}>
                  <EmptyState />
                </motion.div>
              )}
            </div>

            {/* Right Secondary Column (4 cols desktop) */}
            <div className="space-y-6 lg:col-span-4">
              {/* Live Queue Sequence List */}
              <motion.div variants={sectionVariants}>
                <LiveQueueList
                  currentlyPrinting={currentlyPrinting}
                  priorityQueue={priorityQueue}
                  regularQueue={regularQueue}
                  myToken={myTokenStr}
                />
              </motion.div>

              {/* Shop Status Card */}
              <motion.div variants={sectionVariants}>
                <ShopStatusCard
                  shopStatus={shopStatus}
                  totalWaiting={totalInQueue}
                  currentlyPrinting={!!currentlyPrinting}
                />
              </motion.div>

              {/* Queue Insights */}
              <motion.div variants={sectionVariants}>
                <QueueInsights
                  totalInQueue={totalInQueue}
                  completedTodayCount={completedTodayCount}
                  estimatedTotalMinutes={totalInQueue * 3}
                />
              </motion.div>

              {/* Notifications Panel */}
              <motion.div variants={sectionVariants}>
                <NotificationPanel
                  notifications={notifications}
                  onMarkAllAsRead={handleMarkAllNotificationsRead}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Error Popup Modal ──────────────────────────────────────── */}
      <Popup
        open={errorPopup.open}
        onClose={() => setErrorPopup((prev) => ({ ...prev, open: false }))}
        variant="error"
        size="md"
        title={errorPopup.title}
        description={errorPopup.description}
        icon={<AlertTriangle size={28} className="text-red-400" />}
        showBranding
      >
        <Popup.Footer>
          <button
            onClick={() => {
              setErrorPopup((prev) => ({ ...prev, open: false }));
              loadQueueData(true);
            }}
            className="popup-btn-primary"
          >
            Retry Connection
          </button>
          <button
            onClick={() => setErrorPopup((prev) => ({ ...prev, open: false }))}
            className="popup-btn-secondary"
          >
            Dismiss
          </button>
        </Popup.Footer>
      </Popup>
    </ProtectedRoute>
  );
}
