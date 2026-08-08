"use client";

import { motion } from "framer-motion";
import { Shield, Sparkles, Zap, Layers, ToggleLeft, ToggleRight, Lock } from "lucide-react";
import type { PlatformSettings } from "@/services/shopPricing";
import type { ServiceConfig } from "@/types/orders";

interface AdditionalChargesCardProps {
  platformSettings: PlatformSettings | null;
  convenienceFee: number;
  servicesConfigs: ServiceConfig[];
  onServiceChange: (id: string, field: "price" | "is_active", value: number | boolean) => void;
  errors: Record<string, string>;
}

export default function AdditionalChargesCard({
  platformSettings,
  convenienceFee,
  servicesConfigs,
  onServiceChange,
  errors,
}: AdditionalChargesCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="rounded-2xl p-6 bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl space-y-6"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Platform Charges & Finishing Services</h2>
            <p className="text-xs text-slate-400">System-wide platform fees (read-only) & shop finishing service prices.</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>System Managed</span>
        </span>
      </div>

      {/* Read Only System Platform Charges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Priority Fee */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-semibold text-slate-200">Priority Express Fee</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">Express</span>
          </div>
          <p className="text-[11px] text-slate-400">Surcharge for express queue jump orders.</p>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-xl font-bold text-white">
              ₹{(platformSettings?.priority_fee ?? 5).toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-500" /> Read-Only
            </span>
          </div>
        </div>

        {/* GST / Tax */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-slate-200">GST / Tax</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">Tax</span>
          </div>
          <p className="text-[11px] text-slate-400">Government tax component.</p>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-xl font-bold text-white">
              Exempt (₹0.00)
            </span>
            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-500" /> Read-Only
            </span>
          </div>
        </div>
      </div>

      {/* Editable Shop Finishing & Binding Services */}
      {servicesConfigs.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Shop Finishing & Binding Services
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Editable by Shop Owner</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {servicesConfigs.map((svc) => (
              <div
                key={svc.id}
                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-200">{svc.name}</span>
                  <button
                    type="button"
                    onClick={() => onServiceChange(svc.id, "is_active", !svc.is_active)}
                    className="flex items-center gap-1 text-[11px] font-medium"
                  >
                    {svc.is_active ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Active</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-500">Disabled</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-sm text-slate-400 font-medium">₹</span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="1000"
                    value={svc.price || ""}
                    onChange={(e) =>
                      onServiceChange(svc.id, "price", parseFloat(e.target.value) || 0)
                    }
                    placeholder="0.00"
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-1.5 pl-7 pr-3 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
