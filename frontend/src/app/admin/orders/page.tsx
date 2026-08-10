"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Filter, RefreshCw, Printer, ShieldAlert, CheckCircle2, Clock } from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { fetchAdminRecentOrders } from "@/services/adminDashboard";
import StatusChip from "@/components/shop/orders/StatusChip";
import PaymentBadge from "@/components/shop/orders/PaymentBadge";

export default function AdminOrdersPage() {
  const token = useAuthStore((s) => s.token);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = useCallback(async () => {
    const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("qlex_token") : null);
    if (!activeToken) return;

    try {
      setIsLoading(true);
      const data = await fetchAdminRecentOrders();
      setOrders(data || []);
    } catch (err) {
      console.error("Failed to load admin orders:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      (o.id || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.student_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.token ? String(o.token) : "").includes(search);
    const matchesStatus = statusFilter === "all" || (o.status || "").toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-obsidian text-white selection:bg-amber-500/30">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6 pb-16">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/dashboard"
                className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 transition-all hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white/95">
                  Platform Orders Management
                </h1>
                <p className="text-xs text-white/40">
                  Global queue and print order logs across all shops.
                </p>
              </div>
            </div>

            <button
              onClick={loadData}
              className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin text-amber-400" : ""} />
              <span>Refresh Orders</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/[0.02] border border-white/10 p-4">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search by Order ID, Student Name, Token..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2 text-xs text-white placeholder-white/40 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={14} className="text-white/40" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-white/80 focus:outline-none"
              >
                <option value="all" className="bg-slate-900">All Statuses</option>
                <option value="pending" className="bg-slate-900">Pending</option>
                <option value="printing" className="bg-slate-900">Printing</option>
                <option value="ready" className="bg-slate-900">Ready</option>
                <option value="completed" className="bg-slate-900">Completed</option>
                <option value="cancelled" className="bg-slate-900">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Table View */}
          <div className="deep-glass relative overflow-hidden rounded-3xl border border-white/10">
            <div className="deep-glass-reflection" />
            <div className="relative z-10 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-white/40 uppercase font-mono border-b border-white/10">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Student</th>
                    <th className="p-4">Token</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-white/40">
                        Loading order registry...
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-white/40">
                        No orders match the current search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-mono font-bold text-amber-300">
                          #{o.id.slice(0, 8)}
                        </td>
                        <td className="p-4 font-medium text-white/90">
                          {o.student_name || "Student"}
                        </td>
                        <td className="p-4 font-mono font-bold text-white/80">
                          {o.token ? `#${o.token}` : "Regular"}
                        </td>
                        <td className="p-4">
                          <StatusChip status={o.status} />
                        </td>
                        <td className="p-4">
                          <PaymentBadge status={o.payment_status} />
                        </td>
                        <td className="p-4 font-mono font-bold text-emerald-400">
                          ₹{Number(o.final_amount || o.amount || 0).toFixed(2)}
                        </td>
                        <td className="p-4 text-white/40">
                          {o.created_at ? new Date(o.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
