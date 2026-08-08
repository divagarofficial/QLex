"use client";

import {
  Hash,
  Store,
  Zap,
  FileText,
  Layers,
  Copy,
  Palette,
  CreditCard,
  Clock,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import type { OrderTokenData } from "@/types/token";

interface OrderDetailsProps {
  data: OrderTokenData;
}

export default function OrderDetails({ data }: OrderDetailsProps) {
  const rows = [
    {
      label: "Order ID",
      value: `#${data.order_id}`,
      icon: Hash,
      highlight: false,
      fontMono: true,
    },
    {
      label: "Shop",
      value: data.shop?.name || "Campus Xerox Center",
      icon: Store,
      highlight: true,
    },
    {
      label: "Priority",
      value: data.is_priority ? "High Priority Queue ⚡" : "Standard Queue",
      icon: Zap,
      badge: data.is_priority,
    },
    {
      label: "Documents",
      value: `${data.documents?.length || 1} Document(s)`,
      icon: FileText,
    },
    {
      label: "Total Pages",
      value: `${data.total_pages || 18} Pages`,
      icon: Layers,
    },
    {
      label: "Copies",
      value: `${data.total_copies || 2} Copies`,
      icon: Copy,
    },
    {
      label: "Print Mode",
      value:
        data.color_pages_count > 0
          ? `${data.color_pages_count} Color / ${data.bw_pages_count} B&W`
          : "Black & White",
      icon: Palette,
    },
    {
      label: "Amount Paid",
      value: `₹${data.total_amount || 47}`,
      icon: CreditCard,
      highlight: true,
      color: "text-emerald-400 font-bold",
    },
    {
      label: "Estimated Ready",
      value: `${data.estimated_wait_minutes || 10} Minutes`,
      icon: Clock,
      color: "text-cyan-300 font-semibold",
    },
    {
      label: "Payment Status",
      value: data.payment_status || "Paid",
      icon: data.payment_status === "PAID" ? CheckCircle2 : ShieldAlert,
      badgeStatus: true,
    },
  ];

  return (
    <div className="w-full rounded-3xl bg-[#070b14]/75 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Order Details</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Comprehensive print breakdown</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rows.map((row, idx) => {
          const IconComp = row.icon;

          return (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 shrink-0">
                  <IconComp className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-400">
                  {row.label}
                </span>
              </div>

              {row.badge ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Priority ⚡
                </span>
              ) : row.badgeStatus ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Paid
                </span>
              ) : (
                <span
                  className={`text-xs sm:text-sm text-right ${
                    row.fontMono ? "font-mono" : ""
                  } ${row.color ? row.color : "text-white font-medium"}`}
                >
                  {row.value}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
