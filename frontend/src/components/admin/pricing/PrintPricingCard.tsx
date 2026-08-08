"use client";

import { useState } from "react";
import { PricingRule } from "@/services/adminPricing";
import { Printer, Lock } from "lucide-react";

interface PrintPricingCardProps {
  pricingRules: PricingRule[];
  onConvenienceFeeChange: (ruleId: string, fee: number) => void;
}

export default function PrintPricingCard({ pricingRules, onConvenienceFeeChange }: PrintPricingCardProps) {
  const [selectedSize, setSelectedSize] = useState<string>("A4");

  const filteredRules = pricingRules.filter((r) => r.paper_size === selectedSize);
  const availableSizes = Array.from(new Set(pricingRules.map((r) => r.paper_size)));
  if (availableSizes.length === 0) availableSizes.push("A4");

  return (
    <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/90 p-5 shadow-xl backdrop-blur-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Printer className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Print Pricing Rules</h3>
            <p className="text-xs text-slate-400">
              Shop print rates are merchant-managed{" "}
              <span className="text-slate-500">(read-only)</span>. Convenience fee surcharge per page is{" "}
              <span className="text-amber-400 font-semibold">admin-editable</span>.
            </p>
          </div>
        </div>

        {/* Paper Size Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs">
          {availableSizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                selectedSize === size
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {filteredRules.map((rule) => {
          const isBW = rule.print_type === "BW";
          const isSingle = rule.print_side === "SINGLE";
          const typeLabel = isBW ? "Black & White" : "Full Colour";
          const sideLabel = isSingle ? "Single Sided" : "Double Sided";

          return (
            <div
              key={rule.id}
              className={`p-4 rounded-xl border ${
                rule.is_active
                  ? "bg-slate-950/40 border-slate-800/70"
                  : "bg-slate-950/20 border-slate-900 opacity-50"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      isBW
                        ? "bg-slate-800 text-slate-300 border border-slate-700"
                        : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    }`}
                  >
                    {typeLabel}
                  </span>
                  <span className="text-slate-300 font-semibold">{sideLabel}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    rule.is_active
                      ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                      : "text-rose-400 bg-rose-500/10 border border-rose-500/20"
                  }`}
                >
                  {rule.is_active ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/60">
                {/* Shop Print Rate — READ ONLY */}
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mb-1">
                    <Lock className="w-3 h-3" />
                    <span>Shop Print Rate</span>
                  </div>
                  <div className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-slate-900/60 border border-slate-800/50 text-slate-400 font-mono font-semibold cursor-not-allowed select-none">
                    ₹{rule.shop_price.toFixed(2)}
                  </div>
                </div>

                {/* Convenience Fee — ADMIN EDITABLE */}
                <div>
                  <label className="text-[11px] text-amber-400 block font-semibold mb-1">
                    Convenience Fee / Page ✏️
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="50"
                      value={rule.convenience_fee}
                      onChange={(e) =>
                        onConvenienceFeeChange(rule.id, Math.max(0, parseFloat(e.target.value) || 0))
                      }
                      className="w-full pl-6 pr-2 py-1.5 bg-slate-900 border border-amber-500/30 rounded-lg text-amber-300 font-mono font-semibold focus:outline-none focus:border-amber-400/80 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
