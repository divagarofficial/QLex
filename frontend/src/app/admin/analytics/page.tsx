"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, BarChart3, Clock, RefreshCw, Users, Printer } from "lucide-react";

import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import { getAdminOverview, getRevenueHistory } from "@/services/adminDashboard";

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [revenueHistory, setRevenueHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [ovData, revData] = await Promise.all([
        getAdminOverview(),
        getRevenueHistory().catch(() => ({ history: [] })),
      ]);
      setMetrics(ovData);
      setRevenueHistory(revData?.history || []);
    } catch (err) {
      console.error("Failed to load admin analytics:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute maximum revenue for SVG bar scaling
  const maxRevenue = Math.max(...revenueHistory.map((h) => Number(h.total_revenue || 0)), 100);

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
                <span className="text-xs text-white/40">Today's Platform Revenue</span>
                <TrendingUp size={16} className="text-emerald-400" />
              </div>
              <div className="mt-2 font-mono text-3xl font-black text-emerald-400">
                ₹{Number(metrics?.platform_revenue_today || 0).toFixed(2)}
              </div>
              <span className="text-[10px] text-white/30 mt-1 block">Month: ₹{Number(metrics?.platform_revenue_month || 0).toFixed(2)}</span>
            </div>

            <div className="deep-glass p-5 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">Today's Orders</span>
                <Printer size={16} className="text-amber-400" />
              </div>
              <div className="mt-2 font-mono text-3xl font-bold text-white/95">
                {metrics?.today_orders || 0}
              </div>
              <span className="text-[10px] text-white/30 mt-1 block">{metrics?.active_orders || 0} currently active</span>
            </div>

            <div className="deep-glass p-5 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">Registered Students</span>
                <Users size={16} className="text-blue-400" />
              </div>
              <div className="mt-2 font-mono text-3xl font-bold text-white/95">
                {metrics?.total_students || 0}
              </div>
              <span className="text-[10px] text-white/30 mt-1 block">Campus user base</span>
            </div>

            <div className="deep-glass p-5 rounded-3xl border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">Pending Settlements</span>
                <Clock size={16} className="text-purple-400" />
              </div>
              <div className="mt-2 font-mono text-3xl font-bold text-purple-300">
                ₹{Number(metrics?.pending_settlements_amount || 0).toFixed(2)}
              </div>
              <span className="text-[10px] text-white/30 mt-1 block">{metrics?.pending_settlements_count || 0} pending statements</span>
            </div>
          </div>

          {/* Graphical Analytics Card */}
          <div className="deep-glass p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white/90 flex items-center gap-2">
                <BarChart3 size={18} className="text-amber-400" />
                <span>Daily Revenue & Order Volume Stream</span>
              </h3>
              <span className="text-xs text-white/40 font-mono">Database Synced</span>
            </div>

            {revenueHistory.length === 0 ? (
              <div className="h-48 w-full rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-xs text-white/40">
                No historical revenue data recorded yet. Submit orders to generate daily trends.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-end justify-between gap-2 h-48 pt-6 pb-2 px-4 bg-white/[0.01] border border-white/5 rounded-2xl overflow-x-auto">
                  {revenueHistory.slice(0, 14).reverse().map((item, idx) => {
                    const rev = Number(item.total_revenue || 0);
                    const heightPct = Math.max(10, Math.min(100, (rev / maxRevenue) * 100));
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group min-w-[36px]">
                        <span className="text-[9px] font-mono font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          ₹{rev}
                        </span>
                        <div
                          style={{ height: `${heightPct}%` }}
                          className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-emerald-500/20 via-amber-500/50 to-amber-400 group-hover:brightness-125 transition-all"
                        />
                        <span className="text-[9px] font-mono text-white/40 truncate w-full text-center">
                          {item.date ? String(item.date).slice(5) : `#${idx}`}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-xs text-white/40 font-mono px-2 pt-2 border-t border-white/5">
                  <span>Legend: Bar height = Daily revenue</span>
                  <span>Total Recorded Days: {revenueHistory.length}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}

