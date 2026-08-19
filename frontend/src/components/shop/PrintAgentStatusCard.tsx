"use client";

import { useEffect, useState } from "react";
import { Printer, CheckCircle2, XCircle, Cpu, Zap, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { fetchPrintAgentHealth, type PrintAgentHealth } from "@/services/shop";

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
      const data = await fetchPrintAgentHealth();
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`deep-glass relative overflow-hidden rounded-3xl border p-5 shadow-2xl backdrop-blur-xl transition-colors duration-300 ${
        isConnected ? "border-white/10" : "border-red-500/20 bg-red-950/5"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            <p className="mt-0.5 text-xs text-zinc-400 flex items-center gap-1.5">
              <Cpu className={`h-3.5 w-3.5 ${isConnected ? "text-amber-400" : "text-zinc-500"}`} />
              <span>
                {isConnected
                  ? health.active_printers.length > 0
                    ? `Active Printers: ${health.active_printers.join(", ")}`
                    : "Multi-Printer Pool Active • Auto-assigning idle printers"
                  : "Agent Offline • Launch print_agent.py on shop Windows PC to connect"}
              </span>
            </p>
          </div>
        </div>

        {/* Right Section: Mode Toggle */}
        <div className="flex items-center gap-3">
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
    </motion.div>
  );
}
