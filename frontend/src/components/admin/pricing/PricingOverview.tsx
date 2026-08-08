"use client";

import { PricingRule, PlatformSettings } from "@/services/adminPricing";
import { Printer, Percent, Zap, DollarSign, Tag } from "lucide-react";

interface PricingOverviewProps {
  pricingRules: PricingRule[];
  settings: PlatformSettings | null;
}

export default function PricingOverview({ pricingRules, settings }: PricingOverviewProps) {
  // Find default A4 B&W and Colour rates
  const bwSingle = pricingRules.find((r) => r.paper_size === "A4" && r.print_type === "BW" && r.print_side === "SINGLE");
  const bwDouble = pricingRules.find((r) => r.paper_size === "A4" && r.print_type === "BW" && r.print_side === "DOUBLE");
  
  const colorSingle = pricingRules.find((r) => r.paper_size === "A4" && r.print_type === "COLOR" && r.print_side === "SINGLE");
  const colorDouble = pricingRules.find((r) => r.paper_size === "A4" && r.print_type === "COLOR" && r.print_side === "DOUBLE");

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
