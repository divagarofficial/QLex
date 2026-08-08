"use client";

import { Clock, Layers, Zap, ListOrdered } from "lucide-react";

interface QueueInsightsProps {
  estimatedWaitMinutes: number;
  liveQueueCount: number;
  priorityQueueCount: number;
  regularQueueCount: number;
}

export default function QueueInsights({
  estimatedWaitMinutes,
  liveQueueCount,
  priorityQueueCount,
  regularQueueCount,
}: QueueInsightsProps) {
  const cards = [
    {
      title: "Estimated Wait Time",
      value: `${estimatedWaitMinutes} mins`,
      desc: "Based on active jobs",
      icon: Clock,
      color: "text-amber-300",
    },
    {
      title: "Active Queue Count",
      value: `${liveQueueCount} orders`,
      desc: "Currently in shop pipeline",
      icon: Layers,
      color: "text-cyan-300",
    },
    {
      title: "Priority Queue",
      value: `${priorityQueueCount} orders`,
      desc: "High-priority queue",
      icon: Zap,
      color: "text-purple-300",
    },
    {
      title: "Regular Queue",
      value: `${regularQueueCount} orders`,
      desc: "Standard queue",
      icon: ListOrdered,
      color: "text-blue-300",
    },
  ];

  return (
    <div className="w-full rounded-3xl bg-[#070b14]/80 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white">Queue Insights</h3>
          <p className="text-xs text-slate-400 mt-0.5">Live shop workload statistics</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const IconComp = card.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="truncate">{card.title}</span>
                <IconComp className={`w-3.5 h-3.5 ${card.color} shrink-0`} />
              </div>
              <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
              <p className="text-[11px] text-slate-400 mt-1 truncate">{card.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
