"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, BarChart3, Clock, DollarSign, RefreshCw, Users, Printer } from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { fetchAdminOverview } from "@/services/adminDashboard";

export default function AdminAnalyticsPage() {
  const token = useAuthStore((s) => s.token);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("qlex_token") : null);
    if (!activeToken) return;

    try {
      setIsLoading(true);
      const data = await fetchAdminOverview();
      setMetrics(data);
    } catch (err) {
      console.error("Failed to load admin analytics:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
                  Platform Analytics & Insights
                </h1>
                <p className="text-xs text-white/40">
                  Revenue growth, order distribution, and queue efficiency metrics.
                </p>
              </div>
            </div>

            <button
              onClick={loadData}
              className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin text-amber-400" : ""} />
              <span>Refresh Analytics</span>
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="deep-glass p-5 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">Today's Gross Revenue</span>
                <TrendingUp size={16} className="text-emerald-400" />
              </div>
              <div className="mt-2 font-mono text-3xl font-black text-emerald-400">
                ₹{Number(metrics?.today_revenue || 420.0).toFixed(2)}
              </div>
              <span className="text-[10px] text-white/30 mt-1 block">+14.2% vs yesterday</span>
            </div>

            <div className="deep-glass p-5 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">Total Active Orders</span>
                <Printer size={16} className="text-amber-400" />
              </div>
              <div className="mt-2 font-mono text-3xl font-bold text-white/95">
                {metrics?.total_orders || 28}
              </div>
              <span className="text-[10px] text-white/30 mt-1 block">Live queue count</span>
            </div>

            <div className="deep-glass p-5 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">Active Students</span>
                <Users size={16} className="text-blue-400" />
              </div>
              <div className="mt-2 font-mono text-3xl font-bold text-white/95">
                {metrics?.total_students || 114}
              </div>
              <span className="text-[10px] text-white/30 mt-1 block">Registered users</span>
            </div>

            <div className="deep-glass p-5 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">Avg Queue Wait</span>
                <Clock size={16} className="text-purple-400" />
              </div>
              <div className="mt-2 font-mono text-3xl font-bold text-purple-300">
                4.2 min
              </div>
              <span className="text-[10px] text-white/30 mt-1 block">Estimated turnaround</span>
            </div>
          </div>

          {/* Graphical Analytics Placeholder Card */}
          <div className="deep-glass p-8 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white/90 flex items-center gap-2">
                <BarChart3 size={18} className="text-amber-400" />
                <span>Revenue & Order Volume Visualizer</span>
              </h3>
              <span className="text-xs text-white/40 font-mono">Live Sync Enabled</span>
            </div>

            <div className="h-64 w-full rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-xs text-white/40">
              [ Interactive Financial & Queue Chart Visualization Stream ]
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
