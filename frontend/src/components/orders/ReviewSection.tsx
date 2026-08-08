"use client";

import { motion } from "framer-motion";
import { FileText, Printer, Copy, Zap, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderDocumentSummary } from "@/types/orders";
import { PrintType, PrintSide, PaperSize } from "@/types/orders";
import type { DocPrintSettings } from "@/components/orders/PrintOptions";
import PriceBreakdown from "./PriceBreakdown";

interface ReviewSectionProps {
  documents: OrderDocumentSummary[];
  docSettings: Record<string, DocPrintSettings>;
  // Legacy single-doc fallback props (used when docSettings is empty)
  printType: PrintType;
  printSide: PrintSide;
  paperSize: PaperSize;
  copies: number;
  spiralBinding: boolean;
  softBinding: boolean;
  isPriority: boolean;
  subtotal: number;
  convenienceFee: number;
  platformFee: number;
  priorityFee: number;
  grandTotal: number;
}

function SettingChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-white/40">{label}</span>
      <span className="text-xs font-medium text-white/70 capitalize">{value}</span>
    </div>
  );
}

function printTypeLabel(pt: string) {
  return pt === "black_white" ? "Black & White" : "Colour";
}
function printSideLabel(ps: string) {
  return ps === "single" ? "1-sided" : "2-sided";
}

export default function ReviewSection({
  documents,
  docSettings,
  printType,
  printSide,
  paperSize,
  copies,
  spiralBinding,
  softBinding,
  isPriority,
  subtotal,
  convenienceFee,
  platformFee,
  priorityFee,
  grandTotal,
}: ReviewSectionProps) {
  return (
    <div className="space-y-6">
      {/* Per-Document Review */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="deep-glass relative overflow-hidden"
      >
        <div className="deep-glass-reflection" />
        <div className="relative z-10 p-5">
          <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
            <FileText size={16} className="text-champagne-400" />
            Documents &amp; Print Settings ({documents.length})
          </h3>
          <div className="space-y-3">
            {documents.map((doc) => {
              const s = docSettings[doc.id];
              const pt = s ? s.printType : printType;
              const ps = s ? s.printSide : printSide;
              const pz = s ? s.paperSize : paperSize;
              const cp = s ? s.copies : copies;
              const spiral = s ? s.spiralBinding : spiralBinding;
              const soft = s ? s.softBinding : softBinding;

              return (
                <div
                  key={doc.id}
                  className="rounded-xl bg-white/[0.02] border border-white/[0.04] overflow-hidden"
                >
                  {/* Doc header */}
                  <div className="flex items-center justify-between p-3 border-b border-white/[0.04]">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg flex-shrink-0">📄</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white/80 truncate">
                          {doc.original_filename}
                        </p>
                        <p className="text-xs text-white/30">{doc.page_count} pages</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-white/70 flex-shrink-0 ml-4">
                      ₹{Number(doc.document_total || 0).toFixed(2)}
                    </span>
                  </div>

                  {/* Doc print settings */}
                  <div className="px-3 py-2 divide-y divide-white/[0.04]">
                    <SettingChip label="Print Type" value={printTypeLabel(pt)} />
                    <SettingChip label="Sides" value={printSideLabel(ps)} />
                    <SettingChip label="Paper" value={pz} />
                    <SettingChip label="Copies" value={`×${cp}`} />
                    {spiral && <SettingChip label="Binding" value="Spiral Binding" />}
                    {soft && <SettingChip label="Binding" value="Soft Binding" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Queue Estimate */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="deep-glass relative overflow-hidden"
      >
        <div className="deep-glass-reflection" />
        <div className="relative z-10 p-5">
          <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
            <Clock size={16} className="text-champagne-400" />
            Estimated Completion
          </h3>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <MapPin size={16} className="text-white/40" />
            <div>
              <p className="text-sm text-white/80">QLex Print Shop</p>
              <p className="text-xs text-white/30">
                {isPriority ? "Priority queue — faster processing" : "Standard queue processing"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Price Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="deep-glass relative overflow-hidden"
      >
        <div className="deep-glass-reflection" />
        <div className="relative z-10 p-5">
          <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
            <span className="text-lg">💰</span>
            Price Breakdown
          </h3>
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
