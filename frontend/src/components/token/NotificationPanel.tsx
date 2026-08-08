"use client";

import { Bell, CheckCircle2, Printer, Clock, AlertCircle } from "lucide-react";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "info" | "success" | "warning";
  read: boolean;
}

interface NotificationPanelProps {
  notifications: NotificationItem[];
  onMarkAllRead?: () => void;
}

export default function NotificationPanel({
  notifications,
  onMarkAllRead,
}: NotificationPanelProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="w-full rounded-3xl bg-[#070b14]/80 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Bell className="w-5 h-5 text-cyan-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Token Activity</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30">
                  {unreadCount} new
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">Live order status updates</p>
          </div>
        </div>

        {unreadCount > 0 && onMarkAllRead && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-xs">
          No recent activity for this token.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => {
            const Icon =
              item.type === "success"
                ? CheckCircle2
                : item.type === "warning"
                ? AlertCircle
                : Clock;

            return (
              <div
                key={item.id}
                className={`flex items-start justify-between gap-3 p-3.5 rounded-2xl border transition ${
                  item.read
                    ? "bg-white/[0.02] border-white/5 opacity-80"
                    : "bg-cyan-500/[0.04] border-cyan-500/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      item.type === "success"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : item.type === "warning"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{item.title}</p>
                    <p className="text-xs text-slate-300 mt-0.5">{item.message}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {item.timestamp}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
