"use client";

import { useEffect, useState } from "react";
import {
  Layers,
  Tag,
  Zap,
  Cpu,
  Globe,
  Calendar,
  CheckCircle2,
  Info,
} from "lucide-react";
import GlassCard from "@/components/glass/GlassCard";
import { PRODUCT_INFO } from "./creditsData";

export default function ProductInfoCard() {
  const [displayDate, setDisplayDate] = useState<string>(PRODUCT_INFO.lastUpdated);

  useEffect(() => {
    try {
      const now = new Date();
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      setDisplayDate(`${monthNames[now.getMonth()]} ${now.getFullYear()}`);
    } catch {
      setDisplayDate(PRODUCT_INFO.lastUpdated);
    }
  }, []);

  const infoItems = [
    {
      label: "Application Name",
      value: PRODUCT_INFO.name,
      icon: Layers,
      highlight: true,
    },
    {
      label: "Version",
      value: PRODUCT_INFO.version,
      icon: Tag,
      isBadge: true,
    },
    {
      label: "Release Channel",
      value: PRODUCT_INFO.releaseChannel,
      icon: Zap,
    },
    {
      label: "Build",
      value: PRODUCT_INFO.build,
      icon: Cpu,
    },
    {
      label: "Platform",
      value: PRODUCT_INFO.platform,
      icon: Globe,
    },
    {
      label: "Last Updated",
      value: displayDate,
      icon: Calendar,
    },
    {
      label: "Status",
      value: PRODUCT_INFO.status,
      icon: CheckCircle2,
      isStatus: true,
    },
  ];

  return (
    <section aria-label="Product Information" className="w-full flex justify-center">
      <div className="w-full max-w-2xl">
        <GlassCard>
          <div className="p-6 sm:p-8 md:p-10">
            {/* Header */}
            <div className="flex items-center justify-center gap-2 mb-6 text-center">
              <Info className="w-4 h-4 text-amber-400" />
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Product Information
              </h3>
            </div>

            {/* Grid of Key-Value Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {infoItems.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.025] border border-white/[0.06] backdrop-blur-md transition-all duration-300 hover:border-white/15 hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-white/[0.05] border border-white/[0.08] text-amber-300">
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-zinc-400">
                        {item.label}
                      </span>
                    </div>

                    {item.isStatus ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-sm">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span>{item.value}</span>
                      </div>
                    ) : item.isBadge ? (
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-400/10 border border-amber-400/25 text-amber-300 font-mono text-xs sm:text-sm font-semibold">
                        {item.value}
                      </span>
                    ) : item.highlight ? (
                      <span className="text-sm font-bold text-white gold-text">
                        {item.value}
                      </span>
                    ) : (
                      <span className="text-xs sm:text-sm font-medium text-zinc-200">
                        {item.value}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
