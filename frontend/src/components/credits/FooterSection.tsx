"use client";

import { COPYRIGHT_INFO } from "./creditsData";

export default function FooterSection() {
  return (
    <footer className="relative w-full flex flex-col items-center justify-center text-center pt-10 pb-12">
      {/* Top Glass Border Divider Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* Copyright Notice */}
      <p className="text-xs sm:text-sm font-medium text-zinc-400 mb-2.5">
        {COPYRIGHT_INFO.text}
      </p>

      {/* Brand & Tagline */}
      <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.06] backdrop-blur-md text-xs text-zinc-400">
        <span className="font-bold text-amber-300 tracking-wide">
          {COPYRIGHT_INFO.brand}
        </span>
        <span className="text-zinc-600">•</span>
        <span className="tracking-widest uppercase text-[11px] text-zinc-400 font-medium">
          {COPYRIGHT_INFO.tagline}
        </span>
      </div>
    </footer>
  );
}
