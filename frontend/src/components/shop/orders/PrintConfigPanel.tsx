"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sliders,
  Save,
  CheckCircle2,
  Copy,
  Layers,
  Sparkles,
  FileCheck,
  Calculator,
  RefreshCw,
} from "lucide-react";
import type { DetailedOrderDocument } from "@/types/shop";
import { PaperSize, PrintType, PrintSide } from "@/types/orders";
import { updateDocumentSettings } from "@/services/orders";

interface PrintConfigPanelProps {
  orderId: string;
  document: DetailedOrderDocument;
  onUpdateSuccess: () => Promise<void>;
  isUpdating: boolean;
  setIsUpdating: (val: boolean) => void;
  onShowNotice: (title: string, desc: string, variant: any) => void;
}

export default function PrintConfigPanel({
  orderId,
  document,
  onUpdateSuccess,
  isUpdating,
  setIsUpdating,
  onShowNotice,
}: PrintConfigPanelProps) {
  // Form State
  const [paperSize, setPaperSize] = useState<string>(
    document.paper_size?.toUpperCase() === "A3" ? "A3" : "A4"
  );
  const [printType, setPrintType] = useState<string>(
    document.print_type?.toLowerCase() === "colour" || document.print_type?.toUpperCase() === "COLOR"
      ? "colour"
      : "black_white"
  );
  const [printSide, setPrintSide] = useState<string>(
    document.print_side?.toLowerCase() === "double" || document.print_side?.toUpperCase() === "DOUBLE"
      ? "double"
      : "single"
  );
  const [copies, setCopies] = useState<number>(document.copies || 1);
  const [spiralBinding, setSpiralBinding] = useState<boolean>(false);
  const [softBinding, setSoftBinding] = useState<boolean>(false);

  // Custom Page Range State
  const [rangeMode, setRangeMode] = useState<"ALL" | "ODD" | "EVEN" | "CUSTOM">(
    "ALL"
  );
  const [customRangeInput, setCustomRangeInput] = useState<string>("1-5, 8, 11-15");

  // Sync document props when document changes
  useEffect(() => {
    if (!document) return;
    setPaperSize(document.paper_size?.toUpperCase() === "A3" ? "A3" : "A4");
    setPrintType(
      document.print_type?.toLowerCase() === "colour" || document.print_type?.toUpperCase() === "COLOR"
        ? "colour"
        : "black_white"
    );
    setPrintSide(
      document.print_side?.toLowerCase() === "double" || document.print_side?.toUpperCase() === "DOUBLE"
        ? "double"
        : "single"
    );
    setCopies(document.copies || 1);
  }, [document]);

  // Calculate printable pages based on Custom Range Mode
  const calculatedPageCount = useMemo(() => {
    const totalPages = document.page_count || 1;
    if (rangeMode === "ALL") return totalPages;
    if (rangeMode === "ODD") return Math.ceil(totalPages / 2);
    if (rangeMode === "EVEN") return Math.floor(totalPages / 2);

    if (rangeMode === "CUSTOM") {
      try {
        const pagesSet = new Set<number>();
        const parts = customRangeInput.split(",");

        parts.forEach((part) => {
          const trimmed = part.trim();
          if (trimmed.includes("-")) {
            const [startStr, endStr] = trimmed.split("-");
            const start = parseInt(startStr, 10);
            const end = parseInt(endStr, 10);
            if (!isNaN(start) && !isNaN(end) && start <= end) {
              for (let i = start; i <= end; i++) {
                if (i >= 1 && i <= totalPages) pagesSet.add(i);
              }
            }
          } else {
            const val = parseInt(trimmed, 10);
            if (!isNaN(val) && val >= 1 && val <= totalPages) {
              pagesSet.add(val);
            }
          }
        });

        return pagesSet.size > 0 ? pagesSet.size : totalPages;
      } catch {
        return totalPages;
      }
    }
    return totalPages;
  }, [document.page_count, rangeMode, customRangeInput]);

  // Save changes handler
  const handleSaveChanges = async () => {
    setIsUpdating(true);
    try {
      const customPagesPayload =
        rangeMode === "ALL"
          ? "ALL"
          : rangeMode === "ODD"
          ? "ODD"
          : rangeMode === "EVEN"
          ? "EVEN"
          : customRangeInput;

      await updateDocumentSettings(orderId, document.id, {
        paper_size: paperSize as PaperSize,
        print_type: printType as PrintType,
        print_side: printSide as PrintSide,
        copies,
        spiral_binding: spiralBinding,
        soft_binding: softBinding,
        custom_pages: customPagesPayload,
      });

      onShowNotice(
        "Specifications Updated",
        `Print configuration updated for ${document.original_filename}. Recalculated ${calculatedPageCount} printable pages.`,
        "success"
      );

      await onUpdateSuccess();
    } catch (err: any) {
      onShowNotice(
        "Update Failed",
        err.message || "Failed to update document print settings.",
        "error"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="deep-glass flex flex-col rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-xl space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300">
            <Sliders className="h-4 w-4" />
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Print Configuration & Custom Range
          </h3>
        </div>

        <span className="text-[11px] font-semibold text-zinc-400 font-mono">
          Doc ID: {document.id.slice(0, 8).toUpperCase()}
        </span>
      </div>

      {/* Custom Page Range Selection Section */}
      <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
            <Calculator className="h-3.5 w-3.5 text-amber-400" />
            Custom Page Range Selection
          </label>
          <span className="text-xs font-black text-amber-300 font-mono">
            {calculatedPageCount} of {document.page_count} pages selected
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { id: "ALL", label: "All Pages (1-N)" },
            { id: "ODD", label: "Odd Pages Only" },
            { id: "EVEN", label: "Even Pages Only" },
            { id: "CUSTOM", label: "Custom Range" },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setRangeMode(mode.id as any)}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold backdrop-blur-md transition-all text-center cursor-pointer ${
                rangeMode === mode.id
                  ? "border-amber-400 bg-amber-400/25 text-amber-200 shadow-md shadow-amber-400/20"
                  : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {rangeMode === "CUSTOM" && (
          <div className="pt-2 space-y-1">
            <label className="text-[11px] font-semibold text-zinc-300">
              Enter page range sequence (comma separated or ranges):
            </label>
            <input
              type="text"
              value={customRangeInput}
              onChange={(e) => setCustomRangeInput(e.target.value)}
              placeholder="e.g. 1-5, 8, 11-15"
              className="w-full rounded-xl border border-white/10 bg-zinc-900/90 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30 font-mono"
            />
          </div>
        )}
      </div>

      {/* Granular Options Form */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Paper Size */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-300 flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-blue-400" /> Paper Size:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["A4", "A3"].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setPaperSize(size)}
                className={`rounded-xl border py-2 text-xs font-bold transition-all cursor-pointer ${
                  paperSize === size
                    ? "border-blue-400/60 bg-blue-500/20 text-blue-300"
                    : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Print Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-300 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Print Color:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "black_white", label: "Black & White" },
              { id: "colour", label: "Colour" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setPrintType(t.id)}
                className={`rounded-xl border py-2 text-xs font-bold transition-all cursor-pointer ${
                  printType === t.id
                    ? "border-amber-400/60 bg-amber-400/20 text-amber-300"
                    : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Print Side */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-300 flex items-center gap-1">
            <FileCheck className="h-3.5 w-3.5 text-emerald-400" /> Print Side:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "single", label: "Single Sided" },
              { id: "double", label: "Double Sided" },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setPrintSide(s.id)}
                className={`rounded-xl border py-2 text-xs font-bold transition-all cursor-pointer ${
                  printSide === s.id
                    ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-300"
                    : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Copies Stepper */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-300 flex items-center gap-1">
            <Copy className="h-3.5 w-3.5 text-purple-400" /> Copies Count:
          </label>
          <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setCopies((prev) => Math.max(1, prev - 1))}
              className="flex h-7 w-8 items-center justify-center rounded-lg bg-white/10 font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
            >
              -
            </button>
            <input
              type="number"
              min={1}
              max={50}
              value={copies}
              onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full text-center text-xs font-bold font-mono text-white bg-transparent focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setCopies((prev) => Math.min(50, prev + 1))}
              className="flex h-7 w-8 items-center justify-center rounded-lg bg-white/10 font-bold text-white hover:bg-white/20 transition-all cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Finishing & Binding Add-ons */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <span className="text-xs font-bold text-zinc-300 block">
          Finishing & Binding Services:
        </span>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 cursor-pointer hover:bg-white/10 transition-all">
            <input
              type="checkbox"
              checked={spiralBinding}
              onChange={(e) => {
                setSpiralBinding(e.target.checked);
                if (e.target.checked) setSoftBinding(false);
              }}
              className="rounded accent-amber-400"
            />
            <span>Spiral Binding (+₹30.00)</span>
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 cursor-pointer hover:bg-white/10 transition-all">
            <input
              type="checkbox"
              checked={softBinding}
              onChange={(e) => {
                setSoftBinding(e.target.checked);
                if (e.target.checked) setSpiralBinding(false);
              }}
              className="rounded accent-purple-400"
            />
            <span>Soft Cover Book Binding (+₹50.00)</span>
          </label>
        </div>
      </div>

      {/* Save Action Button */}
      <div className="pt-3">
        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleSaveChanges}
          disabled={isUpdating}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-amber-400/50 bg-amber-400/20 py-3 text-xs font-black text-amber-200 shadow-lg shadow-amber-400/10 hover:bg-amber-400/30 transition-all disabled:opacity-50 cursor-pointer"
        >
          <Save className={`h-4 w-4 ${isUpdating ? "animate-spin text-amber-400" : ""}`} />
          <span>{isUpdating ? "Saving & Recalculating..." : "Save & Recalculate Specifications"}</span>
        </motion.button>
      </div>
    </div>
  );
}
