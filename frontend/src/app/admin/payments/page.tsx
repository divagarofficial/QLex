"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Search, RefreshCw, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { fetchAdminRecentPayments } from "@/services/adminDashboard";

export default function AdminPaymentsPage() {
  const token = useAuthStore((s) => s.token);
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("qlex_token") : null);
    if (!activeToken) return;

    try {
      setIsLoading(true);
      const data = await fetchAdminRecentPayments(activeToken);
      setPayments(data || []);
    } catch (err) {
      console.error("Failed to load admin payments:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredPayments = payments.filter((p) => {
    return (
      (p.id || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.order_id || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.user_name || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalVolume = payments
    .filter((p) => (p.status || "").toLowerCase() === "paid")
    .reduce((acc, p) => acc + Number(p.amount || 0), 0);

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
                  Platform Payment Transactions
                </h1>
                <p className="text-xs text-white/40">
                  Global Razorpay transactions and student payment logs.
                </p>
              </div>
            </div>

            <button
              onClick={loadData}
              className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin text-amber-400" : ""} />
              <span>Refresh Transactions</span>
            </button>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5">
              <span className="text-xs text-white/40">Total Settled Volume</span>
              <div className="mt-1 font-mono text-3xl font-black text-emerald-400">
                ₹{totalVolume.toFixed(2)}
              </div>
            </div>
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5">
              <span className="text-xs text-white/40">Total Transactions</span>
              <div className="mt-1 font-mono text-3xl font-bold text-white/90">
                {payments.length}
              </div>
            </div>
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5">
              <span className="text-xs text-white/40">Payment Gateway</span>
              <div className="mt-1 font-mono text-xl font-semibold text-amber-300">
                Razorpay Automated UPI
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search by Payment ID, Order ID, User Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Table View */}
          <div className="deep-glass relative overflow-hidden rounded-3xl border border-white/10">
            <div className="deep-glass-reflection" />
            <div className="relative z-10 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-white/40 uppercase font-mono border-b border-white/10">
                  <tr>
                    <th className="p-4">Payment ID</th>
                    <th className="p-4">Order Ref</th>
                    <th className="p-4">User</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Paid Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-white/40">
                        Loading payment logs...
                      </td>
                    </tr>
                  ) : filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-white/40">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-mono font-bold text-amber-300">
                          #{p.id.slice(0, 8)}
                        </td>
                        <td className="p-4 font-mono text-white/70">
                          #{p.order_id ? p.order_id.slice(0, 8) : "N/A"}
                        </td>
                        <td className="p-4 font-medium text-white/90">
                          {p.user_name || "Student"}
                        </td>
                        <td className="p-4 font-mono font-bold text-emerald-400">
                          ₹{Number(p.amount || 0).toFixed(2)}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              (p.status || "").toLowerCase() === "paid"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {p.status || "Pending"}
                          </span>
                        </td>
                        <td className="p-4 text-white/40">
                          {p.created_at ? new Date(p.created_at).toLocaleString() : "N/A"}
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
