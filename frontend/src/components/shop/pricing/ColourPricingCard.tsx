"use client";

import { motion } from "framer-motion";
import { Palette, ToggleLeft, ToggleRight } from "lucide-react";
import type { PricingConfig } from "@/types/orders";

interface ColourPricingCardProps {
  pricingConfigs: PricingConfig[];
  onChange: (id: string, field: "shop_price" | "is_active", value: number | boolean) => void;
  errors: Record<string, string>;
}

export default function ColourPricingCard({
  pricingConfigs,
  onChange,
  errors,
}: ColourPricingCardProps) {
  // Filter Colour configurations (A4 & A3)
  const colourConfigs = pricingConfigs.filter((c) => c.print_type === "colour");

  const paperSizes = ["A4", "A3"];

  const handlePriceInputChange = (id: string, valStr: string) => {
    if (valStr === "") {
      onChange(id, "shop_price", 0);
      return;
    }
    const num = parseFloat(valStr);
    if (!isNaN(num)) {
      onChange(id, "shop_price", num);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="rounded-2xl p-6 bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl space-y-6"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Colour Printing</h2>
            <p className="text-xs text-slate-400">Set vibrant colour print pricing across paper formats.</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
          Full Color
        </span>
      </div>

      <div className="space-y-5">
        {paperSizes.map((size) => {
          const singleItem = colourConfigs.find(
            (c) => c.paper_size === size && c.print_side === "single"
          );
          const doubleItem = colourConfigs.find(
            (c) => c.paper_size === size && c.print_side === "double"
          );

          return (
            <div
              key={size}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-md">
                  {size} Paper Size
                </span>
                <span className="text-[11px] text-slate-400">High Resolution</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Single Side */}
                {singleItem && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="text-slate-300 font-medium">Single Side (Per Page)</label>
                      <button
                        type="button"
                        onClick={() => onChange(singleItem.id, "is_active", !singleItem.is_active)}
                        className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white"
                      >
                        {singleItem.is_active ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-500">Inactive</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-sm text-slate-400 font-medium">₹</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="1000"
                        value={singleItem.shop_price || ""}
                        onChange={(e) => handlePriceInputChange(singleItem.id, e.target.value)}
                        placeholder="0.00"
                        className={`w-full bg-slate-950/80 border rounded-xl py-2 pl-7 pr-3 text-sm font-semibold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                          errors[singleItem.id]
                            ? "border-rose-500/60 text-rose-300 focus:ring-rose-500/30"
                            : "border-white/10 focus:border-purple-500/50"
                        }`}
                      />
                    </div>
                    {errors[singleItem.id] && (
                      <p className="text-[11px] text-rose-400 mt-0.5">{errors[singleItem.id]}</p>
                    )}
                  </div>
                )}

                {/* Double Side */}
                {doubleItem && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="text-slate-300 font-medium">Double Side (Per Side)</label>
                      <button
                        type="button"
                        onClick={() => onChange(doubleItem.id, "is_active", !doubleItem.is_active)}
                        className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white"
                      >
                        {doubleItem.is_active ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-500">Inactive</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-sm text-slate-400 font-medium">₹</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="1000"
                        value={doubleItem.shop_price || ""}
                        onChange={(e) => handlePriceInputChange(doubleItem.id, e.target.value)}
                        placeholder="0.00"
                        className={`w-full bg-slate-950/80 border rounded-xl py-2 pl-7 pr-3 text-sm font-semibold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${
                          errors[doubleItem.id]
                            ? "border-rose-500/60 text-rose-300 focus:ring-rose-500/30"
                            : "border-white/10 focus:border-purple-500/50"
                        }`}
                      />
                    </div>
                    {errors[doubleItem.id] && (
                      <p className="text-[11px] text-rose-400 mt-0.5">{errors[doubleItem.id]}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
