"use client";

import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface RoleCardProps {
  title: string;
  badge?: string;
  description: string;
  icon: LucideIcon;
  href: string;
  accent: "blue" | "gold" | "violet" | "emerald";
}

const accentMap = {
  blue: {
    icon: "text-blue-400 border-blue-500/20 bg-blue-500/10",
    badge: "text-blue-400 border-blue-500/25 bg-blue-500/10",
    arrow: "group-hover:text-blue-400 group-hover:border-blue-400/40",
    glow: "rgba(59,130,246,0.08)",
  },
  gold: {
    icon: "text-[#E7C873] border-[#E7C873]/20 bg-[#E7C873]/10",
    badge: "text-[#E7C873] border-[#E7C873]/25 bg-[#E7C873]/10",
    arrow: "group-hover:text-[#E7C873] group-hover:border-[#E7C873]/40",
    glow: "rgba(231,200,115,0.08)",
  },
  violet: {
    icon: "text-violet-400 border-violet-500/20 bg-violet-500/10",
    badge: "text-violet-400 border-violet-500/25 bg-violet-500/10",
    arrow: "group-hover:text-violet-400 group-hover:border-violet-400/40",
    glow: "rgba(124,58,237,0.08)",
  },
  emerald: {
    icon: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    badge: "text-emerald-400 border-emerald-500/25 bg-emerald-500/10",
    arrow: "group-hover:text-emerald-400 group-hover:border-emerald-400/40",
    glow: "rgba(16,185,129,0.08)",
  },
};

export default function RoleCard({
  title,
  badge,
  description,
  icon: Icon,
  href,
  accent,
}: RoleCardProps) {
  const s = accentMap[accent];

  return (
    <Link href={href} className="group block h-full focus-visible:outline-none">
      <div className="deep-glass relative flex h-full min-h-[280px] flex-col p-6 sm:min-h-[340px] sm:p-7 md:min-h-[360px] md:p-8">
        {/* Environment reflection overlay */}
        <div className="deep-glass-reflection" />

        {/* Bottom rim cool light reflection */}
        <div className="deep-glass-rim" />

        {/* Light sweep on hover */}
        <div className="deep-glass-sweep" />

        {/* Accent ambient glow on hover */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-700 group-hover:opacity-100 max-md:hidden"
          style={{
            background: `radial-gradient(500px at 50% 50%, ${s.glow} 0%, transparent 60%)`,
          }}
        />

        {/* Badge & Icon Row */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className={`crystal-badge ${s.icon} transition-transform duration-500 group-hover:scale-105`}>
            <Icon size={24} className="transition-colors duration-500" />
          </div>
          {badge && (
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase backdrop-blur-md ${s.badge}`}>
              {badge}
            </span>
          )}
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold tracking-tight text-white/90 sm:text-xl group-hover:text-white transition-colors">
          {title}
        </h3>
        <p className="mt-2.5 flex-1 text-xs leading-relaxed text-white/45 sm:text-sm">
          {description}
        </p>

        {/* Premium crystal button */}
        <div className={`crystal-btn mt-6 sm:mt-8 flex items-center justify-between w-full border border-white/10 ${s.arrow}`}>
          <span className="font-medium tracking-wide">Continue as {title}</span>
          <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}


