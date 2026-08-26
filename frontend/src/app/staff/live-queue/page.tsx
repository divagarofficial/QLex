"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Activity, Building2, RefreshCw, Printer, MapPin } from "lucide-react";
import Link from "next/link";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { fetchLiveQueue } from "@/services/student";

export default function StaffLiveQueuePage() {
  const token = useAuthStore((s) => s.token);
  const [liveQueue, setLiveQueue] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadQueue = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetchLiveQueue(token);
      setLiveQueue(res);
    } catch {
      setLiveQueue(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

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

          <div className="deep-glass p-6 sm:p-8 rounded-3xl border border-emerald-500/20 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>QLex Satellite Print Hub (Room A103)</span>
                </div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Activity className="h-6 w-6 text-emerald-400" />
                  <span>Satellite Live Queue Traffic</span>
                </h1>
                <p className="text-xs text-white/70 mt-1 flex items-center gap-1.5 flex-wrap">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Location: <strong className="text-emerald-300 font-semibold">A103, Department of Artificial Intelligence and Data Science, First Floor, A Block</strong></span>
                </p>
              </div>

              <button
                onClick={loadQueue}
                className="px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-white/80 hover:bg-white/10 flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-center"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-white/50">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-400 mb-2" />
                <p className="text-xs">Fetching live queue state...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Current token box */}
                <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-center space-y-1">
                  <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">Currently Printing Token</span>
                  <p className="text-4xl font-extrabold text-white">
                    {liveQueue?.current_token || "None"}
                  </p>
                  <p className="text-xs text-emerald-300 font-medium">QLex Satellite Print Hub Terminal</p>
                  <p className="text-[11px] text-white/60">
                    📍 Address: A103, Department of Artificial Intelligence and Data Science, First Floor, A Block
                  </p>
                </div>

                {/* Queue Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
                    <span className="text-xs text-white/50">Priority Jobs Waiting</span>
                    <p className="text-2xl font-bold text-amber-400 mt-1">{liveQueue?.priority_queue_count || 0}</p>
                  </div>

                  <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
                    <span className="text-xs text-white/50">Regular Jobs Waiting</span>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">{liveQueue?.regular_queue_count || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
