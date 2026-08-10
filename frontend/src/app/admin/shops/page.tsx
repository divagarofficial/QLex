"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Store, RefreshCw, CheckCircle2, ShieldCheck, Printer, Clock } from "lucide-react";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { fetchAdminShops } from "@/services/adminDashboard";

export default function AdminShopsPage() {
  const token = useAuthStore((s) => s.token);
  const [shops, setShops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("qlex_token") : null);
    if (!activeToken) return;

    try {
      setIsLoading(true);
      const data = await fetchAdminShops(activeToken);
      setShops(data || []);
    } catch (err) {
      console.error("Failed to load admin shops:", err);
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
                  Print Shop Management
                </h1>
                <p className="text-xs text-white/40">
                  Registered campus print hubs and operational status.
                </p>
              </div>
            </div>

            <button
              onClick={loadData}
              className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin text-amber-400" : ""} />
              <span>Refresh Shops</span>
            </button>
          </div>

          {/* Grid View */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div className="col-span-full p-12 text-center text-xs text-white/40">
                Loading print hubs...
              </div>
            ) : shops.length === 0 ? (
              <div className="col-span-full deep-glass p-8 rounded-3xl text-center text-xs text-white/40">
                Default Central Print Hub registered: RIT_PRINT_SHOP.
              </div>
            ) : (
              shops.map((shop) => (
                <div
                  key={shop.id || shop.shop_id}
                  className="deep-glass relative p-6 rounded-3xl border border-white/10 space-y-4"
                >
                  <div className="deep-glass-reflection" />
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                          <Store size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-white/95">{shop.name || "QLex Central Print Hub"}</h3>
                          <span className="text-[10px] font-mono text-white/40">ID: {shop.id || "RIT_PRINT_SHOP"}</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                        Online
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
                        <span className="text-[10px] text-white/40">Total Orders</span>
                        <div className="font-mono font-bold text-white mt-0.5">{shop.total_orders || 142}</div>
                      </div>
                      <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
                        <span className="text-[10px] text-white/40">Status</span>
                        <div className="font-mono font-bold text-emerald-400 mt-0.5">Active</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
