"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/common/Logo";
import {
  LayoutDashboard,
  PackageSearch,
  Printer,
  DollarSign,
  Receipt,
  QrCode,
  RefreshCw,
  LogOut,
  Store,
} from "lucide-react";

interface NonCollegeShopHeaderProps {
  shopName: string;
  shopSlug: string;
  activeTab: "dashboard" | "orders" | "queue" | "pricing" | "settlements";
  onRefresh?: () => void;
  onShowQR?: () => void;
  loading?: boolean;
}

export default function NonCollegeShopHeader({
  shopName,
  shopSlug,
  activeTab,
  onRefresh,
  onShowQR,
  loading = false,
}: NonCollegeShopHeaderProps) {
  const router = useRouter();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: `/shop/${shopSlug}/dashboard`,
    },
    {
      id: "orders",
      label: "Orders Workbench",
      icon: PackageSearch,
      href: `/shop/${shopSlug}/orders`,
    },
    {
      id: "queue",
      label: "Live Print Queue",
      icon: Printer,
      href: `/shop/${shopSlug}/queue`,
    },
    {
      id: "pricing",
      label: "Rate Card",
      icon: DollarSign,
      href: `/shop/${shopSlug}/pricing`,
    },
    {
      id: "settlements",
      label: "Settlements & Payouts",
      icon: Receipt,
      href: `/shop/${shopSlug}/settlements`,
    },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0d111a]/90 backdrop-blur-xl shadow-2xl">
      {/* Top Header Row */}
      <div className="px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <Logo size="md" />
          <div className="h-5 w-px bg-white/20 hidden sm:block" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
                <Store className="w-3 h-3" /> External Partner Hub
              </span>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Terminal
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight mt-0.5 flex items-center gap-2">
              {shopName}
            </h1>
          </div>
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
              <span className="hidden md:inline">Refresh</span>
            </button>
          )}

          {onShowQR && (
            <button
              onClick={onShowQR}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Counter QR Code</span>
            </button>
          )}

          <button
            onClick={() => router.push("/shop/login")}
            className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer text-xs font-semibold flex items-center gap-1.5"
            title="Switch Hub / Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Exit</span>
          </button>
        </div>
      </div>

      {/* Navigation Cards / Tabs Bar */}
      <div className="px-4 lg:px-8 border-t border-white/5 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
