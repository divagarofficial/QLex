"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, User, Sparkles, Activity } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/common/Logo";
import NotificationMenu from "./NotificationMenu";

interface DashboardHeaderProps {
  onLogout: () => void;
}

export default function DashboardHeader({ onLogout }: DashboardHeaderProps) {
  const user = useAuthStore((s) => s.user);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "S";

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-4 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-2xl shadow-xl">
      {/* Left: Logo + System Status */}
      <div className="flex items-center gap-4">
        <Logo />
        <div className="hidden h-6 w-px bg-white/10 sm:block" />

        {/* Live Shop Active Badge */}
        <div className="hidden lg:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>Print Shop Active</span>
        </div>
      </div>

      {/* Right: Notifications + Profile + Separate Sign Out */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <NotificationMenu />

        {/* Profile Avatar + Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-1.5 sm:px-3 sm:py-1.5 transition-all duration-300 hover:border-amber-400/40 hover:bg-white/[0.08] hover:shadow-[0_0_20px_rgba(231,200,115,0.15)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            aria-label="Profile menu"
            aria-expanded={profileOpen}
          >
            {/* Monogram Avatar Box */}
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-xs font-black text-obsidian shadow-md">
              {initials}
            </div>

            <span className="hidden text-sm font-semibold text-white/90 sm:block">
              {user?.full_name?.split(" ")[0] || "Student"}
            </span>

            <ChevronDown
              size={14}
              className={`text-white/50 transition-transform duration-300 ${
                profileOpen ? "rotate-180 text-amber-300" : ""
              }`}
            />
          </button>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-3xl border border-white/[0.12] bg-[#0c0f16]/95 backdrop-blur-3xl shadow-[0_25px_60px_rgba(0,0,0,0.7)]"
              >
                {/* User info Header */}
                <div className="relative border-b border-white/[0.08] p-4 bg-white/[0.02]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-sm font-black text-obsidian shadow-md">
                      {initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {user?.full_name || "Student"}
                      </p>
                      <span className="text-[11px] font-medium text-amber-300/80">
                        Reg: {user?.register_number || "N/A"}
                      </span>
                    </div>
                  </div>

                  {user?.email && (
                    <p className="text-xs text-zinc-400 truncate font-mono">
                      {user.email}
                    </p>
                  )}
                </div>

                {/* Menu items */}
                <div className="p-2 space-y-1">
                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Account Details
                  </div>

                  {user?.department_name && (
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.02] text-xs text-zinc-300">
                      <span className="text-zinc-400">Department</span>
                      <span className="font-semibold text-white truncate max-w-[130px]">
                        {user.department_name}
                      </span>
                    </div>
                  )}

                  {user?.year_number && (
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.02] text-xs text-zinc-300">
                      <span className="text-zinc-400">Year & Section</span>
                      <span className="font-semibold text-white">
                        Year {user.year_number} ({user.section_name || "A"})
                      </span>
                    </div>
                  )}

                  <div className="my-1 border-t border-white/[0.06]" />

                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setProfileOpen(false);
                      onLogout();
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-rose-400 transition-colors duration-200 hover:bg-rose-500/10 cursor-pointer relative z-50 pointer-events-auto select-none"
                    aria-label="Sign out"
                  >
                    <LogOut size={16} className="pointer-events-none" />
                    <span className="pointer-events-none">Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Separate Sign Out Button in Header */}
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-400 transition-all duration-300 hover:border-rose-500/40 hover:bg-rose-500/20 hover:text-rose-300 cursor-pointer shadow-sm active:scale-95"
          aria-label="Sign Out"
          title="Sign Out"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
