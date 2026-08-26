"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, Building2, CheckCircle2, Clock, MapPin, RefreshCw, FileText } from "lucide-react";
import Link from "next/link";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { fetchOrderDetails } from "@/services/student";

export default function StaffOrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.orderId;
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDetails = useCallback(async () => {
    if (!token || !orderId) return;
    setLoading(true);
    try {
      const res = await fetchOrderDetails(token, orderId);
      setOrder(res);
    } catch (err: any) {
      setError(err.message || "Failed to load order details.");
    } finally {
      setLoading(false);
    }
  }, [token, orderId]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  return (
    <ProtectedRoute redirectPath="/staff/login">
      <div className="min-h-screen relative overflow-hidden bg-[#030406] text-white">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-radial from-emerald-500/12 via-emerald-300/5 to-transparent blur-3xl opacity-60" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <Link
            href="/staff/orders"
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Staff Orders</span>
          </Link>

          {loading ? (
            <div className="py-20 text-center text-white/50">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-emerald-400 mb-3" />
              <p className="text-sm">Loading order details...</p>
            </div>
          ) : error || !order ? (
            <div className="p-8 deep-glass rounded-3xl text-center text-rose-400 space-y-3">
              <p>{error || "Order not found."}</p>
              <Link href="/staff/orders" className="inline-block text-xs font-semibold text-white underline">
                Return to Orders List
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Banner */}
              <div className="deep-glass p-6 sm:p-8 rounded-3xl border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{order.shop_name || "QLex Satellite Print Hub"}</span>
                  </div>
                  <h1 className="text-2xl font-bold text-white">Order #{(order.order_id || order.id || orderId || "").slice(0, 8)}</h1>
                  <p className="text-xs text-white/60 mt-1">
                    Staff Member: <strong className="text-white">{user?.full_name}</strong> ({user?.register_number})
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Total Charges</span>
                  <p className="text-2xl font-extrabold text-emerald-300">₹0.00</p>
                  <span className="text-[10px] text-emerald-300/80">Staff Free Order</span>
                </div>
              </div>

              {/* Status Card */}
              <div className="deep-glass p-6 rounded-3xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs text-white/50">Current Status</span>
                  <p className="text-lg font-bold text-emerald-400 mt-0.5">{order.status}</p>
                </div>
                <div>
                  <span className="text-xs text-white/50">Payment State</span>
                  <p className="text-sm font-semibold text-emerald-300 mt-0.5">COVERED BY CAMPUS</p>
                </div>
              </div>

              {/* Documents List */}
              <div className="deep-glass p-6 rounded-3xl border border-white/10 space-y-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-400" />
                  <span>Order Documents</span>
                </h2>

                <div className="divide-y divide-white/5">
                  {order.documents?.map((doc: any) => (
                    <div key={doc.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-white">{doc.original_filename}</p>
                        <p className="text-white/50 mt-0.5">
                          {doc.copies} Cop{doc.copies > 1 ? "ies" : "y"} • {doc.print_type === "color" ? "Color" : "B&W"} • {doc.print_side === "double" ? "Double Sided" : "Single Sided"} ({doc.paper_size?.toUpperCase()})
                        </p>
                      </div>
                      <span className="font-bold text-emerald-400">₹0.00</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location Card */}
              <div className="deep-glass p-6 rounded-3xl border border-emerald-500/20 bg-slate-900/40 flex items-start gap-4">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">Pickup Point</h3>
                    <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">First Floor</span>
                  </div>
                  <p className="text-sm font-semibold text-emerald-300">QLex Satellite Print Hub, Staff Terminal</p>
                  <p className="text-xs text-white/90 font-medium">
                    📍 <strong className="text-white">Address:</strong> A103, Department of Artificial Intelligence and Data Science, First Floor, A Block
                  </p>
                  <p className="text-xs text-white/60 pt-1 leading-relaxed">
                    Present your Staff ID card at the Room A103 QLex Satellite Print Hub counter to collect printed documents.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
