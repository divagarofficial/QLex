"use client";

import { Clock, Users, ArrowUpRight, Hourglass, CheckCircle2 } from "lucide-react";

interface QueueStatusCardProps {
  currentlyPrinting: string | null;
  yourPosition: number;
  studentsAhead: number;
  studentsBehind?: number;
  estimatedWaitMinutes: number;
  estimatedCompletionTime?: string;
  isCurrentPrinting?: boolean;
}

export default function QueueStatusCard({
  currentlyPrinting,
  yourPosition,
  studentsAhead,
  studentsBehind,
  estimatedWaitMinutes,
  estimatedCompletionTime,
  isCurrentPrinting = false,
}: QueueStatusCardProps) {
  return (
    <div className="w-full rounded-3xl bg-[#070b14]/80 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Live Queue Status</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Real-time shop counter status</p>
        </div>

        {isCurrentPrinting ? (
          <span className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-xs font-bold text-blue-300 animate-pulse">
            Printing Now 🖨️
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300">
            Live Updates
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* Currently Printing */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Currently Printing</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-2xl font-black font-mono text-cyan-300">
            {currentlyPrinting || "None"}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Shop counter token</p>
        </div>

        {/* Your Position */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Your Position</span>
            <Users className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {isCurrentPrinting ? "1st (Now)" : yourPosition > 0 ? `#${yourPosition}` : "Ready"}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {studentsAhead === 0 ? "You are next!" : `${studentsAhead} ahead of you`}
          </p>
        </div>

        {/* Estimated Waiting Time */}
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Est. Wait Time</span>
            <Hourglass className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-300">
            {estimatedWaitMinutes > 0 ? `~${estimatedWaitMinutes} min` : "< 1 min"}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {estimatedCompletionTime ? `Ready around ${estimatedCompletionTime}` : "Dynamic queue speed"}
          </p>
        </div>
      </div>
    </div>
  );
}
