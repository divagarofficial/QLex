"use client";

import { AuditLogItem } from "@/services/adminPricing";
import { History, User, Clock, ArrowRight } from "lucide-react";

interface RecentChangesProps {
  logs: AuditLogItem[];
}

export default function RecentChanges({ logs }: RecentChangesProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/90 p-5 shadow-xl backdrop-blur-xl text-xs space-y-2">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Pricing Audit History</h3>
        </div>
        <p className="text-slate-400 italic text-[11px]">
          No pricing updates recorded during this session. Changes made by administrators will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/90 p-5 shadow-xl backdrop-blur-xl space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Pricing Audit Log & History</h3>
            <p className="text-xs text-slate-400">Track recent platform pricing modifications</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/60 px-2.5 py-0.5 rounded-full">
          {logs.length} Logged Action(s)
        </span>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
          >
            <div className="space-y-1">
              <span className="font-bold text-slate-200 block">{log.field_changed}</span>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-rose-400 line-through">{log.old_value}</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="text-emerald-400 font-bold">{log.new_value}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400 self-end sm:self-auto">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-slate-500" />
                {log.changed_by}
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-slate-500" />
                {new Date(log.changed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
