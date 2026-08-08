"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PriceBreakdownProps {
  subtotal: number;
  convenienceFee: number;
  platformFee: number;
  priorityFee: number;
  grandTotal: number;
  isPriority?: boolean;
  className?: string;
}

export default function PriceBreakdown({
  subtotal,
  convenienceFee,
  platformFee,
  priorityFee,
  grandTotal,
  isPriority = false,
  className,
}: PriceBreakdownProps) {
  // Convenience fee and platform fee are included in printing cost display — not shown separately
  const displayPrintingCost = subtotal + convenienceFee + platformFee;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn("space-y-2", className)}
    >
      {/* Printing Cost (includes convenience fee & platform fee) */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/50">Printing Cost</span>
        <span className="text-sm text-white/70">₹{displayPrintingCost.toFixed(2)}</span>
      </div>

      {/* Priority Fee */}
      {isPriority && priorityFee > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-white/50">Priority Fee</span>
            <span className="text-[10px] font-medium text-champagne-400 bg-champagne-500/10 px-1.5 py-0.5 rounded-full">
              FAST
            </span>
          </div>
          <span className="text-sm text-champagne-400">+₹{priorityFee.toFixed(2)}</span>
        </motion.div>
      )}

      {/* Divider */}
      <div className="h-px bg-white/5 my-2" />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white/80">Total</span>
        <motion.span
          key={grandTotal}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="text-lg font-bold text-champagne-400"
        >
          ₹{grandTotal.toFixed(2)}
        </motion.span>
      </div>
    </motion.div>
  );
}
