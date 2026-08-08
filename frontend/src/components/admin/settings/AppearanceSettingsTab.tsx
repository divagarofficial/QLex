"use client";

import React from "react";
import { Palette, Sun, Moon, Monitor, Check, Image as ImageIcon } from "lucide-react";
import { AppearanceSettingsState } from "./types";
import { cn } from "@/lib/utils";

interface AppearanceSettingsTabProps {
  data: AppearanceSettingsState;
  onChange: (updated: Partial<AppearanceSettingsState>) => void;
}

const ACCENT_COLORS = [
  { id: "amber", name: "Champagne Gold", hex: "#e7c873", class: "from-amber-400 to-yellow-500" },
  { id: "blue", name: "Ambient Blue", hex: "#3b82f6", class: "from-blue-500 to-cyan-400" },
  { id: "emerald", name: "Cyber Emerald", hex: "#10b981", class: "from-emerald-400 to-teal-500" },
  { id: "violet", name: "Royal Violet", hex: "#8b5cf6", class: "from-violet-500 to-purple-500" },
];

export default function AppearanceSettingsTab({ data, onChange }: AppearanceSettingsTabProps) {
  return (
    <div className="space-y-6">
      {/* Theme Selection Card */}
      <div className="p-6 rounded-2xl bg-[#070a0e]/60 border border-white/10 backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Platform Aesthetics & Themes</h2>
            <p className="text-xs text-zinc-400">Configure global visual interface mode and brand accent palette</p>
          </div>
        </div>

        {/* Theme Cards */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-zinc-300">Interface Theme</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Light Theme Option */}
            <button
              type="button"
              onClick={() => onChange({ platformTheme: "light" })}
              className={cn(
                "group relative flex flex-col items-center justify-center p-5 rounded-2xl border transition-all text-center",
                data.platformTheme === "light"
                  ? "bg-white/10 border-amber-400 text-white shadow-[0_0_20px_rgba(231,200,115,0.15)]"
                  : "bg-white/[0.02] border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
              )}
            >
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 mb-2">
                <Sun className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold">Light Mode</span>
              <span className="text-[10px] text-zinc-500 mt-0.5">High-contrast daytime glass</span>
              {data.platformTheme === "light" && (
                <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-amber-400 text-black flex items-center justify-center">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </button>

            {/* Dark Theme Option */}
            <button
              type="button"
              onClick={() => onChange({ platformTheme: "dark" })}
              className={cn(
                "group relative flex flex-col items-center justify-center p-5 rounded-2xl border transition-all text-center",
                data.platformTheme === "dark"
                  ? "bg-white/10 border-amber-400 text-white shadow-[0_0_20px_rgba(231,200,115,0.15)]"
                  : "bg-white/[0.02] border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
              )}
            >
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 mb-2">
                <Moon className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold">Dark Obsidian</span>
              <span className="text-[10px] text-zinc-500 mt-0.5">Deep VisionOS glassmorphism</span>
              {data.platformTheme === "dark" && (
                <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-amber-400 text-black flex items-center justify-center">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </button>

            {/* System Theme Option */}
            <button
              type="button"
              onClick={() => onChange({ platformTheme: "system" })}
              className={cn(
                "group relative flex flex-col items-center justify-center p-5 rounded-2xl border transition-all text-center",
                data.platformTheme === "system"
                  ? "bg-white/10 border-amber-400 text-white shadow-[0_0_20px_rgba(231,200,115,0.15)]"
                  : "bg-white/[0.02] border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
              )}
            >
              <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 mb-2">
                <Monitor className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold">System Sync</span>
              <span className="text-[10px] text-zinc-500 mt-0.5">Syncs with OS preferences</span>
              {data.platformTheme === "system" && (
                <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-amber-400 text-black flex items-center justify-center">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Accent Color Selection */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <label className="text-xs font-semibold text-zinc-300">Brand Accent Palette</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {ACCENT_COLORS.map((c) => {
              const isSelected = data.accentColor === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onChange({ accentColor: c.id })}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                    isSelected
                      ? "bg-white/10 border-white/30 text-white shadow-lg"
                      : "bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white"
                  )}
                >
                  <div className={cn("h-6 w-6 rounded-full bg-gradient-to-tr shadow-md shrink-0", c.class)} />
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-bold truncate">{c.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">{c.hex}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Brand Asset Previews */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <label className="text-xs font-semibold text-zinc-300">Brand Assets & Icons</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <span className="text-xl font-black text-amber-400">Q</span>
              </div>
              <div>
                <div className="text-xs font-bold text-white">Platform Logo</div>
                <div className="text-[11px] text-zinc-400">SVG vector icon active in header</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <ImageIcon className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Favicon Badge</div>
                <div className="text-[11px] text-zinc-400">25.9 KB ico active in root</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
