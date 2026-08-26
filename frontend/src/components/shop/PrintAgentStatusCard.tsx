"use client";

import { useEffect, useState } from "react";
import { Printer, CheckCircle2, XCircle, Cpu, Zap, RefreshCw, Droplets, AlertTriangle, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { fetchPrintAgentHealth, type PrintAgentHealth, type PrinterTelemetry } from "@/services/shop";

export default function PrintAgentStatusCard() {
  const [autoPrintEnabled, setAutoPrintEnabled] = useState(true);
  const [health, setHealth] = useState<PrintAgentHealth>({
    status: "disconnected",
    is_connected: false,
    last_seen: "",
    active_printers: [],
  });
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    try {
      const data = await fetchPrintAgentHealth("QLex Central Print Hub");
      setHealth(data);
    } catch {
      setHealth({
        status: "disconnected",
        is_connected: false,
        last_seen: "",
        active_printers: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 5000); // Poll health every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const isConnected = health.is_connected;

  // Format active printer list as clean telemetry objects strictly from real print agent
  const rawPrinters = health.active_printers;
  const printerObjects: PrinterTelemetry[] = rawPrinters.map((p) => {
    if (typeof p === "string") {
      return {
        printer_name: p,
        status: "Online & Ready",
        black_toner: null,
        cyan_ink: null,
        magenta_ink: null,
        yellow_ink: null,
        paper_a4_status: "Ready",
        paper_a3_status: "Ready",
      };
    }
    return p;
  });

  const displayPrinters = isConnected ? printerObjects : [];
  const printerNamesString = displayPrinters.map((p) => p.printer_name).join(", ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`deep-glass relative overflow-hidden rounded-3xl border p-5 shadow-2xl backdrop-blur-xl transition-colors duration-300 ${
        isConnected ? "border-emerald-500/20 bg-slate-950/40" : "border-red-500/20 bg-red-950/5"
      }`}
    >
      <div className="flex flex-col gap-4">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left Section: Status & Icon */}
          <div className="flex items-center gap-3.5">
            <div
              className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-300 ${
                isConnected
                  ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400"
                  : "bg-zinc-800/50 border-zinc-700/50 text-zinc-500"
              }`}
            >
              <Printer className="h-6 w-6" />
              {isConnected ? (
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-black"></span>
                </span>
              ) : (
                <span className="absolute -bottom-0.5 -right-0.5 inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-black"></span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">Auto-Print Agent</h3>
                {loading ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                    <RefreshCw className="h-2.5 w-2.5 animate-spin" /> Checking...
                  </span>
                ) : isConnected ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                    <XCircle className="h-3 w-3" /> Disconnected
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-zinc-400 flex items-center gap-1.5 flex-wrap">
                <Cpu className={`h-3.5 w-3.5 ${isConnected ? "text-amber-400" : "text-zinc-500"}`} />
                <span>
                  {isConnected
                    ? displayPrinters.length > 0
                      ? `Active Pool (${displayPrinters.length} Printers): ${printerNamesString}`
                      : "Multi-Printer Pool Active • Auto-assigning idle printers"
                    : "Agent Offline • Launch print_agent.py on shop Windows PC to connect"}
                </span>
              </p>
            </div>
          </div>

          {/* Right Section: Mode Toggle */}
          <div className="flex items-center gap-3 self-start sm:self-center">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <Zap className={`h-4 w-4 ${autoPrintEnabled && isConnected ? "text-amber-400" : "text-zinc-500"}`} />
              <span className="text-xs font-semibold text-zinc-300">Auto Direct-Print</span>
              <button
                onClick={() => setAutoPrintEnabled(!autoPrintEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoPrintEnabled && isConnected ? "bg-amber-500" : "bg-zinc-700"
                }`}
                role="switch"
                aria-checked={autoPrintEnabled}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                    autoPrintEnabled && isConnected ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Ink / Toner Telemetry & Hardware Status Section */}
        {isConnected && displayPrinters.length > 0 && (
          <div className="mt-2 pt-3 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayPrinters.map((p, idx) => {
              const blackToner = p.black_toner;
              const cyanInk = p.cyan_ink;
              const magentaInk = p.magenta_ink;
              const yellowInk = p.yellow_ink;
              const isLow = p.is_low_ink || (blackToner !== null && blackToner !== undefined && blackToner < 20);
              const isJam = p.is_paper_jam || false;

              return (
                <div key={idx} className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                      <Droplets className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{p.printer_name}</span>
                    </span>

                    {isJam ? (
                      <span className="text-[10px] font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Paper Jam
                      </span>
                    ) : isLow ? (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Low Ink &lt;20%
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Hardware OK
                      </span>
                    )}
                  </div>

                  {/* Black Toner Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-white/70">Black Toner (K)</span>
                      {blackToner !== null && blackToner !== undefined ? (
                        <span className={blackToner < 20 ? "text-amber-400 font-bold" : "text-emerald-300 font-semibold"}>
                          {blackToner}%
                        </span>
                      ) : (
                        <span className="text-emerald-300 text-[10px] font-medium">Driver Active (Ready)</span>
                      )}
                    </div>
                    {blackToner !== null && blackToner !== undefined ? (
                      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            blackToner < 20 ? "bg-amber-500" : "bg-emerald-400"
                          }`}
                          style={{ width: `${blackToner}%` }}
                        />
                      </div>
                    ) : (
                      <div className="h-1.5 w-full rounded-full bg-emerald-500/20 border border-emerald-500/30 overflow-hidden">
                        <div className="h-full w-full bg-emerald-400/40" />
                      </div>
                    )}
                  </div>

                  {/* Color Ink Bars if available */}
                  {cyanInk !== null && (
                    <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                      <div>
                        <div className="flex justify-between text-[10px] text-cyan-300">
                          <span>C</span>
                          <span>{cyanInk}%</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full bg-cyan-400" style={{ width: `${cyanInk}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] text-pink-300">
                          <span>M</span>
                          <span>{magentaInk}%</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full bg-pink-400" style={{ width: `${magentaInk}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] text-amber-300">
                          <span>Y</span>
                          <span>{yellowInk}%</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full bg-amber-300" style={{ width: `${yellowInk}%` }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Paper Availability */}
                  <div className="pt-1 flex items-center justify-between text-[10px] text-white/50 border-t border-white/5">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3 text-emerald-400" />
                      Paper A4: <strong className="text-emerald-300">{p.paper_a4_status || "Ready"}</strong>
                    </span>
                    <span>A3: <strong className="text-white/80">{p.paper_a3_status || "Ready"}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
