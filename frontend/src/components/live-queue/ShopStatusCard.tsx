"use client";

import { Store, Clock, Cpu, CheckCircle2, Layers } from "lucide-react";
import StatusChip, { StatusType } from "./StatusChip";

interface ShopStatusCardProps {
  shopStatus: StatusType | string;
  totalWaiting: number;
  currentlyPrinting: boolean;
}

export default function ShopStatusCard({
  shopStatus,
  totalWaiting,
  currentlyPrinting,
}: ShopStatusCardProps) {
  const activeOrdersCount = totalWaiting + (currentlyPrinting ? 1 : 0);

  return (
    <div className="deep-glass relative overflow-hidden p-6 rounded-3xl border border-white/10">
      <div className="deep-glass-reflection" />
      <div className="relative z-10 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Store size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white/90">
                QLex Print Hub
              </h3>
              <p className="text-xs text-white/40">Central Campus Terminal</p>
            </div>
          </div>

          <StatusChip status={shopStatus} />
        </div>

        {/* Grid Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-3.5">
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <Layers size={13} className="text-cyan-400" />
              <span>Active Orders</span>
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-white/90">
              {activeOrdersCount}
            </div>
            <div className="mt-0.5 text-[10px] text-white/40">
              In active queue
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-3.5">
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <Clock size={13} className="text-amber-400" />
              <span>Avg Processing</span>
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-white/90">
              3.5 min
            </div>
            <div className="mt-0.5 text-[10px] text-white/40">
              Per document batch
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-3.5">
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <Cpu size={13} className="text-emerald-400" />
              <span>Printers Active</span>
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-white/90">
              2 / 2
            </div>
            <div className="mt-0.5 text-[10px] text-white/40">
              High speed thermal
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-3.5">
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <CheckCircle2 size={13} className="text-indigo-400" />
              <span>Current Capacity</span>
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-white/90">
              {activeOrdersCount > 8 ? "85%" : activeOrdersCount > 4 ? "50%" : "20%"}
            </div>
            <div className="mt-0.5 text-[10px] text-white/40">
              Operational load
            </div>
          </div>
        </div>

        {/* Operating Hours Banner */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-3 text-center text-xs text-white/40">
          🕒 Hours: Monday – Saturday • 8:00 AM – 8:00 PM
        </div>
      </div>
    </div>
  );
}
