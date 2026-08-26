"use client";

import { useEffect, useState, useCallback } from "react";
import { Droplets, Printer, RefreshCw, AlertTriangle, CheckCircle2, Gauge, FileText, MapPin, Activity } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://qlex-backend-ybnb435gbq-el.a.run.app";

interface PrinterTelemetry {
  printer_name: string;
  status: string;
  black_toner: number | null;
  cyan_ink: number | null;
  magenta_ink: number | null;
  yellow_ink: number | null;
  paper_a4_status: string;
  paper_a3_status?: string;
  is_low_ink?: boolean;
  is_paper_jam?: boolean;
}

interface TerminalHealthResponse {
  status: string;
  is_connected: boolean;
  shop_name: string;
  terminal_location: string;
  last_seen: string;
  active_printers: PrinterTelemetry[];
}

export default function PrinterInkHealthWidget() {
  const token = useAuthStore((s) => s.token);
  const [healthData, setHealthData] = useState<TerminalHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchHealthData = useCallback(async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/shop/print-agent/health?shop_name=QLex%20Satellite%20Print%20Hub`, {
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      }
    } catch {
      setHealthData({
        status: "disconnected",
        is_connected: false,
        shop_name: "QLex Satellite Print Hub",
        terminal_location: "A103, Dept of AI & DS, 1st Floor, A Block",
        last_seen: "",
        active_printers: [],
      });
    } finally {
      setLoading(false);
      setLastRefreshed(new Date());
    }
  }, [token]);

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 15000);
    return () => clearInterval(interval);
  }, [fetchHealthData]);

  const printers = healthData?.active_printers || [];

  return (
    <div className="deep-glass p-6 rounded-3xl border border-emerald-500/25 space-y-5 bg-gradient-to-r from-emerald-950/20 via-slate-900/50 to-slate-950/60 shadow-[0_0_30px_rgba(16,185,129,0.06)]">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Droplets className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Printer Ink & Hardware Health</span>
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-white/70 flex items-center gap-1.5 pt-0.5">
            <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Terminal: <strong className="text-white">QLex Satellite Print Hub</strong> • <span className="text-emerald-300">Room A103, 1st Floor, A-Block</span></span>
          </p>
        </div>

        <button
          onClick={fetchHealthData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl hover:bg-emerald-500/20 transition cursor-pointer self-start sm:self-center"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Sync Meters</span>
        </button>
      </div>

      {/* Printer List & Ink Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {printers.map((p, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-emerald-500/30 transition-all space-y-4"
          >
            {/* Printer Info Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-800/80 border border-white/10 text-emerald-400">
                  <Printer className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">{p.printer_name}</h3>
                  <span className="text-[11px] text-white/50 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 inline" />
                    {p.status}
                  </span>
                </div>
              </div>

              {p.is_low_ink ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="h-3 w-3" />
                  Low Ink
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                  Hardware OK
                </span>
              )}
            </div>

            {/* Ink & Toner Levels Section */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">Ink / Toner Cartridge Meter</span>
                <span className="text-[10px] text-white/40">Auto-calibrated</span>
              </div>

              {/* Black Toner / Cartridge */}
              {p.black_toner !== null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-white/80 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-300 inline-block" />
                      Black Toner (K)
                    </span>
                    <span className={p.black_toner < 20 ? "text-amber-400 font-bold" : "text-emerald-300"}>
                      {p.black_toner}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        p.black_toner < 20 ? "bg-gradient-to-r from-amber-500 to-rose-500" : "bg-gradient-to-r from-emerald-500 to-teal-300"
                      }`}
                      style={{ width: `${p.black_toner}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Color Inks (Cyan, Magenta, Yellow) if available */}
              {p.cyan_ink !== null && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {/* Cyan */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-cyan-300">
                      <span>Cyan</span>
                      <span>{p.cyan_ink}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-cyan-400 transition-all duration-700" style={{ width: `${p.cyan_ink}%` }} />
                    </div>
                  </div>

                  {/* Magenta */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-pink-300">
                      <span>Magenta</span>
                      <span>{p.magenta_ink}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-pink-400 transition-all duration-700" style={{ width: `${p.magenta_ink}%` }} />
                    </div>
                  </div>

                  {/* Yellow */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-amber-300">
                      <span>Yellow</span>
                      <span>{p.yellow_ink}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-amber-300 transition-all duration-700" style={{ width: `${p.yellow_ink}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Paper Tray Status */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-white/60">
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-emerald-400" />
                <span>Paper Tray A4: <strong className="text-emerald-300 font-medium">{p.paper_a4_status}</strong></span>
              </span>
              {p.paper_a3_status && (
                <span className="text-[11px] text-white/50">A3: <strong className="text-white/80">{p.paper_a3_status}</strong></span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Widget Footer */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-white/50 gap-2 border-t border-white/5">
        <span className="flex items-center gap-1.5">
          <Gauge className="h-3.5 w-3.5 text-emerald-400" />
          <span>Telemetry Source: Local QLex Print Agent Daemon (Windows WMI / GDI Spooler)</span>
        </span>
        <span>Last synced: {lastRefreshed.toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
