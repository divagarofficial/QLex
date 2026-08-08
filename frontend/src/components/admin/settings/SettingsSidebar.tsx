"use client";

import React from "react";
import {
  Globe,
  ToggleLeft,
  FileText,
  Bell,
  Shield,
  Layers,
  Palette,
  Cpu,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsSectionId } from "./types";

interface SettingsSidebarProps {
  activeTab: SettingsSectionId;
  onSelectTab: (tab: SettingsSectionId) => void;
  modifiedSections?: Set<SettingsSectionId>;
}

export const SETTINGS_SECTIONS = [
  { id: "general" as SettingsSectionId, label: "General", icon: Globe, desc: "Platform branding & contact" },
  { id: "platform" as SettingsSectionId, label: "Platform", icon: ToggleLeft, desc: "Toggles & maintenance" },
  { id: "orders" as SettingsSectionId, label: "Orders", icon: FileText, desc: "Limits & priority rules" },
  { id: "notifications" as SettingsSectionId, label: "Notifications", icon: Bell, desc: "Alerts & channels" },
  { id: "security" as SettingsSectionId, label: "Security", icon: Shield, desc: "Auth, OTP & policies" },
  { id: "integrations" as SettingsSectionId, label: "Integrations", icon: Layers, desc: "Razorpay, Storage & APIs" },
  { id: "appearance" as SettingsSectionId, label: "Appearance", icon: Palette, desc: "Themes & colors" },
  { id: "advanced" as SettingsSectionId, label: "Advanced", icon: Cpu, desc: "Backend metrics & logs" },
  { id: "about" as SettingsSectionId, label: "About", icon: Info, desc: "Versions & metadata" },
];

export default function SettingsSidebar({
  activeTab,
  onSelectTab,
  modifiedSections = new Set(),
}: SettingsSidebarProps) {
  return (
    <>
      {/* Desktop Sticky Navigation */}
      <nav className="hidden lg:block space-y-1.5 w-64 shrink-0 sticky top-24 self-start">
        <div className="px-3 pb-2">
          <p className="text-[10px] font-bold tracking-wider uppercase text-zinc-500">
            Navigation Sections
          </p>
        </div>

        {SETTINGS_SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeTab === sec.id;
          const isModified = modifiedSections.has(sec.id);

          return (
            <button
              key={sec.id}
              onClick={() => onSelectTab(sec.id)}
              className={cn(
                "w-full group relative flex items-center justify-between rounded-xl px-3.5 py-3 text-left text-xs font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-transparent text-white border border-amber-500/30 shadow-[0_0_20px_rgba(231,200,115,0.1)]"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white hover:border-white/10 border border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    isActive ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-zinc-400 group-hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs leading-tight">{sec.label}</div>
                  <div className="text-[10px] text-zinc-500 line-clamp-1">{sec.desc}</div>
                </div>
              </div>

              {isModified && (
                <span
                  className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                  title="Unsaved changes in this section"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Mobile & Tablet Horizontal Scroll Bar */}
      <div className="lg:hidden w-full overflow-x-auto no-scrollbar border-b border-white/10 pb-2 mb-4">
        <div className="flex items-center gap-2 min-w-max px-1">
          {SETTINGS_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeTab === sec.id;
            const isModified = modifiedSections.has(sec.id);

            return (
              <button
                key={sec.id}
                onClick={() => onSelectTab(sec.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border",
                  isActive
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(231,200,115,0.15)]"
                    : "bg-white/[0.04] text-zinc-400 border-white/10 hover:text-white"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{sec.label}</span>
                {isModified && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
