"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, History, Printer, RefreshCw, MapPin } from "lucide-react";
import Link from "next/link";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { fetchMyOrders } from "@/services/student";

export default function StaffOrdersPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetchMyOrders(token);
      setOrders(res.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <ProtectedRoute redirectPath="/staff/login">
      <div className="min-h-screen relative overflow-hidden bg-[#030406] text-white">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-radial from-emerald-500/12 via-emerald-300/5 to-transparent blur-3xl opacity-60" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <Link
            href="/staff/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Staff Dashboard</span>
          </Link>

          <div className="deep-glass p-6 sm:p-8 rounded-3xl border border-emerald-500/20 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
                  <History className="h-6 w-6 text-emerald-400" />
                  <span>My Staff Orders</span>
                </h1>
                <p className="text-xs text-white/70 mt-1 flex items-center gap-1.5 flex-wrap">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Terminal Address: <strong className="text-emerald-300 font-medium">A103, Department of Artificial Intelligence and Data Science, First Floor, A Block</strong></span>
                </p>
              </div>

              <Link
                href="/staff/new-order"
                className="px-4 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 text-center"
              >
                + New Order
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-white/50">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-400 mb-2" />
                <p className="text-xs">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center text-white/50 space-y-3">
                <Printer className="h-10 w-10 mx-auto text-emerald-400/40" />
                <p className="text-sm">No staff print orders submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const orderId = order.order_id || (order as any).id || "";
                  return (
                    <div
                      key={orderId || Math.random()}
                      className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-500/30 transition"
                    >
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-bold text-white">
                            Order #{orderId ? orderId.slice(0, 8) : "N/A"}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                            QLex Satellite Hub (A103)
                          </span>
                        </div>
                        <p className="text-xs text-white/60 mt-1">
                          Status: <strong className="text-white">{order.status}</strong> • Location: <strong className="text-emerald-300 font-normal">A103, 1st Floor, A Block</strong> • Total: <strong className="text-emerald-400">₹0.00 (Staff Free)</strong>
                        </p>
                      </div>

                      <Link
                        href={`/staff/orders/${orderId}`}
                        className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-white/90 hover:bg-white/10 transition text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
