"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import { getAdminPaymentsPage, type AdminPaymentItemFull } from "@/services/adminDashboard";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPaymentItemFull[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAdminPaymentsPage({
        search: search.trim() || undefined,
        page,
        page_size: 12,
      });
      setPayments(data.payments || []);
      setTotalPages(data.total_pages || 1);
      setTotalPayments(data.total || 0);
    } catch (err) {
      console.error("Failed to load admin payments:", err);
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const totalVolume = payments
    .filter((p) => (p.status || "").toLowerCase() === "paid")
    .reduce((acc, p) => acc + Number(p.amount || 0), 0);

  return (
    <AdminProtectedRoute>
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
                  Global Razorpay transactions and student payment logs ({totalPayments} total).
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
              <span className="text-xs text-white/40">Page Settled Volume</span>
              <div className="mt-1 font-mono text-3xl font-black text-emerald-400">
                ₹{totalVolume.toFixed(2)}
              </div>
            </div>
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-5">
              <span className="text-xs text-white/40">Total Transactions</span>
              <div className="mt-1 font-mono text-3xl font-bold text-white/90">
                {totalPayments}
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
              placeholder="Search by Payment ID, Transaction ID, Order ID, Student Register No..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
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
                    <th className="p-4">Transaction / Tx Ref</th>
                    <th className="p-4">Order Ref</th>
                    <th className="p-4">Student</th>
                    <th className="p-4">Register No</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Paid Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-white/40">
                        Loading payment logs...
                      </td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-white/40">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => {
                      const orderRefStr = p.order_id ? `#${String(p.order_id).slice(0, 8)}` : "N/A";
                      return (
                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-mono font-bold text-amber-300">
                            {p.transaction_id || `#${p.id.slice(0, 8)}`}
                          </td>
                          <td className="p-4 font-mono text-white/70">
                            {orderRefStr}
                          </td>
                          <td className="p-4 font-medium text-white/90">
                            {p.user_name || "Student"}
                          </td>
                          <td className="p-4 font-mono text-white/60">
                            {p.register_number || "N/A"}
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-white/40 font-mono">
                Page {page} of {totalPages}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || isLoading}
                  className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || isLoading}
                  className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 disabled:opacity-40"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminProtectedRoute>
  );
}

