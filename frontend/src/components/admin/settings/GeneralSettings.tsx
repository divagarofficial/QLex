"use client";

import React from "react";
import { Globe, Mail, Phone, ExternalLink, Clock, Coins, Languages } from "lucide-react";
import { GeneralSettingsState } from "./types";

interface GeneralSettingsProps {
  data: GeneralSettingsState;
  onChange: (updated: Partial<GeneralSettingsState>) => void;
}

export default function GeneralSettings({ data, onChange }: GeneralSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Section Card */}
      <div className="p-6 rounded-2xl bg-[#070a0e]/60 border border-white/10 backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">General Information</h2>
            <p className="text-xs text-zinc-400">Basic identification and contact info for QLex Platform</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Platform Name */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
              <span>Platform Name</span>
            </label>
            <input
              type="text"
              value={data.platformName}
              onChange={(e) => onChange({ platformName: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
          </div>

          {/* Support Email */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-blue-400" />
              <span>Support Email</span>
            </label>
            <input
              type="email"
              value={data.supportEmail}
              onChange={(e) => onChange({ supportEmail: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
          </div>

          {/* Support Phone */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-emerald-400" />
              <span>Support Phone</span>
            </label>
            <input
              type="text"
              value={data.supportPhone}
              onChange={(e) => onChange({ supportPhone: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
          </div>

          {/* Official Website */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 text-cyan-400" />
              <span>Official Website</span>
            </label>
            <input
              type="text"
              value={data.officialWebsite}
              onChange={(e) => onChange({ officialWebsite: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span>Timezone</span>
            </label>
            <select
              value={data.timezone}
              onChange={(e) => onChange({ timezone: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all cursor-pointer [&>option]:bg-zinc-900"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</option>
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="America/New_York">America/New_York (EST - UTC-05:00)</option>
              <option value="Europe/London">Europe/London (GMT - UTC+00:00)</option>
            </select>
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
              <Coins className="h-3.5 w-3.5 text-amber-400" />
              <span>Currency</span>
            </label>
            <select
              value={data.currency}
              onChange={(e) => onChange({ currency: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all cursor-pointer [&>option]:bg-zinc-900"
            >
              <option value="INR">INR (₹ - Indian Rupee)</option>
              <option value="USD">USD ($ - US Dollar)</option>
              <option value="EUR">EUR (€ - Euro)</option>
            </select>
          </div>

          {/* Language */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
              <Languages className="h-3.5 w-3.5 text-violet-400" />
              <span>Default Platform Language</span>
            </label>
            <select
              value={data.language}
              onChange={(e) => onChange({ language: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all cursor-pointer [&>option]:bg-zinc-900"
            >
              <option value="English (US)">English (US)</option>
              <option value="English (UK)">English (UK)</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
