"use client";

import { motion } from "framer-motion";
import { Store, ShieldCheck, Clock, FileText, DollarSign, Receipt, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { AdminShopItem } from "@/services/adminDashboard";

interface ShopCardProps {
  shop: AdminShopItem;
}

export default function ShopCard({ shop }: ShopCardProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val);

  const isOnline = shop.status?.toUpperCase() === "ONLINE";

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="deep-glass relative overflow-hidden rounded-3xl p-6 border border-white/10 shadow-xl transition-all duration-300 hover:border-white/20 hover:shadow-2xl flex flex-col justify-between"
    >
      {/* Top Rim Sunlight Highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />

      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-500/10 backdrop-blur-xl shadow-md">
              <Store className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-snug">{shop.name}</h3>
              <p className="text-[11px] font-medium text-zinc-400">ID: {shop.shop_id}</p>
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              isOnline
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border border-amber-500/30 bg-amber-500/10 text-amber-400"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isOnline ? "bg-emerald-400 animate-ping" : "bg-amber-400"
              }`}
            />
            <span>{shop.status}</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400 mb-1">
              <FileText className="h-3 w-3 text-blue-400" />
              <span>Orders Today</span>
            </div>
            <p className="text-lg font-bold text-white">{shop.orders_today}</p>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400 mb-1">
              <Clock className="h-3 w-3 text-amber-400" />
              <span>Waiting Queue</span>
            </div>
            <p className="text-lg font-bold text-white">{shop.orders_waiting}</p>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400 mb-1">
              <DollarSign className="h-3 w-3 text-emerald-400" />
              <span>Revenue Today</span>
            </div>
            <p className="text-sm font-bold text-emerald-300">
              {formatCurrency(shop.revenue_today)}
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400 mb-1">
              <Receipt className="h-3 w-3 text-yellow-400" />
              <span>Pending Settlement</span>
            </div>
            <p className="text-sm font-bold text-yellow-300">
              {formatCurrency(shop.pending_settlement)}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/10">
        <Link
          href="/shop/dashboard"
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-xs font-semibold text-zinc-300 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          <span>View Shop</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/admin/shops"
          className="inline-flex items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 py-2 px-4 text-xs font-semibold text-amber-300 backdrop-blur-md transition-all hover:bg-amber-500/20"
        >
          <span>Manage</span>
        </Link>
      </div>
    </motion.div>
  );
}
