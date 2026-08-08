"use client";

import React from "react";
import { Cpu, Terminal, Database, Server, Code, ShieldCheck, Activity } from "lucide-react";
import { AdvancedSettingsState } from "./types";

interface AdvancedSettingsTabProps {
  data: AdvancedSettingsState;
}

export default function AdvancedSettingsTab({ data }: AdvancedSettingsTabProps) {
  return (
    <div className="space-y-6">
      {/* System Metrics & Read-only Info Card */}
      <div className="p-6 rounded-2xl bg-[#070a0e]/60 border border-white/10 backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">System Runtime & Diagnostics</h2>
            <p className="text-xs text-zinc-400">
              Read-only system status variables gathered live from FastAPI engine & environment
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Debug Mode */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <Terminal className="h-4 w-4 text-amber-400" />
                <span>Debug Mode</span>
              </div>
              <p className="text-[11px] text-zinc-400">FastAPI backend debug & SQL echo flags</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                data.debugMode
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              }`}
            >
              {data.debugMode ? "ENABLED (True)" : "DISABLED (False)"}
            </span>
          </div>

          {/* Read-Only Mode */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span>Read Only Storage Mode</span>
              </div>
              <p className="text-[11px] text-zinc-400">Database write lock status</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                data.readOnlyMode
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              }`}
            >
              {data.readOnlyMode ? "ACTIVE" : "INACTIVE (Read/Write)"}
            </span>
          </div>

          {/* API Version */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <Code className="h-4 w-4 text-violet-400" />
                <span>API Version</span>
              </div>
              <p className="text-[11px] text-zinc-400">FastAPI route specification</p>
            </div>
            <span className="text-xs font-mono font-bold text-violet-300">{data.apiVersion}</span>
          </div>

          {/* Database Version */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-400" />
                <span>Database Engine & Driver</span>
              </div>
              <p className="text-[11px] text-zinc-400">SQLAlchemy / PostgreSQL</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-300">{data.databaseVersion}</span>
          </div>

          {/* Server Version */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <Server className="h-4 w-4 text-emerald-400" />
                <span>Server Health & Runtime</span>
              </div>
              <p className="text-[11px] text-zinc-400">Python 3.12 / Uvicorn server</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-300">{data.serverVersion}</span>
          </div>

          {/* Environment */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-400" />
                <span>Execution Environment</span>
              </div>
              <p className="text-[11px] text-zinc-400">Target deployment stage</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-300 uppercase">{data.environment}</span>
          </div>
        </div>

        {/* System Log Stream */}
        <div className="space-y-2 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-amber-400" />
              <span>Live System Log Buffer</span>
            </label>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              STREAMING
            </span>
          </div>
          <div className="p-4 rounded-xl bg-black/70 border border-white/10 font-mono text-[11px] text-zinc-300 leading-relaxed overflow-x-auto">
            {data.systemLogsStatus}
          </div>
        </div>
      </div>
    </div>
  );
}
