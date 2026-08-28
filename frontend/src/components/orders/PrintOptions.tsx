"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Printer, Copy, AlignJustify, Maximize, Zap, ChevronDown, FileText } from "lucide-react";
import type { PricingConfig, ServiceConfig } from "@/types/orders";
import { PrintType, PrintSide, PaperSize } from "@/types/orders";
import type { OrderDocumentSummary } from "@/types/orders";

// ── Common glass toggle / select button ───────────────────────

interface OptionButtonProps {
  selected?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

function OptionButton({ selected, onClick, children, className }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium",
        "border transition-all duration-300",
        "hover:border-white/20",
        selected
          ? "bg-champagne-500/10 border-champagne-500/30 text-champagne-400"
          : "bg-white/[0.02] border-white/[0.06] text-white/50 hover:text-white/70",
        className
      )}
      aria-pressed={selected}
    >
      {children}
    </button>
  );
}

// ── Per-document settings type ────────────────────────────────

export interface DocPrintSettings {
  printType: PrintType;
  printSide: PrintSide;
  paperSize: PaperSize;
  copies: number;
  spiralBinding: boolean;
  softBinding: boolean;
  customPages?: string;
}

export function getPrintablePageCount(customPages: string | undefined, totalPages: number): number {
  if (!customPages || customPages.trim().toUpperCase() === "ALL") return totalPages;
  const mode = customPages.trim().toUpperCase();
  if (mode === "ODD") return Math.ceil(totalPages / 2);
  if (mode === "EVEN") return Math.floor(totalPages / 2);

  try {
    const set = new Set<number>();
    customPages.split(",").forEach((part) => {
      const trimmed = part.trim();
      if (trimmed.includes("-")) {
        const [sStr, eStr] = trimmed.split("-");
        const s = parseInt(sStr, 10);
        const e = parseInt(eStr, 10);
        if (!isNaN(s) && !isNaN(e) && s <= e) {
          for (let i = s; i <= e; i++) {
            if (i >= 1 && i <= totalPages) set.add(i);
          }
        }
      } else {
        const val = parseInt(trimmed, 10);
        if (!isNaN(val) && val >= 1 && val <= totalPages) set.add(val);
      }
    });
    return set.size > 0 ? set.size : totalPages;
  } catch {
    return totalPages;
  }
}

// ── Props ─────────────────────────────────────────────────────

interface PrintOptionsProps {
  documents: OrderDocumentSummary[];
  pricingConfigs: PricingConfig[];
  services: ServiceConfig[];
  // Per-document settings map: docId -> settings
  docSettings: Record<string, DocPrintSettings>;
  onDocSettingsChange: (docId: string, settings: DocPrintSettings) => void;
  // Global priority (applies to whole order)
  isPriority: boolean;
  onPriorityChange: (val: boolean) => void;
}

// ── Per-Document Settings Panel ───────────────────────────────

function DocSettingsPanel({
  doc,
  settings,
  services,
  onChange,
}: {
  doc: OrderDocumentSummary;
  settings: DocPrintSettings;
  services: ServiceConfig[];
  onChange: (s: DocPrintSettings) => void;
}) {
  const activeServices = services.filter((s) => s.is_active);

  function update(patch: Partial<DocPrintSettings>) {
    onChange({ ...settings, ...patch });
  }

  const printableCount = getPrintablePageCount(settings.customPages, doc.page_count);
  const currentMode = !settings.customPages || settings.customPages === "ALL"
    ? "ALL"
    : settings.customPages === "ODD"
    ? "ODD"
    : settings.customPages === "EVEN"
    ? "EVEN"
    : "CUSTOM";

  return (
    <div className="space-y-5 pt-4">
      {/* Customized Pages Selection Section */}
      <div className="rounded-2xl border border-champagne-500/20 bg-champagne-500/10 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-champagne-400 uppercase tracking-wide">
            <span className="text-sm">📑</span>
            <span>Customized Pages Selection</span>
          </div>
          <span className="text-xs font-black text-champagne-400 font-mono">
            {printableCount} of {doc.page_count} pages selected
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { id: "ALL", label: "All Pages" },
            { id: "ODD", label: "Odd Pages" },
            { id: "EVEN", label: "Even Pages" },
            { id: "CUSTOM", label: "Custom Range" },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => {
                if (mode.id === "ALL") update({ customPages: "ALL" });
                else if (mode.id === "ODD") update({ customPages: "ODD" });
                else if (mode.id === "EVEN") update({ customPages: "EVEN" });
                else update({ customPages: settings.customPages && settings.customPages !== "ALL" && settings.customPages !== "ODD" && settings.customPages !== "EVEN" ? settings.customPages : "1-5" });
              }}
              className={cn(
                "rounded-xl border px-3 py-2 text-xs font-semibold backdrop-blur-md transition-all text-center cursor-pointer",
                currentMode === mode.id
                  ? "border-champagne-400 bg-champagne-500/25 text-champagne-300 shadow-md shadow-champagne-500/20"
                  : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {currentMode === "CUSTOM" && (
          <div className="pt-2 space-y-1">
            <label className="text-[11px] font-semibold text-white/70">
              Enter customized page range sequence (comma separated or ranges):
            </label>
            <input
              type="text"
              value={settings.customPages && settings.customPages !== "ALL" && settings.customPages !== "ODD" && settings.customPages !== "EVEN" ? settings.customPages : ""}
              onChange={(e) => update({ customPages: e.target.value })}
              placeholder="e.g. 1-5, 8, 11-15"
              className="w-full rounded-xl border border-white/10 bg-zinc-950/90 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-champagne-400/50 focus:outline-none focus:ring-1 focus:ring-champagne-400/30 font-mono"
            />
          </div>
        )}
      </div>

      {/* Print Type */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Printer size={13} className="text-white/40" />
          <span className="text-xs font-medium text-white/60">Print Type</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <OptionButton
            selected={settings.printType === PrintType.BLACK_WHITE}
            onClick={() => update({ printType: PrintType.BLACK_WHITE })}
          >
            <span className="text-sm">⚫</span>
            Black &amp; White
          </OptionButton>
          <OptionButton
            selected={settings.printType === PrintType.COLOUR}
            onClick={() => update({ printType: PrintType.COLOUR })}
          >
            <span className="text-sm">🔴</span>
            Colour
          </OptionButton>
        </div>
      </div>

      {/* Sides */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <AlignJustify size={13} className="text-white/40" />
          <span className="text-xs font-medium text-white/60">Sides</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <OptionButton
            selected={settings.printSide === PrintSide.SINGLE}
            onClick={() => update({ printSide: PrintSide.SINGLE })}
          >
            1-sided
          </OptionButton>
          <OptionButton
            selected={settings.printSide === PrintSide.DOUBLE}
            onClick={() => update({ printSide: PrintSide.DOUBLE })}
          >
            2-sided
          </OptionButton>
        </div>
      </div>

      {/* Paper Size */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Maximize size={13} className="text-white/40" />
          <span className="text-xs font-medium text-white/60">Paper Size</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <OptionButton
            selected={settings.paperSize === PaperSize.A4}
            onClick={() => update({ paperSize: PaperSize.A4 })}
          >
            A4
          </OptionButton>
          <OptionButton
            selected={settings.paperSize === PaperSize.A3}
            onClick={() => update({ paperSize: PaperSize.A3 })}
          >
            A3
          </OptionButton>
        </div>
      </div>

      {/* Copies */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Copy size={13} className="text-white/40" />
          <span className="text-xs font-medium text-white/60">Copies</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => update({ copies: Math.max(1, settings.copies - 1) })}
            className={cn(
              "crystal-btn !p-2 !rounded-xl",
              settings.copies <= 1 && "opacity-30 cursor-not-allowed"
            )}
            disabled={settings.copies <= 1}
            aria-label="Decrease copies"
          >
            <span className="text-base leading-none">−</span>
          </button>
          <motion.span
            key={settings.copies}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-xl font-bold text-white/80 min-w-[2.5rem] text-center tabular-nums"
          >
            {settings.copies}
          </motion.span>
          <button
            type="button"
            onClick={() => update({ copies: Math.min(99, settings.copies + 1) })}
            className="crystal-btn !p-2 !rounded-xl"
            aria-label="Increase copies"
          >
            <span className="text-base leading-none">+</span>
          </button>
        </div>
      </div>

      {/* Additional Services */}
      {activeServices.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">📎</span>
            <span className="text-xs font-medium text-white/60">Additional Services</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeServices.map((service) => {
              const isSelected =
                service.name === "Spiral Binding"
                  ? settings.spiralBinding
                  : service.name === "Soft Binding"
                    ? settings.softBinding
                    : false;

              const handleToggle = () => {
                if (service.name === "Spiral Binding") {
                  update({ spiralBinding: !settings.spiralBinding });
                } else if (service.name === "Soft Binding") {
                  update({ softBinding: !settings.softBinding });
                }
              };

              return (
                <OptionButton key={service.id} selected={isSelected} onClick={handleToggle}>
                  <span>{service.name}</span>
                  {service.price > 0 && (
                    <span className="text-[11px] text-white/30">
                      +₹{Number(service.price).toFixed(2)}
                    </span>
                  )}
                </OptionButton>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────

export default function PrintOptions({
  documents,
  pricingConfigs,
  services,
  docSettings,
  onDocSettingsChange,
  isPriority,
  onPriorityChange,
}: PrintOptionsProps) {
  const [openDocId, setOpenDocId] = useState<string | null>(
    documents.length > 0 ? documents[0].id : null
  );

  return (
    <div className="space-y-6">
      {/* Per-Document Settings */}
      {documents.length === 0 ? (
        <div className="p-6 text-center deep-glass rounded-2xl border border-white/[0.04]">
          <FileText size={28} className="mx-auto text-white/20 mb-2" />
          <p className="text-sm text-white/40">Upload documents first to configure print options.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-white/40 mb-1">
            Configure print settings for each document individually.
          </p>
          {documents.map((doc) => {
            const isOpen = openDocId === doc.id;
            const settings = docSettings[doc.id];
            if (!settings) return null;

            return (
              <motion.div
                key={doc.id}
                layout
                className="deep-glass relative overflow-hidden"
              >
                <div className="deep-glass-reflection" />
                <div className="relative z-10">
                  {/* Accordion Header */}
                  <button
                    type="button"
                    onClick={() => setOpenDocId(isOpen ? null : doc.id)}
                    className="w-full flex items-center gap-3 p-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-base">
                      📄
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/80 truncate">
                        {doc.original_filename}
                      </p>
                      <p className="text-xs text-white/30 mt-0.5">
                        {doc.page_count} pages •{" "}
                        {settings.printType === PrintType.BLACK_WHITE ? "B&W" : "Colour"} •{" "}
                        {settings.printSide === PrintSide.SINGLE ? "1-sided" : "2-sided"} •{" "}
                        {settings.paperSize} • ×{settings.copies}
                      </p>
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ChevronDown size={16} className="text-white/30" />
                    </motion.div>
                  </button>

                  {/* Accordion Body */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-5 border-t border-white/[0.04]">
                          <DocSettingsPanel
                            doc={doc}
                            settings={settings}
                            services={services}
                            onChange={(s) => onDocSettingsChange(doc.id, s)}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Priority Printing (order-level) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                isPriority
                  ? "bg-champagne-500/10 border border-champagne-500/20"
                  : "bg-white/[0.03] border border-white/[0.06]"
              )}
            >
              <Zap
                size={18}
                className={cn(
                  "transition-colors duration-300",
                  isPriority ? "text-champagne-400" : "text-white/30"
                )}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Priority Printing</p>
              <p className="text-xs text-white/30">Skip the queue — get your prints faster</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPriority}
            onClick={() => onPriorityChange(!isPriority)}
            className={cn(
              "relative w-12 h-7 rounded-full transition-all duration-300",
              isPriority ? "bg-champagne-500" : "bg-white/[0.06]"
            )}
          >
            <motion.div
              animate={{ x: isPriority ? 20 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg"
            />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
