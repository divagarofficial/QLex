"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Printer,
  MapPin,
  Phone,
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  ExternalLink,
} from "lucide-react";

import { getExpressOrderStatus, type ExpressOrderStatusResponse } from "@/services/expressOrders";

export default function PublicOrderTrackPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.orderId as string) || "";

  const [status, setStatus] = useState<ExpressOrderStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    async function fetchStatus() {
      try {
        const data = await getExpressOrderStatus(orderId);
        setStatus(data);
      } catch (err: any) {
        setError(err?.message || "Unable to find this print order.");
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 3500);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center p-6 text-white">
        <Loader2 className="w-10 h-10 text-champagne-400 animate-spin mb-4" />
        <p className="text-white/60 text-sm font-medium">Fetching live order status...</p>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-xl font-bold mb-2">Order Not Found</h1>
        <p className="text-white/60 text-sm max-w-sm mb-6">
          We could not locate this order. Please check the tracking link or ask at the counter.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/15 text-sm font-semibold"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const isReady = status.queue_state === "READY_FOR_PICKUP" || status.queue_state === "SERVED";
  const isPrinting = status.queue_state === "PRINTING";

  return (
    <div className="min-h-screen bg-obsidian text-white flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <h1 className="text-base font-bold">{status.shop_name}</h1>
          <p className="text-xs text-white/50">Live Print Tracker</p>
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
            isReady
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : isPrinting
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse"
              : "bg-white/10 text-white/70"
          }`}
        >
          {isReady ? "● Ready for Pickup" : isPrinting ? "● Printing Now" : "● In Queue"}
        </span>
      </div>

      {/* Main Token Hero */}
      <div className="my-auto py-6 space-y-6">
        <div className="p-6 rounded-3xl bg-gradient-to-b from-champagne-500/[0.12] to-white/[0.02] border border-champagne-500/30 shadow-2xl text-center relative overflow-hidden">
          <span className="text-xs text-champagne-300 uppercase font-semibold tracking-widest block mb-1">
            Your Pickup Token
          </span>

          <div className="my-3">
            <span className="text-6xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_30px_rgba(231,200,115,0.4)]">
              {status.token_number || "A-..."}
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs font-medium text-white/80">
            <Clock className="w-3.5 h-3.5 text-champagne-400" />
            <span>Est. Wait: ~{status.estimated_wait_minutes || 5} mins</span>
          </div>

          {/* Timeline progress */}
          <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-white">Paid</span>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                  isPrinting
                    ? "bg-amber-500/20 text-amber-400 animate-pulse"
                    : isReady
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-white/10 text-white/40"
                }`}
              >
                <Printer className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-white">Printing</span>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                  isReady
                    ? "bg-emerald-500 text-obsidian shadow-[0_0_12px_rgba(16,185,129,0.8)] font-bold"
                    : "bg-white/10 text-white/40"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-white">Pickup</span>
            </div>
          </div>
        </div>

        {/* Counter Info & Details */}
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3 text-xs">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-champagne-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">{status.shop_name}</p>
              <p className="text-white/60 text-[11px]">{status.shop_address || "Front Counter Display"}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex justify-between text-white/70 text-[11px]">
            <span>Files: {status.documents_count}</span>
            <span>Total Pages: {status.total_pages}</span>
            <span className="font-bold text-champagne-300">₹{Number(status.grand_total || 0).toFixed(2)} Paid</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 text-center">
        <p className="text-[11px] text-white/40">Keep this screen open or check your WhatsApp notification.</p>
      </div>
    </div>
  );
}
