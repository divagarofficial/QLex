"use client";

import { motion } from "framer-motion";
import { PackageOpen, Crown, SearchX, RotateCcw } from "lucide-react";

interface EmptyStateProps {
  type: "no-orders" | "no-priority" | "no-results";
  onResetFilters?: () => void;
}

export default function EmptyState({ type, onResetFilters }: EmptyStateProps) {
  const getConfig = () => {
    switch (type) {
      case "no-priority":
        return {
          icon: Crown,
          title: "No Priority Orders",
          description:
            "There are currently no active priority orders in the queue. All regular orders are being served in sequence.",
          iconBg: "bg-amber-400/10 border-amber-400/20 text-amber-300",
        };
      case "no-results":
        return {
          icon: SearchX,
          title: "No Matching Orders Found",
          description:
            "No orders matched your active search query or filter selection. Try adjusting your filters or search terms.",
          iconBg: "bg-blue-500/10 border-blue-500/20 text-blue-300",
        };
      case "no-orders":
      default:
        return {
          icon: PackageOpen,
          title: "Order Queue Empty",
          description:
            "There are no active orders waiting in the print shop queue right now.",
          iconBg: "bg-purple-500/10 border-purple-500/20 text-purple-300",
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="deep-glass flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl shadow-lg my-4"
    >
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-2xl border shadow-inner ${config.iconBg}`}
      >
        <Icon className="h-8 w-8" />
      </div>

      <h3 className="mt-4 text-lg font-bold text-white tracking-tight">
        {config.title}
      </h3>

      <p className="mt-1.5 max-w-md text-xs font-medium text-zinc-400 leading-relaxed">
        {config.description}
      </p>

      {type === "no-results" && onResetFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/15 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-400/25 transition-all cursor-pointer shadow-md shadow-amber-400/10"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Clear All Filters</span>
        </button>
      )}
    </motion.div>
  );
}
