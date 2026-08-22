"use client";

import React from "react";
import Image from "next/image";
import { Info, Sparkles, Shield, Cpu, Code2, Heart } from "lucide-react";
import { AboutSectionState } from "./types";

interface AboutSectionTabProps {
  data: AboutSectionState;
}

export default function AboutSectionTab({ data }: AboutSectionTabProps) {
  return (
    <div className="space-y-6">
      {/* Brand Hero Card */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-500/15 via-[#070a0e]/80 to-blue-500/10 border border-amber-500/30 backdrop-blur-xl space-y-6 text-center sm:text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="h-64 w-64 text-amber-400" />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-500 p-0.5 shadow-[0_0_40px_rgba(231,200,115,0.3)] shrink-0">
            <div className="h-full w-full rounded-[22px] bg-[#030406] flex items-center justify-center">
              <span className="text-4xl font-black text-amber-400 font-sans tracking-tighter">Q</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-2xl font-black tracking-tight text-white font-sans">
                QLex Print Management Platform
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                v{data.qlexVersion}
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-xl">
              Next-generation high-concurrency cloud print queue orchestration and settlement network for colleges and institutions.
            </p>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10 text-left">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Release Channel</div>
            <div className="text-xs font-bold text-white mt-0.5">{data.releaseChannel}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Last Deployment</div>
            <div className="text-xs font-bold text-amber-400 mt-0.5">{data.lastDeployment}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Backend API</div>
            <div className="text-xs font-bold text-emerald-400 mt-0.5">FastAPI v{data.backendVersion}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Frontend Stack</div>
            <div className="text-xs font-bold text-cyan-400 mt-0.5">Next.js v{data.frontendVersion}</div>
          </div>
        </div>
      </div>

      {/* License & Attribution Card */}
      <div className="p-6 rounded-2xl bg-[#070a0e]/60 border border-white/10 backdrop-blur-xl space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">License & Attribution</h3>
            <p className="text-xs text-zinc-400">Legal notices, intellectual property, and engine ownership</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
            <div className="text-zinc-400 font-medium">Software License</div>
            <div className="text-white font-bold">{data.license}</div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
            <div className="text-zinc-400 font-medium">Copyright & Ownership</div>
            <div className="text-white font-bold">{data.copyright}</div>
          </div>
        </div>

        {/* Powered By MINDURA TECHNOLOGIES */}
        <div className="p-6 rounded-xl bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-violet-500/10 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center p-1 shadow-inner">
              <Image
                src="/mindura-logo.png"
                alt="Mindura Technologies"
                width={40}
                height={40}
                className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(231,200,115,0.4)]"
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Architected & Engineered By</div>
              <div className="text-base font-black text-amber-300 tracking-wide font-sans mt-0.5">
                {data.poweredBy}
              </div>
            </div>
          </div>

          <div className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
            <span>Built with precision for performance</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
