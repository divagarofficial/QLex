"use client";

import { useState } from "react";
import Logo from "@/components/common/Logo";
import {
  Search,
  Bell,
  LogOut,
  RefreshCw,
  UserCheck,
  ShieldAlert,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardHeaderProps {
  unreadNotificationsCount?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function DashboardHeader({
  unreadNotificationsCount = 0,
  onRefresh,
  isRefreshing = false,
}: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/10 bg-[#030406]/80 backdrop-blur-2xl px-4 sm:px-6 py-3.5 transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Left: Logo & Section Indicator */}
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="transition-opacity hover:opacity-90">
            <Logo />
          </Link>
          <div className="hidden md:block h-6 w-px bg-white/10" />
          <div className="hidden md:flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>CONTROL CENTER</span>
          </div>
        </div>

        {/* Center: Global Search UI Placeholder */}
        <div className="hidden lg:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students, shops, tokens, orders..."
              className="w-full rounded-2xl bg-white/[0.04] border border-white/10 py-2 pl-10 pr-12 text-xs text-white placeholder-zinc-500 outline-none backdrop-blur-md transition-all focus:border-blue-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-blue-500/20"
            />
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
              <span className="text-[9px]">⌘</span>K
            </div>
          </div>
        </div>

        {/* Right: Actions, Refresh, Notifications, Profile, Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Refresh Button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh Dashboard Data"
              className="group flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 transition-transform ${
                  isRefreshing ? "animate-spin text-blue-400" : "group-hover:rotate-180 duration-500"
                }`}
              />
            </button>
          )}

          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <Bell className="h-4 w-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          </div>

          {/* Profile Dropdown Badge */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-1.5 px-3 text-left transition-all hover:border-white/20 hover:bg-white/10"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 font-bold text-white text-xs shadow-md">
                A
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-white leading-tight">QLex Admin</p>
                <p className="text-[10px] text-blue-400 leading-none">Super Administrator</p>
              </div>
              <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-zinc-400" />
            </button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-[#0a0d14]/95 p-2 shadow-2xl backdrop-blur-2xl z-50"
                >
                  <div className="p-2 border-b border-white/10">
                    <p className="text-xs font-bold text-white">Administrator</p>
                    <p className="text-[11px] text-zinc-400 truncate">admin@qlex.internal</p>
                  </div>

                  <div className="py-1">
                    <div className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 rounded-lg hover:bg-white/5 transition-colors cursor-default">
                      <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Privileges: Full Root Access</span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-white/10">
                    <Link
                      href="/admin/login"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Lock Admin Portal</span>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
