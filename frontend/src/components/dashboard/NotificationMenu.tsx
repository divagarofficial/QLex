"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.04] transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.08] cursor-pointer"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={16} className="text-white/50" />
        {/* Unread indicator — API not available yet */}
        <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-champagne-400/40" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-champagne-400" />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-white/[0.08] bg-[rgba(18,18,22,0.96)] backdrop-blur-2xl shadow-2xl"
          >
            <div className="border-b border-white/[0.06] px-4 py-3">
              <p className="text-sm font-medium text-white/80">Notifications</p>
            </div>
            <div className="flex flex-col items-center px-4 py-8 text-center">
              <Bell size={24} className="text-white/20" />
              <p className="mt-3 text-sm text-white/40">
                No new notifications
              </p>
              <p className="mt-1 text-xs text-white/20">
                Order updates and alerts will appear here
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

