"use client";

import { Clock, CheckCircle2, ListOrdered, Calendar } from "lucide-react";

interface QueueInsightsProps {
  totalInQueue: number;
  completedTodayCount: number;
  estimatedTotalMinutes: number;
}

export default function QueueInsights({
  totalInQueue,
  completedTodayCount,
  estimatedTotalMinutes,
}: QueueInsightsProps) {
  // Estimated completion time of entire queue
  const now = new Date();
  const completionTime = new Date(now.getTime() + estimatedTotalMinutes * 60000);
  const formattedCompletionTime = completionTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const insights = [
    {
      title: "Average Wait Time",
      value: totalInQueue > 0 ? `~${Math.round(estimatedTotalMinutes / Math.max(totalInQueue, 1))} min` : "0 min",
      sub: "Per token in queue",
      icon: Clock,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Completed Today",
      value: `${completedTodayCount}`,
      sub: "Orders served today",
      icon: CheckCircle2,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Total Queue Length",
      value: `${totalInQueue}`,
      sub: "Active waiting tokens",
      icon: ListOrdered,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      title: "Est. Queue Clear Time",
      value: totalInQueue > 0 ? formattedCompletionTime : "Clear",
      sub: "When queue completes",
      icon: Calendar,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <div className="deep-glass relative overflow-hidden p-6 rounded-3xl border border-white/10 space-y-4">
      <div className="deep-glass-reflection" />
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-white/90">Queue Insights</h3>
        <p className="text-xs text-white/40 mb-4">
          Real-time metrics & performance data
        </p>

        <div className="grid grid-cols-2 gap-3">
          {insights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl bg-white/[0.03] border border-white/10 p-3.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">{item.title}</span>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-lg border ${item.color}`}
                  >
                    <Icon size={12} />
                  </div>
                </div>
                <div className="mt-2 font-mono text-xl font-bold text-white/90">
                  {item.value}
                </div>
                <div className="mt-0.5 text-[10px] text-white/40">{item.sub}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
