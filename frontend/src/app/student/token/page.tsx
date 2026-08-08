"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import BackgroundEffects from "@/components/token/BackgroundEffects";
import TokenHeader from "@/components/token/TokenHeader";
import DigitalTokenCard from "@/components/token/DigitalTokenCard";
import QueueStatusCard from "@/components/token/QueueStatusCard";
import QueueProgress from "@/components/token/QueueProgress";
import OrderInformation from "@/components/token/OrderInformation";
import CollectionInformation from "@/components/token/CollectionInformation";
import QueueInsights from "@/components/token/QueueInsights";
import NotificationPanel, { type NotificationItem } from "@/components/token/NotificationPanel";
import EmptyState from "@/components/token/EmptyState";
import SkeletonLoader from "@/components/token/SkeletonLoader";
import Popup from "@/components/popup/Popup";

import { getCurrentUser } from "@/services/auth";
import {
  fetchMyToken,
  fetchLiveQueue,
  fetchMyOrders,
  fetchWaitingRoomStatus,
  enterWaitingRoom,
  getWaitingRoomSession,
  setWaitingRoomSession,
} from "@/services/student";
import { getOrderSummary } from "@/services/orders";
import type { UserResponse } from "@/components/auth/types";
import type { MyTokenResponse, LiveQueueResponse, MyOrderItem } from "@/types/student";

function MyTokenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedOrderId = searchParams?.get("order_id");

  // State Management
  const [loading, setLoading] = useState(true);
  const [hasNoActiveToken, setHasNoActiveToken] = useState(false);
  const [userProfile, setUserProfile] = useState<UserResponse | null>(null);
  const [tokenInfo, setTokenInfo] = useState<MyTokenResponse | null>(null);
  const [liveQueue, setLiveQueue] = useState<LiveQueueResponse | null>(null);
  const [activeOrder, setActiveOrder] = useState<MyOrderItem | null>(null);
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Popup Error State
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

  const prevStatusRef = useRef<string | null>(null);

  // Main Data Fetcher
  const loadTokenData = useCallback(
    async (isPolling = false) => {
      const authToken = typeof window !== "undefined" ? localStorage.getItem("qlex_token") : null;

      if (!authToken) {
        setHasNoActiveToken(true);
        setLoading(false);
        return;
      }

      try {
        // Step 1: Ensure waiting room session token BEFORE calling order APIs
        if (!getWaitingRoomSession()) {
          try {
            const wr = await enterWaitingRoom(authToken, "my_token").catch(() =>
              fetchWaitingRoomStatus(authToken)
            );
            if (wr && wr.session_token) {
              setWaitingRoomSession(wr.session_token);
            }
          } catch {
            // non-fatal if waiting room is bypassed
          }
        }

        // Step 2: Parallel data requests
        const [userRes, tokenRes, ordersRes, queueRes] = await Promise.all([
          getCurrentUser(authToken).catch(() => null),
          fetchMyToken(authToken).catch(() => null),
          fetchMyOrders(authToken).catch(() => null),
          fetchLiveQueue(authToken).catch(() => null),
        ]);

        if (userRes) setUserProfile(userRes);
        if (queueRes) setLiveQueue(queueRes);

        // Step 3: Resolve Active Order from Orders list
        let matchedOrder: MyOrderItem | null = null;
        const todayStr = new Date().toDateString();

        if (ordersRes && ordersRes.orders && ordersRes.orders.length > 0) {
          // Priority 1: Explicit order_id requested in URL params (if created today or active)
          if (requestedOrderId) {
            matchedOrder = ordersRes.orders.find((o) => o.order_id === requestedOrderId) || null;
          }

          // Priority 2: Order matching the active token from backend
          if (!matchedOrder && tokenRes?.order_id) {
            matchedOrder = ordersRes.orders.find((o) => o.order_id === tokenRes.order_id) || null;
          }

          // Priority 3: Active order created TODAY
          if (!matchedOrder) {
            matchedOrder =
              ordersRes.orders.find(
                (o) =>
                  new Date(o.created_at).toDateString() === todayStr &&
                  o.status !== "DRAFT" &&
                  o.status !== "draft" &&
                  o.status !== "SERVED" &&
                  o.status !== "COMPLETED" &&
                  o.status !== "REJECTED" &&
                  o.status !== "CANCELLED"
              ) || null;
          }
        }

        // Step 4: Resolve Active Token Info
        let resolvedTokenInfo: MyTokenResponse | null = tokenRes;

        if (resolvedTokenInfo && matchedOrder) {
          resolvedTokenInfo.is_priority = (matchedOrder as any).is_priority ?? resolvedTokenInfo.is_priority;
        }

        // If fetchMyToken returned null/404, ONLY construct token info if matchedOrder was created TODAY and is active
        if (!resolvedTokenInfo && matchedOrder) {
          const isToday = new Date(matchedOrder.created_at).toDateString() === todayStr;
          const isActiveStatus = ["PAID", "ACCEPTED", "PRINTING", "READY_FOR_PICKUP", "WAITING", "QUEUED"].includes(
            (matchedOrder.status || "").toUpperCase()
          );

          if (isToday && isActiveStatus) {
            const isPri = (matchedOrder as any).is_priority ?? (matchedOrder.token ? matchedOrder.token.startsWith("P-") : false);
            const prefix = isPri ? "P" : "R";
            resolvedTokenInfo = {
              token: matchedOrder.token || `${prefix}-1`,
              status: matchedOrder.status || "WAITING",
              estimated_wait_minutes: 5,
              is_priority: isPri,
            };
          } else {
            matchedOrder = null;
          }
        }

        // If student has no active token OR no active order for today, show Empty State
        if (!resolvedTokenInfo || !matchedOrder) {
          setHasNoActiveToken(true);
          setLoading(false);
          return;
        }

        setHasNoActiveToken(false);
        setTokenInfo(resolvedTokenInfo);
        setActiveOrder(matchedOrder);

        // Step 5: Fetch Detailed Order Summary & Document specifications
        if (matchedOrder && matchedOrder.order_id) {
          const summary = await getOrderSummary(matchedOrder.order_id).catch(() => null);
          if (summary) setOrderDetails(summary);
        }

        // Step 6: Live Activity Notification tracker
        const currentStatus = (resolvedTokenInfo?.status || matchedOrder?.status || "WAITING").toUpperCase();
        if (prevStatusRef.current && prevStatusRef.current !== currentStatus) {
          const newNotif: NotificationItem = {
            id: Date.now().toString(),
            title: `Order Status: ${currentStatus}`,
            message:
              currentStatus === "PRINTING"
                ? "Your document is currently being printed at the counter."
                : currentStatus === "READY" || currentStatus === "READY_FOR_PICKUP"
                ? "Your prints are ready for pickup at the counter!"
                : `Order status updated to ${currentStatus}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            type:
              currentStatus === "READY" || currentStatus === "READY_FOR_PICKUP"
                ? "success"
                : "info",
            read: false,
          };
          setNotifications((prev) => [newNotif, ...prev]);
        } else if (notifications.length === 0 && resolvedTokenInfo) {
          setNotifications([
            {
              id: "init-1",
              title: "Token Active",
              message: `Token ${resolvedTokenInfo.token} linked to your order.`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              type: "info",
              read: true,
            },
          ]);
        }

        prevStatusRef.current = currentStatus;
      } catch (err: any) {
        if (!isPolling) {
          setPopupState({
            open: true,
            title: "Backend Connection Issue",
            description: err.message || "Failed to load order data from backend.",
            variant: "error",
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [requestedOrderId, notifications.length]
  );

  // Initial load & 8-second live polling loop
  useEffect(() => {
    loadTokenData(false);

    const interval = setInterval(() => {
      loadTokenData(true);
    }, 8000);

    return () => clearInterval(interval);
  }, [loadTokenData]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  if (hasNoActiveToken || (!tokenInfo && !activeOrder)) {
    return <EmptyState />;
  }

  // Data Extraction & Queue Math from Backend Responses
  const isPriority = tokenInfo?.is_priority ?? (activeOrder as any)?.is_priority ?? orderDetails?.is_priority ?? false;
  const tokenNumber = tokenInfo?.token || (activeOrder?.token ? activeOrder.token : (isPriority ? "P-1" : "R-1"));
  const orderStatus = tokenInfo?.status || activeOrder?.status || "WAITING";
  const paymentStatus = activeOrder?.payment_status || "PAID";

  const studentName = userProfile?.full_name || "Student User";
  const registerNumber = userProfile?.register_number || "REQ-NUM";

  const orderIdStr = tokenInfo?.order_id || activeOrder?.order_id || requestedOrderId || "ORDER-ID";
  const shopNameStr = "Campus Xerox Center";

  // Calculate live queue position metrics from backend live-queue and tokenInfo
  const currentlyPrinting = tokenInfo?.currently_printing || liveQueue?.currently_printing || null;
  const priorityQueue = liveQueue?.priority_queue || [];
  const regularQueue = liveQueue?.regular_queue || [];

  const isCurrentPrinting = currentlyPrinting === tokenNumber || orderStatus === "PRINTING";

  let yourPosition = tokenInfo?.queue_number || 0;
  let studentsAhead = tokenInfo?.students_ahead ?? 0;

  if (isCurrentPrinting) {
    yourPosition = 1;
    studentsAhead = 0;
  } else if (priorityQueue.includes(tokenNumber)) {
    const idx = priorityQueue.indexOf(tokenNumber);
    yourPosition = idx + 1;
    studentsAhead = idx + (currentlyPrinting ? 1 : 0);
  } else if (regularQueue.includes(tokenNumber)) {
    const idx = regularQueue.indexOf(tokenNumber);
    yourPosition = idx + 1;
    studentsAhead = priorityQueue.length + idx + (currentlyPrinting ? 1 : 0);
  }

  const estimatedWait = tokenInfo?.estimated_wait_minutes ?? (isCurrentPrinting ? 1 : Math.max(1, studentsAhead * 3));
  const liveQueueCount = (currentlyPrinting ? 1 : 0) + priorityQueue.length + regularQueue.length;

  // Format Date & Time
  const createdDate = activeOrder?.created_at ? new Date(activeOrder.created_at) : new Date();
  const dateStr = createdDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = createdDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Calculate Document Statistics from Backend Order Details
  const docsList = orderDetails?.documents || [];
  const docCount = docsList.length || activeOrder?.documents || 1;
  const totalPages = docsList.reduce(
    (acc: number, d: any) => acc + (d.page_count || 1) * (d.copies || 1),
    0
  );
  const totalCopies = docsList.reduce((acc: number, d: any) => acc + (d.copies || 1), 0);

  const printTypesSet = new Set(docsList.map((d: any) => d.print_type).filter(Boolean));
  const printTypeStr =
    printTypesSet.size > 1
      ? "Color & Black & White"
      : printTypesSet.has("COLOR")
      ? "Color"
      : "Black & White";

  const paperSizesSet = new Set(docsList.map((d: any) => d.paper_size).filter(Boolean));
  const paperSizeStr = Array.from(paperSizesSet).join(", ") || "A4";

  const printSidesSet = new Set(docsList.map((d: any) => d.print_side).filter(Boolean));
  const printSidesStr =
    Array.from(printSidesSet)
      .map((s) => (s === "DOUBLE" ? "Double Sided" : "Single Sided"))
      .join(", ") || "Single Sided";

  const totalAmount = orderDetails?.total_amount || activeOrder?.total_amount || 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#030406] text-white relative overflow-x-hidden selection:bg-cyan-500 selection:text-slate-950 font-sans">
        {/* Background Mesh & Floating Glowing Orbs */}
        <BackgroundEffects />

        {/* Main Wrapper */}
        <div className="relative z-10 flex flex-col min-h-screen justify-between">
          
          {/* Header */}
          <TokenHeader />

          {/* Page Body Container */}
          <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20 flex-grow">
            
            {/* Desktop Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN (Desktop col-span-5): Hero Digital Token Card */}
              <div className="lg:col-span-5 w-full space-y-6">
                <DigitalTokenCard
                  tokenNumber={tokenNumber}
                  queueNumber={yourPosition > 0 ? yourPosition : null}
                  studentName={studentName}
                  registerNumber={registerNumber}
                  shopName={shopNameStr}
                  orderNumber={orderIdStr}
                  isPriority={isPriority}
                  orderStatus={orderStatus}
                  dateStr={dateStr}
                  timeStr={timeStr}
                />

                {/* Notification Panel on Left Column Desktop */}
                <div className="hidden lg:block">
                  <NotificationPanel
                    notifications={notifications}
                    onMarkAllRead={handleMarkAllRead}
                  />
                </div>
              </div>

              {/* RIGHT COLUMN (Desktop col-span-7): Live Queue, Progress, Details, Collection */}
              <div className="lg:col-span-7 w-full space-y-6">
                
                {/* Live Queue Status */}
                <QueueStatusCard
                  currentlyPrinting={currentlyPrinting}
                  yourPosition={yourPosition}
                  studentsAhead={studentsAhead}
                  estimatedWaitMinutes={estimatedWait}
                  isCurrentPrinting={isCurrentPrinting}
                />

                {/* Queue Progress Tracker */}
                <QueueProgress orderStatus={orderStatus} paymentStatus={paymentStatus} />

                {/* Queue Insights */}
                <QueueInsights
                  estimatedWaitMinutes={estimatedWait}
                  liveQueueCount={liveQueueCount}
                  priorityQueueCount={priorityQueue.length}
                  regularQueueCount={regularQueue.length}
                />

                {/* Order Information Breakdown */}
                <OrderInformation
                  orderId={orderIdStr}
                  shopName={shopNameStr}
                  documentCount={docCount}
                  totalPages={totalPages || 1}
                  totalCopies={totalCopies || 1}
                  printingType={printTypeStr}
                  paperSize={paperSizeStr}
                  printSides={printSidesStr}
                  isPriority={isPriority}
                  totalAmount={totalAmount}
                  paymentStatus={paymentStatus}
                  documents={docsList}
                />

                {/* Collection Information & Reserved QR space */}
                <CollectionInformation collectionStatus={orderStatus} />

                {/* Notification Panel for Mobile & Tablet */}
                <div className="lg:hidden">
                  <NotificationPanel
                    notifications={notifications}
                    onMarkAllRead={handleMarkAllRead}
                  />
                </div>

              </div>
            </div>

          </main>

        </div>

        {/* Error / Warning Popup Dialog */}
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
                loadTokenData(false);
              }}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
            >
              Retry Connection
            </button>
          </Popup.Footer>
        </Popup>
      </div>
    </ProtectedRoute>
  );
}

export default function MyTokenPage() {
  return (
    <Suspense fallback={<SkeletonLoader />}>
      <MyTokenContent />
    </Suspense>
  );
}
