"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, AlertTriangle, RefreshCw, Printer, Ticket, History, Activity, Sparkles, Building2, UserCheck, MapPin } from "lucide-react";
import Link from "next/link";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { fetchMyOrders, fetchMyToken } from "@/services/student";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SkeletonLoader from "@/components/dashboard/SkeletonLoader";
import PrinterInkHealthWidget from "@/components/dashboard/PrinterInkHealthWidget";
import SupportCard from "@/components/common/SupportCard";
import Popup from "@/components/popup/Popup";
import type { MyOrderItem, MyTokenResponse } from "@/types/student";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const easeCurve = [0.16, 1, 0.3, 1] as const;

const sectionVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: easeCurve },
  },
};

export default function StaffDashboard() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [orders, setOrders] = useState<MyOrderItem[]>([]);
  const [activeToken, setActiveToken] = useState<MyTokenResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [logoutPopupOpen, setLogoutPopupOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      try {
        const tokenRes = await fetchMyToken(token);
        setActiveToken(tokenRes);
      } catch {
        setActiveToken(null);
      }

      try {
        const ordersRes = await fetchMyOrders(token);
        setOrders(ordersRes.orders || []);
      } catch {
        setOrders([]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load staff dashboard data.";
      setError(message);
      if ((err as any)?.status === 401 || (err as any)?.response?.status === 401) {
        logout();
        router.push("/staff/login");
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, logout, router]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const confirmLogout = () => {
    setLogoutPopupOpen(false);
    logout();
    if (typeof window !== "undefined") {
      localStorage.removeItem("qlex_token");
      window.location.href = "/staff/login";
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute redirectPath="/staff/login">
        <SkeletonLoader />
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute redirectPath="/staff/login">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-obsidian">
          <div className="deep-glass relative w-full max-w-md overflow-hidden p-8 text-center">
            <div className="deep-glass-reflection" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <AlertTriangle size={32} />
              </div>
              <h2 className="mt-5 text-2xl font-bold text-white">Something went wrong</h2>
              <p className="mt-2 text-sm text-zinc-400 font-light">{error}</p>
              <button onClick={fetchDashboardData} className="mt-6 crystal-btn">
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute redirectPath="/staff/login">
      <div className="min-h-screen relative overflow-hidden bg-[#030406] text-white">
        {/* Background Ambient Beams */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-radial from-emerald-500/12 via-emerald-300/5 to-transparent blur-3xl opacity-60" />
        <div className="pointer-events-none absolute top-1/4 right-0 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-3xl opacity-35" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <DashboardHeader onLogout={() => setLogoutPopupOpen(true)} />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-8 space-y-8 mb-16"
          >
            {/* Welcome Banner */}
            <motion.div variants={sectionVariants}>
              <div className="deep-glass relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 via-slate-900/40 to-slate-950/60">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Faculty & Staff Portal</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                      Welcome, <span className="text-emerald-400">{user?.full_name || "Faculty Member"}</span>
                    </h1>
                    <p className="text-sm text-white/70 max-w-xl">
                      Staff ID: <code className="text-emerald-300 font-semibold">{user?.register_number || "STF"}</code> • Department: <span className="text-white/90 font-medium">{user?.department_name || "Institutional Staff"}</span>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Link
                      href="/staff/new-order"
                      className="inline-flex items-center justify-center gap-2.5 rounded-2xl border border-emerald-400/40 bg-emerald-500/20 px-6 py-3.5 text-sm font-semibold text-emerald-300 backdrop-blur-md transition-all duration-300 hover:bg-emerald-500/30 hover:border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.15)]"
                    >
                      <Printer className="h-4 w-4" />
                      <span>New Staff Print Order</span>
                    </Link>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-400/80">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Target Terminal: <strong className="text-white">QLex Satellite Print Hub</strong> • <span className="text-emerald-300 font-medium">A103, Dept of AI & DS, 1st Floor, A Block</span></span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-white/60">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    Covered by Institutional Printing Allowance
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Satellite Print Hub Location Details Callout */}
            <motion.div variants={sectionVariants}>
              <div className="deep-glass p-5 sm:p-6 rounded-3xl border border-emerald-500/25 bg-gradient-to-r from-emerald-950/20 via-slate-900/40 to-emerald-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shrink-0">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Official Print Terminal</span>
                      <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">Active Hub</span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-0.5">QLex Satellite Print Hub</h3>
                    <p className="text-xs text-white/70 mt-1 flex items-center gap-1.5 flex-wrap">
                      <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <strong className="text-emerald-300 font-semibold">Address:</strong>
                      <span className="text-white/90">A103, Department of Artificial Intelligence and Data Science, First Floor, A Block</span>
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-left sm:text-right border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-5">
                  <span className="text-[11px] text-white/50 block">Hub Operating Hours</span>
                  <span className="text-xs font-bold text-emerald-300 block mt-0.5">08:00 AM – 06:00 PM</span>
                  <span className="text-[10px] text-white/40 block mt-0.5">Priority Staff Queue Enabled</span>
                </div>
              </div>
            </motion.div>

            {/* Printer Ink & Hardware Telemetry Health Widget */}
            <motion.div variants={sectionVariants}>
              <PrinterInkHealthWidget />
            </motion.div>

            {/* Quick Actions Grid */}
            <motion.div variants={sectionVariants}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  href="/staff/new-order"
                  className="group deep-glass p-5 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Printer className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      Free
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors">
                    Upload & Print
                  </h3>
                  <p className="mt-1 text-xs text-white/60">
                    Submit documents for printing at Satellite Print Hub.
                  </p>
                </Link>

                <Link
                  href="/staff/token"
                  className="group deep-glass p-5 rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                      <Ticket className="h-6 w-6" />
                    </div>
                    {Boolean(activeToken?.token) && (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                    Active Staff Token
                  </h3>
                  <p className="mt-1 text-xs text-white/60">
                    View collection token & Satellite Hub pickup status.
                  </p>
                </Link>

                <Link
                  href="/staff/orders"
                  className="group deep-glass p-5 rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                      <History className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                    My Staff Orders
                  </h3>
                  <p className="mt-1 text-xs text-white/60">
                    Track status of past and current print jobs.
                  </p>
                </Link>

                <Link
                  href="/staff/live-queue"
                  className="group deep-glass p-5 rounded-2xl border border-white/10 hover:border-violet-500/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400">
                      <Activity className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-violet-300 transition-colors">
                    Satellite Live Queue
                  </h3>
                  <p className="mt-1 text-xs text-white/60">
                    Check live queue traffic at Satellite Print Hub.
                  </p>
                </Link>
              </div>
            </motion.div>

            {/* Recent Orders List */}
            <motion.div variants={sectionVariants}>
              <div className="deep-glass p-6 rounded-3xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Printer className="h-5 w-5 text-emerald-400" />
                    <span>Recent Staff Print Orders</span>
                  </h2>
                  <Link href="/staff/orders" className="text-xs text-emerald-400 hover:underline">
                    View All
                  </Link>
                </div>

                {orders.length === 0 ? (
                  <div className="py-12 text-center text-white/50 space-y-3">
                    <Printer className="h-10 w-10 mx-auto text-emerald-400/40" />
                    <p className="text-sm">No print orders submitted yet.</p>
                    <Link
                      href="/staff/new-order"
                      className="inline-block text-xs font-semibold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 rounded-full hover:bg-emerald-500/20"
                    >
                      Create First Staff Order
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {orders.slice(0, 5).map((order) => {
                      const orderId = order.order_id || (order as any).id || "";
                      const docCount = typeof order.documents === "number" ? order.documents : (order.documents as any)?.length || 1;
                      return (
                        <div key={orderId || Math.random()} className="py-3.5 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-white">
                                Order #{orderId ? orderId.slice(0, 8) : "N/A"}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                                QLex Satellite Print Hub (A103)
                              </span>
                            </div>
                            <p className="text-xs text-white/60 mt-0.5">
                              {docCount} Document(s) • Status: <strong className="text-white/80">{order.status}</strong> • <span className="text-emerald-300">Room A103, 1st Floor</span>
                            </p>
                          </div>

                          <Link
                            href={`/staff/orders/${orderId}`}
                            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
                          >
                            View Details →
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Support & Assistance Card */}
            <motion.div variants={sectionVariants}>
              <SupportCard />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Popup
        open={logoutPopupOpen}
        onClose={() => setLogoutPopupOpen(false)}
        variant="confirmation"
        size="sm"
        title="Sign Out"
        description="Are you sure you want to sign out of the Staff Portal?"
        icon={<LogOut size={28} />}
        showBranding
      >
        <Popup.Footer>
          <button onClick={confirmLogout} className="popup-btn-danger">
            Sign Out
          </button>
          <button onClick={() => setLogoutPopupOpen(false)} className="popup-btn-secondary">
            Cancel
          </button>
        </Popup.Footer>
      </Popup>
    </ProtectedRoute>
  );
}
