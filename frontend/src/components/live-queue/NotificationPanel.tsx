"use client";

import { useState } from "react";
import { Bell, Check, Printer, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface QueueNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "ADVANCED" | "PRINTING" | "READY" | "DELAYED" | "INFO";
  read: boolean;
}

interface NotificationPanelProps {
  notifications: QueueNotification[];
  onMarkAllAsRead?: () => void;
}

export default function NotificationPanel({
  notifications,
  onMarkAllAsRead,
}: NotificationPanelProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: QueueNotification["type"]) => {
    switch (type) {
      case "PRINTING":
        return <Printer size={14} className="text-emerald-400" />;
      case "READY":
        return <Check size={14} className="text-amber-400" />;
      case "DELAYED":
        return <AlertTriangle size={14} className="text-rose-400" />;
      case "ADVANCED":
      default:
        return <ArrowRight size={14} className="text-cyan-400" />;
    }
  };

  return (
    <div className="deep-glass relative overflow-hidden p-6 rounded-3xl border border-white/10">
      <div className="deep-glass-reflection" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Bell size={18} className="text-white/80" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-extrabold text-slate-950">
                  {unreadCount}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-white/90">Live Notifications</h3>
          </div>

          {unreadCount > 0 && onMarkAllAsRead && (
            <button
              onClick={onMarkAllAsRead}
              className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="py-6 text-center text-xs text-white/40">
            No queue notifications right now.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
            <AnimatePresence>
              {notifications.map((n) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-start gap-3 rounded-2xl p-3 text-xs transition-all border ${
                    n.read
                      ? "bg-white/[0.02] border-white/5 text-white/60"
                      : "bg-amber-500/[0.06] border-amber-500/20 text-white/90 shadow-sm"
                  }`}
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white/90">{n.title}</span>
                      <span className="text-[10px] text-white/40 font-mono">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-white/60 leading-relaxed">{n.message}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
