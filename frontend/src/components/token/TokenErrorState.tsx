"use client";

import Link from "next/link";
import { AlertCircle, RefreshCw, ArrowLeft, TicketX, ShieldAlert, FileSearch } from "lucide-react";
import BackgroundEffects from "./BackgroundEffects";

interface TokenErrorStateProps {
  type?: "NOT_FOUND" | "CANCELLED" | "PENDING_PAYMENT" | "FETCH_ERROR" | string;
  message?: string;
  onRetry?: () => void;
}

export default function TokenErrorState({
  type = "NOT_FOUND",
  message,
  onRetry,
}: TokenErrorStateProps) {
  const getDetails = () => {
    switch (type) {
      case "CANCELLED":
        return {
          icon: TicketX,
          title: "Order Cancelled",
          subtitle: message || "This print order was cancelled. No token is active for collection.",
          color: "text-red-400 bg-red-500/10 border-red-500/20",
        };
      case "PENDING_PAYMENT":
        return {
          icon: ShieldAlert,
          title: "Payment Pending",
          subtitle: message || "Your payment is currently being verified. Please complete payment to generate your token.",
          color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        };
      case "FETCH_ERROR":
        return {
          icon: AlertCircle,
          title: "Unable to Fetch Data",
          subtitle: message || "We couldn't connect to the print server. Please check your connection and try again.",
          color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        };
      case "NOT_FOUND":
      default:
        return {
          icon: FileSearch,
          title: "No Token Found",
          subtitle: message || "You don't have an active print token yet. Your token will appear here once your order is created.",
          color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
        };
    }
  };

  const details = getDetails();
  const IconComp = details.icon;

  return (
    <div className="min-h-screen bg-[#030406] text-white flex items-center justify-center p-4 relative overflow-hidden">
      <BackgroundEffects />

      <div className="relative z-10 w-full max-w-md rounded-[32px] bg-[#070b14]/85 border border-white/15 p-8 text-center backdrop-blur-2xl shadow-2xl">
        {/* Glow Ring */}
        <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center border border-white/10 bg-white/[0.04] shadow-inner">
          <IconComp className={`w-10 h-10 ${details.color.split(" ")[0]}`} />
        </div>

        <h2 className="text-2xl font-extrabold text-white mb-2">{details.title}</h2>
        <p className="text-sm text-slate-300 mb-8 leading-relaxed">{details.subtitle}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Now</span>
            </button>
          )}

          <Link
            href="/student/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-medium text-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
