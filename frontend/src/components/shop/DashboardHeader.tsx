"use client";

import Logo from "@/components/common/Logo";
import { Bell, LogOut, Store, ShieldCheck, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
  unreadNotificationCount: number;
  onToggleNotifications: () => void;
  hubTitle?: string;
  isSatellite?: boolean;
}

export default function DashboardHeader({
  unreadNotificationCount,
  onToggleNotifications,
  hubTitle = "QLex Central Print Hub",
  isSatellite = false,
}: DashboardHeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Lock workspace and navigate to shop login
    router.push("/shop/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/40 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 md:px-8">
        {/* Left: Logo + Dashboard Indicator */}
        <div className="flex items-center gap-4">
          <Logo />

          <div className="hidden h-6 w-px bg-white/10 sm:block" />

          <div className={`hidden items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold sm:flex ${isSatellite ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-amber-400/20 bg-amber-500/10 text-amber-300"}`}>
            <Store className={`h-3.5 w-3.5 ${isSatellite ? "text-emerald-400" : "text-amber-400"}`} />
            <span>{isSatellite ? "QLex Satellite Print Hub" : "QLex Central Print Hub"}</span>
          </div>
        </div>

        {/* Right: Notifications, Shop Name, Profile & Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notification Icon */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleNotifications}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadNotificationCount > 0 && (
              <span className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-black shadow-md animate-pulse ${isSatellite ? "bg-emerald-400" : "bg-amber-500"}`}>
                {unreadNotificationCount}
              </span>
            )}
          </motion.button>

          {/* Shop Name & Operator Profile */}
          <div className="hidden items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md md:flex">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-black shadow-sm font-bold text-xs ${isSatellite ? "bg-gradient-to-tr from-emerald-400 to-teal-300" : "bg-gradient-to-tr from-amber-500 to-yellow-400"}`}>
              <User className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white leading-none">{hubTitle}</p>
              <p className="text-[10px] text-zinc-400 leading-tight mt-0.5 flex items-center gap-1">
                <ShieldCheck className={`h-2.5 w-2.5 inline ${isSatellite ? "text-emerald-400" : "text-amber-400"}`} />
                <span>Operator</span>
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-300 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer"
            title="Lock Workspace / Logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
