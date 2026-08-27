"use client";

import React, { useState } from "react";
import { Mail, Phone, Copy, Check, Headphones, ExternalLink, ShieldCheck, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface SupportCardProps {
  className?: string;
  variant?: "default" | "compact" | "sidebar";
}

export default function SupportCard({ className, variant = "default" }: SupportCardProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const supportMail = "minduratechnologies@gmail.com";
  const founders = [
    { name: "DIVAGAR E", title: "FOUNDER", email: "divagareofficial10@gmail.com", phone: "+91 9360087608" },
    { name: "THIRUMALAI D", title: "FOUNDER", email: "thirudillimuthu@gmail.com", phone: "+91 7550231600" },
  ];

  if (variant === "compact") {
    return (
      <div className={cn("p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl space-y-3", className)}>
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
          <Headphones className="h-4 w-4" />
          <span>Support & Helpdesk</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-2 truncate">
              <Mail className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="text-zinc-300 font-mono text-[11px] truncate">{supportMail}</span>
            </div>
            <button
              onClick={() => handleCopy(supportMail)}
              className="p-1 text-zinc-400 hover:text-white transition-colors"
              title="Copy Support Email"
            >
              {copiedText === supportMail ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>

          {founders.map((f) => (
            <div key={f.phone} className="p-2 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-white">{f.name} ({f.title})</span>
                <a href={`tel:${f.phone.replace(/\s+/g, "")}`} className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[10px]">
                  <Phone className="h-3 w-3" />
                  {f.phone}
                </a>
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                <span className="truncate">{f.email}</span>
                <button onClick={() => handleCopy(f.email)} className="hover:text-white">
                  {copiedText === f.email ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "deep-glass relative overflow-hidden p-6 sm:p-7 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b0e14]/90 via-[#07090e]/80 to-[#030406]/95 backdrop-blur-2xl shadow-2xl",
      className
    )}>
      {/* Background Lighting Glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 via-amber-500/10 to-amber-600/5 border border-amber-500/30 text-amber-400 shadow-md">
            <Headphones className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">Support & Assistance</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Mindura Technologies
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Need technical help or have queries? Reach out directly to our support team and founders.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium shrink-0 self-start sm:self-center">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>Support Active</span>
        </div>
      </div>

      {/* Main Grid: Email + Founders Contact Info */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Email Support Card */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-amber-500/30 transition-all space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Mail className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Official Support Email
              </span>
            </div>
            <a
              href={`mailto:${supportMail}`}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1 hover:underline"
            >
              <span>Mail</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-amber-300">
            <span className="truncate">{supportMail}</span>
            <button
              onClick={() => handleCopy(supportMail)}
              className="ml-2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors shrink-0"
              title="Copy Email"
            >
              {copiedText === supportMail ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-sans font-bold">
                  <Check className="h-3.5 w-3.5" /> Copied
                </span>
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            For general technical assistance, system issues, vendor inquiries, or service feedback.
          </p>
        </div>

        {/* Founder Phone & Direct Contact */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition-all space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Phone className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Direct Founder Contacts
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              Emergency & Escalation
            </span>
          </div>

          <div className="space-y-2.5">
            {founders.map((f) => (
              <div
                key={f.phone}
                className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-cyan-400" />
                    <span>{f.name}</span>
                    <span className="text-[10px] text-cyan-300/80 font-mono bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">
                      ({f.title})
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-2">
                    <span className="truncate">{f.email}</span>
                    <button
                      onClick={() => handleCopy(f.email)}
                      className="text-zinc-500 hover:text-white transition-colors"
                      title="Copy Founder Email"
                    >
                      {copiedText === f.email ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`tel:${f.phone.replace(/\s+/g, "")}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-semibold hover:bg-cyan-500/20 hover:border-cyan-400 transition-all"
                  >
                    <Phone className="h-3.5 w-3.5 text-cyan-400" />
                    <span>{f.phone}</span>
                  </a>
                  <button
                    onClick={() => handleCopy(f.phone)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors"
                    title="Copy Phone Number"
                  >
                    {copiedText === f.phone ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
