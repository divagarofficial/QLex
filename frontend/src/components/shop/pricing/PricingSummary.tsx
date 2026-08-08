"use client";

import { motion } from "framer-motion";
import { FileText, Palette, Shield, Zap, Sparkles } from "lucide-react";
import type { PricingConfig } from "@/types/orders";
import type { PlatformSettings } from "@/services/shopPricing";

interface PricingSummaryProps {
  pricingConfigs: PricingConfig[];
  platformSettings: PlatformSettings | null;
}

export default function PricingSummary({
  pricingConfigs,
  platformSettings,
}: PricingSummaryProps) {
  // Find A4 single/double prices from configs
  const bwSingle = pricingConfigs.find(
    (c) => c.paper_size === "A4" && c.print_type === "black_white" && c.print_side === "single"
  )?.shop_price ?? 0;

  const bwDouble = pricingConfigs.find(
    (c) => c.paper_size === "A4" && c.print_type === "black_white" && c.print_side === "double"
  )?.shop_price ?? 0;

  const colSingle = pricingConfigs.find(
    (c) => c.paper_size === "A4" && c.print_type === "colour" && c.print_side === "single"
  )?.shop_price ?? 0;

  const colDouble = pricingConfigs.find(
    (c) => c.paper_size === "A4" && c.print_type === "colour" && c.print_side === "double"
  )?.shop_price ?? 0;

  const convenienceFee = pricingConfigs[0]?.convenience_fee ?? 0.5;

  const priorityFee = platformSettings?.priority_fee ?? 3;

  const cards = [
    {
      title: "B&W Print (A4)",
      value: `₹${bwSingle.toFixed(2)} / ₹${bwDouble.toFixed(2)}`,
      subtitle: "Single / Double",
      icon: FileText,
      color: "from-blue-500/20 to-slate-500/10 text-blue-400 border-blue-500/20",
    },
    {
      title: "Colour Print (A4)",
      value: `₹${colSingle.toFixed(2)} / ₹${colDouble.toFixed(2)}`,
      subtitle: "Single / Double",
      icon: Palette,
      color: "from-purple-500/20 to-pink-500/10 text-purple-400 border-purple-500/20",
    },
    {
      title: "Priority Express Fee",
      value: `₹${priorityFee.toFixed(2)}`,
      subtitle: "Express queue surcharge",
      icon: Zap,
      color: "from-rose-500/20 to-orange-500/10 text-rose-400 border-rose-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${card.color} border backdrop-blur-xl shadow-lg transition-transform hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-semibold tracking-wider text-slate-300 uppercase truncate">
                {card.title}
              </span>
              <Icon className="w-4 h-4 shrink-0 opacity-80" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {card.value}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
              {card.subtitle}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
