"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Landmark,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  RefreshCw,
  User,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import DashboardHeader from "@/components/shop/DashboardHeader";
import { fetchTodaysOrders } from "@/services/shop";
import type { TodayOrderItem } from "@/types/shop";

const SATELLITE_HUB = "QLex Satellite Print Hub";

export default function SatelliteShopSettlementsPage() {
  const [loading, setLoading] = useState(true);
  const [todaysOrders, setTodaysOrders] = useState<TodayOrderItem[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchTodaysOrders(SATELLITE_HUB).catch(() => []);
      setTodaysOrders(res);
    } catch (err) {
      console.error("Error loading Satellite audit:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalPagesPrinted = todaysOrders.reduce((acc, o) => acc + (o.total_pages || 1), 0);

  return (
    <div className="min-h-screen bg-[#030406] text-white font-sans selection:bg-emerald-500/30">
      <DashboardHeader
        unreadNotificationCount={todaysOrders.length}
        onToggleNotifications={() => {}}
        hubTitle="Satellite Hub Terminal"
        isSatellite={true}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-8 space-y-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-emerald-950/60 border border-emerald-500/25 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Landmark className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Departmental Audit Ledger</span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Institution Funded
                </span>
              </div>
              <h1 className="text-2xl font-black text-white mt-0.5">Satellite Print Ledger & Usage Audit</h1>
            </div>
          </div>

          <button
            onClick={() => loadData()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all cursor-pointer text-emerald-300"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
            <span>Refresh Ledger</span>
          </button>
        </div>

        {/* Audit Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl border border-emerald-500/20 bg-emerald-950/15 space-y-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-400">Today's Staff Print Jobs</span>
            <div className="text-3xl font-black text-white">{todaysOrders.length}</div>
            <p className="text-xs text-zinc-400">Processed at Terminal Desk A103</p>
          </div>

          <div className="p-6 rounded-3xl border border-white/10 bg-white/5 space-y-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-cyan-400">Total Spooled Pages</span>
            <div className="text-3xl font-black text-white">{totalPagesPrinted} Pages</div>
            <p className="text-xs text-zinc-400">Double-sided & Single-sided A4/A3</p>
          </div>

          <div className="p-6 rounded-3xl border border-white/10 bg-white/5 space-y-2">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-400">Institutional Settlement</span>
            <div className="text-3xl font-black text-white">Direct Transfer</div>
            <p className="text-xs text-zinc-400">Funded via Campus IT Operations</p>
          </div>
        </div>

        {/* Usage Log Table */}
        <div className="p-6 rounded-3xl border border-white/10 bg-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
              <span>Today's Staff Print Log Audit</span>
            </h3>
            <span className="text-xs text-zinc-400">Terminal A103 • AI & Data Science</span>
          </div>

          {todaysOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400 font-medium">
              No staff print transactions recorded in today's ledger.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 text-zinc-400 uppercase font-bold">
                  <tr>
                    <th className="py-3 px-4">S-Token</th>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Pages</th>
                    <th className="py-3 px-4">Color & Mode</th>
                    <th className="py-3 px-4">Queue Status</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-200 font-medium">
                  {todaysOrders.map((o) => (
                    <tr key={o.order_id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-extrabold text-emerald-400">{o.token || "S-..."}</td>
                      <td className="py-3 px-4 font-bold text-white">{o.student_name}</td>
                      <td className="py-3 px-4">{o.total_pages || 1} pgs</td>
                      <td className="py-3 px-4 text-zinc-400">{o.color_mode || "B&W"} • {o.duplex_mode || "Single"}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {o.queue_state || "SERVED"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-500">{o.created_at ? new Date(o.created_at).toLocaleTimeString() : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
