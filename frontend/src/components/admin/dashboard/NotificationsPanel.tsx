"use client";

import { motion } from "framer-motion";
import { Bell, Info, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";
import type { AdminNotificationItem } from "@/services/adminDashboard";

interface NotificationsPanelProps {
  notifications: AdminNotificationItem[];
}

export default function NotificationsPanel({ notifications }: NotificationsPanelProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case "error":
        return <ShieldAlert className="h-4 w-4 text-red-400" />;
      default:
        return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case "warning":
        return "border-amber-500/20 bg-amber-500/5";
      case "success":
        return "border-emerald-500/20 bg-emerald-500/5";
      case "error":
        return "border-red-500/20 bg-red-500/5";
      default:
        return "border-blue-500/20 bg-blue-500/5";
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="deep-glass relative overflow-hidden rounded-3xl p-6 border border-white/10 shadow-xl mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">System Events & Alerts</h2>
          </div>
          <p className="text-xs text-zinc-400">Live platform logs and audit events</p>
        </div>

        {unreadCount > 0 && (
          <span className="rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-0.5 text-xs font-bold text-blue-300">
            {unreadCount} Unread
          </span>
        )}
      </div>

      {/* Notifications Grid */}
      {notifications.length === 0 ? (
        <div className="py-8 text-center text-xs font-medium text-zinc-400">
          No platform events currently logged.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 rounded-2xl border p-4 backdrop-blur-md transition-all hover:bg-white/[0.04] ${getBorderColor(
                item.type
              )}`}
            >
              <div className="mt-0.5 shrink-0">{getIcon(item.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-xs font-bold text-white leading-tight">{item.title}</h4>
                  {item.unread && (
                    <span className="h-2 w-2 rounded-full bg-blue-400 shrink-0 animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                  {item.message}
                </p>
                <p className="mt-2 text-[10px] font-mono text-zinc-400">
                  {new Date(item.created_at).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
