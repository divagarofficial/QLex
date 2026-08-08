"use client";

import React from "react";
import { Shield, KeyRound, Lock, Clock, UserCheck, ShieldAlert, FileText, Smartphone } from "lucide-react";
import { SecuritySettingsState } from "./types";
import { cn } from "@/lib/utils";

interface SecuritySettingsTabProps {
  data: SecuritySettingsState;
  onChange: (updated: Partial<SecuritySettingsState>) => void;
}

export default function SecuritySettingsTab({ data, onChange }: SecuritySettingsTabProps) {
  return (
    <div className="space-y-6">
      {/* Authentication Controls Card */}
      <div className="p-6 rounded-2xl bg-[#070a0e]/60 border border-white/10 backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Authentication & Identity Governance</h2>
            <p className="text-xs text-zinc-400">Manage verification requirements, OTP protocols, and session tokens</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Require Email Verification */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="space-y-0.5 pr-2">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-emerald-400" />
                <span>Mandatory Email Verification</span>
              </div>
              <p className="text-[11px] text-zinc-400">Requires students to verify campus email before ordering</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={data.requireEmailVerification}
              onClick={() => onChange({ requireEmailVerification: !data.requireEmailVerification })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                data.requireEmailVerification ? "bg-emerald-500" : "bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  data.requireEmailVerification ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Require OTP */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="space-y-0.5 pr-2">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-cyan-400" />
                <span>Require 2FA OTP for Admin & Vendors</span>
              </div>
              <p className="text-[11px] text-zinc-400">Enforces time-based OTP for sensitive administrative operations</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={data.requireOtp}
              onClick={() => onChange({ requireOtp: !data.requireOtp })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                data.requireOtp ? "bg-cyan-500" : "bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  data.requireOtp ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Audit Logging Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all md:col-span-2">
            <div className="space-y-0.5 pr-2">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-violet-400" />
                <span>Enable Security Audit Logs</span>
              </div>
              <p className="text-[11px] text-zinc-400">Records all administrative setting changes and authentication attempts</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={data.enableAuditLogs}
              onClick={() => onChange({ enableAuditLogs: !data.enableAuditLogs })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                data.enableAuditLogs ? "bg-violet-500" : "bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  data.enableAuditLogs ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Password & Token Policy Card */}
      <div className="p-6 rounded-2xl bg-[#070a0e]/60 border border-white/10 backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Password & Token Enforcement</h2>
            <p className="text-xs text-zinc-400">Password complexity rules, JWT secret expiration, and session timeouts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Min Password Length */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-violet-400" />
              <span>Minimum Password Length</span>
            </label>
            <input
              type="number"
              min="6"
              max="32"
              value={data.passwordMinLength}
              onChange={(e) => onChange({ passwordMinLength: parseInt(e.target.value) || 6 })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
            />
          </div>

          {/* JWT Expiry Minutes */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span>JWT Access Token Expiry (Minutes)</span>
            </label>
            <input
              type="number"
              min="15"
              max="43200"
              value={data.jwtExpiryMinutes}
              onChange={(e) => onChange({ jwtExpiryMinutes: parseInt(e.target.value) || 15 })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
            />
            <p className="text-[10px] text-zinc-500">Backend setting: ACCESS_TOKEN_EXPIRE_MINUTES</p>
          </div>

          {/* Session Timeout Minutes */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span>Idle Session Timeout (Minutes)</span>
            </label>
            <input
              type="number"
              min="5"
              max="1440"
              value={data.sessionTimeoutMinutes}
              onChange={(e) => onChange({ sessionTimeoutMinutes: parseInt(e.target.value) || 5 })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
            />
          </div>

          {/* Max Login Attempts */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
              <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
              <span>Max Failed Login Attempts Before Lockout</span>
            </label>
            <input
              type="number"
              min="3"
              max="20"
              value={data.maxLoginAttempts}
              onChange={(e) => onChange({ maxLoginAttempts: parseInt(e.target.value) || 3 })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
            />
          </div>

          {/* Lock Duration Minutes */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-rose-400" />
              <span>Account Lockout Duration (Minutes)</span>
            </label>
            <input
              type="number"
              min="5"
              max="1440"
              value={data.accountLockDurationMinutes}
              onChange={(e) => onChange({ accountLockDurationMinutes: parseInt(e.target.value) || 5 })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
