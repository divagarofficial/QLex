"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import PriceBreakdown from "./PriceBreakdown";
import type { OrderDocumentSummary } from "@/types/orders";

interface OrderSummaryProps {
  documents: OrderDocumentSummary[];
  copies: number;
  pageCount: number;
  printType: string;
  paperSize: string;
  printSide: string;
  isPriority: boolean;
  subtotal: number;
  convenienceFee: number;
  platformFee: number;
  priorityFee: number;
  grandTotal: number;
  isSticky?: boolean;
}

export default function OrderSummary({
  documents,
  copies,
  pageCount,
  printType,
  paperSize,
  printSide,
  isPriority,
  subtotal,
  convenienceFee,
  platformFee,
  priorityFee,
  grandTotal,
  isSticky = false,
}: OrderSummaryProps) {
  return (
    <div
      className={cn(
        "w-full",
        isSticky && "lg:sticky lg:top-24"
      )}
    >
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="deep-glass relative overflow-hidden"
      >
        <div className="deep-glass-reflection" />
        <div className="deep-glass-rim" />
        <div className="deep-glass-sweep" />

        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-5">
            <Sparkles size={16} className="text-champagne-400" />
            <h3 className="text-sm font-semibold text-white/80">Order Summary</h3>
          </div>

          {/* Documents */}
          <div className="space-y-3 mb-5">
            <h4 className="text-[11px] font-medium uppercase tracking-wider text-white/30">
              Documents ({documents.length})
            </h4>
            <AnimatePresence mode="popLayout">
              {documents.map((doc) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center">
                    <FileText size={14} className="text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white/70 truncate">
                      {doc.original_filename}
                    </p>
                    <p className="text-[11px] text-white/30">
                      {doc.page_count} pages • {doc.copies} {doc.copies === 1 ? "copy" : "copies"}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-white/60">
                    ₹{Number(doc.document_total || 0).toFixed(2)}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Print Settings */}
          {(copies > 0 || printType) && (
            <div className="space-y-2 mb-5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <h4 className="text-[11px] font-medium uppercase tracking-wider text-white/30">
                Print Settings
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                {printType && (
                  <>
                    <span className="text-white/40">Type</span>
                    <span className="text-white/70 text-right capitalize">
                      {printType === "black_white" ? "Black & White" : "Colour"}
                    </span>
                  </>
                )}
                {printSide && (
                  <>
                    <span className="text-white/40">Sides</span>
                    <span className="text-white/70 text-right capitalize">{printSide}</span>
                  </>
                )}
                {paperSize && (
                  <>
                    <span className="text-white/40">Paper</span>
                    <span className="text-white/70 text-right">{paperSize}</span>
                  </>
                )}
                {copies > 0 && (
                  <>
                    <span className="text-white/40">Copies</span>
                    <span className="text-white/70 text-right">×{copies}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Priority Badge */}
          {isPriority && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 mb-5 p-2.5 rounded-xl bg-champagne-500/5 border border-champagne-500/10"
            >
              <div className="w-2 h-2 rounded-full bg-champagne-400 animate-pulse" />
              <span className="text-xs font-medium text-champagne-400">Priority Printing</span>
            </motion.div>
          )}

          {/* Price Breakdown */}
          <PriceBreakdown
            subtotal={subtotal}
            convenienceFee={convenienceFee}
            platformFee={platformFee}
            priorityFee={priorityFee}
            grandTotal={grandTotal}
            isPriority={isPriority}
          />
        </div>
      </motion.div>
    </div>
  );
}

