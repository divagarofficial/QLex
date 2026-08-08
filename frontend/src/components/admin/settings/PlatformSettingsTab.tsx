"use client";

import React from "react";
import { ToggleLeft, Wrench, ShieldAlert, Users, Store, ShieldCheck, UserPlus } from "lucide-react";
import { PlatformSettingsState } from "./types";
import { cn } from "@/lib/utils";

interface PlatformSettingsTabProps {
  data: PlatformSettingsState;
  onChange: (updated: Partial<PlatformSettingsState>) => void;
}

export default function PlatformSettingsTab({ data, onChange }: PlatformSettingsTabProps) {
  return (
    <div className="space-y-6">
      {/* Maintenance Mode Card */}
      <div className={cn(
        "p-6 rounded-2xl border transition-all backdrop-blur-xl",
        data.maintenanceMode
          ? "bg-amber-950/20 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)]"
          : "bg-[#070a0e]/60 border-white/10"
      )}>
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-xl border",
              data.maintenanceMode
                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                : "bg-white/5 text-zinc-400 border-white/10"
            )}>
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Maintenance Mode</h2>
                {data.maintenanceMode && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                Puts QLex into maintenance state for system upgrades. Backend enforced.
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={data.maintenanceMode}
            onClick={() => onChange({ maintenanceMode: !data.maintenanceMode })}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
              data.maintenanceMode ? "bg-amber-500" : "bg-zinc-700"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                data.maintenanceMode ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>

        {/* Maintenance Message */}
        <div className="mt-4 space-y-2">
          <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
            <span>Maintenance Message displayed to students & shops</span>
          </label>
          <textarea
            rows={2}
            value={data.maintenanceMessage}
            onChange={(e) => onChange({ maintenanceMessage: e.target.value })}
            placeholder="System is currently undergoing scheduled maintenance. Please check back shortly."
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all resize-none"
          />
        </div>
      </div>

      {/* Module Toggles Card */}
      <div className="p-6 rounded-2xl bg-[#070a0e]/60 border border-white/10 backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ToggleLeft className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Platform Modules & Access Control</h2>
            <p className="text-xs text-zinc-400">Enable or disable specific portals and registration routes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Platform Enabled / Allow New Orders */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="space-y-0.5 pr-2">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <span>Platform New Orders Enabled</span>
              </div>
              <p className="text-[11px] text-zinc-400">Controls backend order processing (allow_new_orders)</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={data.platformEnabled}
              onClick={() => onChange({ platformEnabled: !data.platformEnabled })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                data.platformEnabled ? "bg-emerald-500" : "bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  data.platformEnabled ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Student Portal Enabled */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="space-y-0.5 pr-2">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-blue-400" />
                <span>Student Portal Enabled</span>
              </div>
              <p className="text-[11px] text-zinc-400">Allows students to access live order queue and dashboard</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={data.studentPortalEnabled}
              onClick={() => onChange({ studentPortalEnabled: !data.studentPortalEnabled })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                data.studentPortalEnabled ? "bg-blue-500" : "bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  data.studentPortalEnabled ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Shop Portal Enabled */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="space-y-0.5 pr-2">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <Store className="h-3.5 w-3.5 text-amber-400" />
                <span>Shop Portal Enabled</span>
              </div>
              <p className="text-[11px] text-zinc-400">Enables print shop vendor terminals and fulfillment</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={data.shopPortalEnabled}
              onClick={() => onChange({ shopPortalEnabled: !data.shopPortalEnabled })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                data.shopPortalEnabled ? "bg-amber-500" : "bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  data.shopPortalEnabled ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Admin Portal Enabled (Locked) */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 opacity-75">
            <div className="space-y-0.5 pr-2">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Admin Portal Enabled</span>
              </div>
              <p className="text-[11px] text-zinc-400">System core locked to active state for administrator access</p>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
              System Locked
            </span>
          </div>

          {/* Student Registration Enabled */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="space-y-0.5 pr-2">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <UserPlus className="h-3.5 w-3.5 text-violet-400" />
                <span>Student Registration Enabled</span>
              </div>
              <p className="text-[11px] text-zinc-400">Allows new students to sign up with register numbers</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={data.registrationEnabled}
              onClick={() => onChange({ registrationEnabled: !data.registrationEnabled })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                data.registrationEnabled ? "bg-violet-500" : "bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  data.registrationEnabled ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* New Shop Registration */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
            <div className="space-y-0.5 pr-2">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <Store className="h-3.5 w-3.5 text-cyan-400" />
                <span>New Shop Onboarding</span>
              </div>
              <p className="text-[11px] text-zinc-400">Allows new vendors to submit shop partnership requests</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={data.newShopRegistration}
              onClick={() => onChange({ newShopRegistration: !data.newShopRegistration })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                data.newShopRegistration ? "bg-cyan-500" : "bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  data.newShopRegistration ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
