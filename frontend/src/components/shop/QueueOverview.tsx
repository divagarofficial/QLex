"use client";

import { motion } from "framer-motion";
import { Users, Zap, ListOrdered, Clock, PlayCircle, ArrowRightCircle } from "lucide-react";
import type { TodayOrderItem, LiveQueueSummary } from "@/types/shop";

interface QueueOverviewProps {
  todaysOrders: TodayOrderItem[];
  liveQueue: LiveQueueSummary;
}

export default function QueueOverview({
  todaysOrders,
  liveQueue,
}: QueueOverviewProps) {
  // Filter waiting or printing orders
  const waitingOrders = todaysOrders.filter(
    (o) => o.queue_state === "WAITING" || o.queue_state === "PRINTING"
  );

  const totalQueueSize = waitingOrders.length || (liveQueue.priority_queue.length + liveQueue.regular_queue.length);
  const priorityCount = waitingOrders.filter((o) => o.is_priority).length || liveQueue.priority_queue.length;
  const regularCount = waitingOrders.filter((o) => !o.is_priority).length || liveQueue.regular_queue.length;

  const currentToken =
    todaysOrders.find((o) => o.is_current || o.queue_state === "PRINTING")?.token ||
    liveQueue.currently_printing ||
    "None";

  // Find next token in queue after current
  const remainingWaiting = waitingOrders.filter((o) => o.token !== currentToken);
  const nextToken = remainingWaiting[0]?.token || "None";

  const avgWaitMins = Math.max(1, totalQueueSize * 3);

  const items = [
    {
      title: "Queue Size",
      value: totalQueueSize.toString(),
      icon: Users,
      color: "text-blue-400",
    },
    {
      title: "Priority Waiting",
      value: priorityCount.toString(),
      icon: Zap,
      color: "text-amber-400",
    },
    {
      title: "Regular Waiting",
      value: regularCount.toString(),
      icon: ListOrdered,
      color: "text-zinc-300",
    },
    {
      title: "Currently Processing",
      value: currentToken,
      icon: PlayCircle,
      color: "text-emerald-400",
    },
    {
      title: "Next Token",
      value: nextToken,
      icon: ArrowRightCircle,
      color: "text-purple-400",
    },
    {
      title: "Avg Wait Time",
      value: `~${avgWaitMins} min`,
      icon: Clock,
      color: "text-yellow-400",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="deep-glass relative overflow-hidden rounded-3xl p-6 border border-white/10 shadow-xl"
    >
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Users className="h-5 w-5 text-amber-400" />
          <span>Queue Overview</span>
        </h3>
        <span className="text-xs font-semibold text-zinc-400">
          Real-time Dispatch Status
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md"
            >
              <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
                <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider truncate">
                  {item.title}
                </span>
              </div>
              <span className="text-lg font-black text-white block tracking-tight truncate">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
