"use client";

import { ServiceRule } from "@/services/adminPricing";
import { Wrench, Lock } from "lucide-react";

interface FinishingServicesCardProps {
  services: ServiceRule[];
}

export default function FinishingServicesCard({ services }: FinishingServicesCardProps) {
  if (services.length === 0) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/90 p-5 shadow-xl backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-500/10 text-slate-300 border border-slate-700">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Finishing Services Reference</h3>
            <p className="text-xs text-slate-400">
              Binding and finishing service rates configured by the shop — read-only
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-400 bg-slate-800 border border-slate-700">
          <Lock className="w-3 h-3" />
          Read Only
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {services.map((svc) => (
          <div
            key={svc.id}
            className={`p-4 rounded-xl border ${
              svc.is_active
                ? "bg-slate-950/40 border-slate-800/70"
                : "bg-slate-950/20 border-slate-900 opacity-50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-200 font-bold">{svc.name}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  svc.is_active
                    ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                    : "text-rose-400 bg-rose-500/10 border border-rose-500/20"
                }`}
              >
                {svc.is_active ? "ACTIVE" : "INACTIVE"}
              </span>
            </div>

            {svc.description && (
              <p className="text-[11px] text-slate-500 mb-2">{svc.description}</p>
            )}

            <div className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-slate-900/60 border border-slate-800/50 text-slate-300 font-mono font-bold">
              ₹{svc.price.toFixed(2)}
              <Lock className="w-3 h-3 text-slate-600 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
