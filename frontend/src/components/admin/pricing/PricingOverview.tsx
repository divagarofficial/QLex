"use client";

import { PricingRule, PlatformSettings } from "@/services/adminPricing";
import { Printer, Percent, Zap, DollarSign, Tag } from "lucide-react";

interface PricingOverviewProps {
  pricingRules: PricingRule[];
  settings: PlatformSettings | null;
}

export default function PricingOverview({ pricingRules, settings }: PricingOverviewProps) {
  const isMatch = (r: PricingRule, size: string, isBW: boolean, isSingle: boolean) => {
    if (r.paper_size !== size) return false;
    const pt = (r.print_type || "").toLowerCase();
    const ps = (r.print_side || "").toLowerCase();
    const rIsBW = pt === "bw" || pt === "black_white" || pt === "black_and_white";
    const rIsSingle = ps === "single";
    return rIsBW === isBW && rIsSingle === isSingle;
  };

  // Find default A4 B&W and Colour rates
  const bwSingle = pricingRules.find((r) => isMatch(r, "A4", true, true));
  const bwDouble = pricingRules.find((r) => isMatch(r, "A4", true, false));
  
  const colorSingle = pricingRules.find((r) => isMatch(r, "A4", false, true));
  const colorDouble = pricingRules.find((r) => isMatch(r, "A4", false, false));

  const bwPriceDisplay = bwSingle ? `₹${bwSingle.shop_price.toFixed(2)}` : "₹1.50";
  const bwDoubleDisplay = bwDouble ? `₹${bwDouble.shop_price.toFixed(2)}` : "₹2.50";

  const colorPriceDisplay = colorSingle ? `₹${colorSingle.shop_price.toFixed(2)}` : "₹10.00";
  const colorDoubleDisplay = colorDouble ? `₹${colorDouble.shop_price.toFixed(2)}` : "₹18.00";

  const priorityFee = settings ? settings.priority_fee : 25;

  const cards = [
    {
      title: "Default B/W Rate (A4)",
      value: bwPriceDisplay,
      subtitle: `Double Side: ${bwDoubleDisplay}`,
      icon: Printer,
      iconBg: "bg-slate-500/10 text-slate-300 border-slate-500/20",
    },
    {
      title: "Default Colour Rate (A4)",
      value: colorPriceDisplay,
      subtitle: `Double Side: ${colorDoubleDisplay}`,
      icon: Tag,
      iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
    {
      title: "Priority Pass Fee",
      value: `₹${priorityFee.toFixed(2)}`,
      subtitle: "Express Queue Charge",
      icon: Zap,
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/90 p-4 shadow-xl backdrop-blur-xl hover:border-slate-700/90 hover:shadow-cyan-900/10 transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl border ${card.iconBg} shadow-sm`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                {card.value}
              </div>
              <p className="text-[11px] font-medium text-slate-400">{card.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
