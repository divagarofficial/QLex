"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Ticket, Building2, CheckCircle2, Clock, MapPin, Printer, RefreshCw } from "lucide-react";
import Link from "next/link";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { fetchMyToken, fetchMyOrders } from "@/services/student";

export default function StaffTokenPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(true);
  const [tokenInfo, setTokenInfo] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      const [tRes, oRes] = await Promise.all([
        fetchMyToken(token).catch(() => null),
        fetchMyOrders(token).catch(() => ({ orders: [] })),
      ]);
      setTokenInfo(tRes);
      setOrders(oRes.orders || []);
    } catch {
      setTokenInfo(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeOrder = orders.find(
    (o) => o.status === "PAID" || o.status === "PRINTING" || o.status === "READY_FOR_PICKUP"
  );

  const tokenNumber = tokenInfo?.token || activeOrder?.token || "P-1";

  return (
    <ProtectedRoute redirectPath="/staff/login">
      <div className="min-h-screen relative overflow-hidden bg-[#030406] text-white">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-radial from-emerald-500/12 via-emerald-300/5 to-transparent blur-3xl opacity-60" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <Link
            href="/staff/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Staff Dashboard</span>
          </Link>

          {loading ? (
            <div className="py-20 text-center text-white/50">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-emerald-400 mb-3" />
              <p className="text-sm">Loading staff queue token...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Digital Token Card */}
              <div className="deep-glass relative overflow-hidden p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900/50 to-slate-950/80 text-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
                  <Building2 className="h-4 w-4" />
                  <span>QLex Satellite Print Hub (Room A103)</span>
                </div>

                <h1 className="text-xs uppercase font-semibold text-white/60 tracking-widest">Active Staff Digital Token</h1>
                <div className="my-4">
                  <span className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 tracking-tight drop-shadow-[0_0_25px_rgba(16,185,129,0.25)]">
                    {tokenNumber}
                  </span>
                </div>

                <div className="inline-block px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-bold text-emerald-300">
                  Status: {activeOrder?.status || "QUEUED AT SATELLITE HUB"}
                </div>

                <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-xs">
                  <div>
                    <span className="text-white/50">Staff Member</span>
                    <p className="font-bold text-white mt-0.5">{user?.full_name || "Faculty Member"}</p>
                    <p className="text-[11px] text-emerald-400 font-mono">{user?.register_number || "STF"}</p>
                  </div>

                  <div>
                    <span className="text-white/50">Department</span>
                    <p className="font-bold text-white mt-0.5">{user?.department_name || "Institutional Staff"}</p>
                    <p className="text-[11px] text-emerald-300 font-semibold">Zero-Cost Staff Printing</p>
                  </div>
                </div>
              </div>

              {/* Pickup Location Card */}
              <div className="deep-glass p-6 rounded-3xl border border-emerald-500/20 bg-slate-900/40 flex items-start gap-4">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">Collection Location</h3>
                    <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">First Floor</span>
                  </div>
                  <p className="text-sm font-semibold text-emerald-300">QLex Satellite Print Hub, Staff Terminal</p>
                  <p className="text-xs text-white/90 font-medium">
                    📍 <strong className="text-white">Address:</strong> A103, Department of Artificial Intelligence and Data Science, First Floor, A Block
                  </p>
                  <p className="text-xs text-white/60 pt-1 leading-relaxed">
                    Please present your Staff ID card or show this active digital token code <code className="text-emerald-300 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">{tokenNumber}</code> at the A103 Satellite Hub counter for document collection.
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
