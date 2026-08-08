"use client";

import { motion } from "framer-motion";
import { Zap, Clock, Printer, UserCheck, Shield } from "lucide-react";

interface LiveQueueListProps {
  currentlyPrinting: string | null;
  priorityQueue: string[];
  regularQueue: string[];
  myToken: string | null;
}

export default function LiveQueueList({
  currentlyPrinting,
  priorityQueue,
  regularQueue,
  myToken,
}: LiveQueueListProps) {
  const totalCount =
    (currentlyPrinting ? 1 : 0) + priorityQueue.length + regularQueue.length;

  return (
    <div className="deep-glass relative overflow-hidden p-6 rounded-3xl border border-white/10">
      <div className="deep-glass-reflection" />
      <div className="relative z-10 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white/90">Live Queue Sequence</h3>
            <p className="text-xs text-white/50">
              Privacy-protected sequence (Token numbers only)
            </p>
          </div>
          <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-300">
            {totalCount} Active {totalCount === 1 ? "Token" : "Tokens"}
          </span>
        </div>

        {totalCount === 0 ? (
          <div className="py-8 text-center text-sm text-white/40">
            No tokens waiting in queue right now.
          </div>
        ) : (
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
            {/* Currently Printing Item */}
            {currentlyPrinting && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Printer size={12} className="animate-bounce text-amber-400" />
                  Currently Printing
                </span>
                <QueueItem
                  token={currentlyPrinting}
                  isCurrentPrinting
                  isMyToken={currentlyPrinting === myToken}
                />
              </div>
            )}

            {/* Priority Queue Section */}
            {priorityQueue.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap size={12} className="text-amber-400 fill-amber-400" />
                  Priority Queue ({priorityQueue.length})
                </span>
                <div className="space-y-2">
                  {priorityQueue.map((token, idx) => (
                    <QueueItem
                      key={token}
                      token={token}
                      position={idx + 1}
                      isPriority
                      isMyToken={token === myToken}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Queue Section */}
            {regularQueue.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={12} />
                  Regular Queue ({regularQueue.length})
                </span>
                <div className="space-y-2">
                  {regularQueue.map((token, idx) => (
                    <QueueItem
                      key={token}
                      token={token}
                      position={priorityQueue.length + idx + 1}
                      isMyToken={token === myToken}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface QueueItemProps {
  token: string;
  position?: number;
  isCurrentPrinting?: boolean;
  isPriority?: boolean;
  isMyToken?: boolean;
}

function QueueItem({
  token,
  position,
  isCurrentPrinting = false,
  isPriority = false,
  isMyToken = false,
}: QueueItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`relative flex items-center justify-between rounded-2xl p-3.5 transition-all border ${
        isMyToken
          ? "bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 border-amber-400/60 shadow-lg shadow-amber-500/10"
          : isCurrentPrinting
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          : isPriority
          ? "bg-amber-500/[0.04] border-amber-500/20 text-white/90"
          : "bg-white/[0.02] border-white/10 text-white/80"
      }`}
    >
      <div className="flex items-center gap-3">
        {isCurrentPrinting ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
            <Printer size={16} className="animate-pulse" />
          </div>
        ) : isPriority ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300">
            <Zap size={16} className="fill-amber-300" />
          </div>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 font-mono text-xs">
            #{position}
          </div>
        )}

        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-bold tracking-wider">
              {token}
            </span>
            {isMyToken && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold text-slate-950 shadow-sm">
                <UserCheck size={11} /> YOU
              </span>
            )}
          </div>
          <span className="text-[11px] text-white/40">
            {isCurrentPrinting
              ? "On print bed"
              : isPriority
              ? "Priority queue entry"
              : "Standard queue entry"}
          </span>
        </div>
      </div>

      <div>
        {isCurrentPrinting ? (
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
        ) : isMyToken ? (
          <span className="text-xs font-semibold text-amber-300">Your Turn Soon</span>
        ) : (
          <Shield size={14} className="text-white/20" />
        )}
      </div>
    </motion.div>
  );
}
