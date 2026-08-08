"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, ArrowRight, Zap, FileCheck, Layers } from "lucide-react";
import type { PricingConfig, ServiceConfig } from "@/types/orders";
import type { PlatformSettings } from "@/services/shopPricing";

interface PricingPreviewProps {
  pricingConfigs: PricingConfig[];
  platformSettings: PlatformSettings | null;
  servicesConfigs: ServiceConfig[];
}

export default function PricingPreview({
  pricingConfigs,
  platformSettings,
  servicesConfigs,
}: PricingPreviewProps) {
  const [pages, setPages] = useState<number>(10);
  const [copies, setCopies] = useState<number>(1);
  const [paperSize, setPaperSize] = useState<"A4" | "A3">("A4");
  const [printType, setPrintType] = useState<"black_white" | "colour">("black_white");
  const [printSide, setPrintSide] = useState<"single" | "double">("single");
  const [isPriority, setIsPriority] = useState<boolean>(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("none");

  // Calculate pricing breakdown in real-time
  const breakdown = useMemo(() => {
    // 1. Find unit price for selected combination
    const activeConfig = pricingConfigs.find(
      (c) =>
        c.paper_size === paperSize &&
        c.print_type === printType &&
        c.print_side === printSide
    );

    const unitPrice = activeConfig?.shop_price ?? (printType === "colour" ? 10 : 2);
    const convenienceFeeRate = activeConfig?.convenience_fee ?? 0.5;

    // 2. Printing cost:
    // If double side, effective pages printed per sheet is pages/2 rounded up or pages count
    const totalSheets = printSide === "double" ? Math.ceil(pages / 2) : pages;
    const printCost = totalSheets * copies * unitPrice;

    // 3. Convenience fee per document
    const convFee = convenienceFeeRate * copies;

    // 4. Platform fee
    const platFee = platformSettings?.platform_fee ?? 2;

    // 5. Priority fee
    const prioFee = isPriority ? (platformSettings?.priority_fee ?? 3) : 0;

    // 6. Selected service fee
    const selectedService = servicesConfigs.find((s) => s.id === selectedServiceId);
    const serviceFee = selectedService ? selectedService.price * copies : 0;

    // 7. Tax (GST - 0 backend)
    const tax = 0;

    const grandTotal = printCost + convFee + platFee + prioFee + serviceFee + tax;

    return {
      unitPrice,
      totalSheets,
      printCost,
      convFee,
      platFee,
      prioFee,
      serviceFee,
      tax,
      grandTotal,
      isConfigActive: activeConfig ? activeConfig.is_active : true,
    };
  }, [
    pages,
    copies,
    paperSize,
    printType,
    printSide,
    isPriority,
    selectedServiceId,
    pricingConfigs,
    platformSettings,
    servicesConfigs,
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="rounded-2xl p-6 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-blue-950/20 border border-white/10 backdrop-blur-xl shadow-xl space-y-6"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Live Price Preview</h2>
            <p className="text-xs text-slate-400">Test real customer order calculations with current rate settings.</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
          Simulator
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Controls Column */}
        <div className="md:col-span-7 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Paper Size */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                Paper Format
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-white/10">
                {(["A4", "A3"] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setPaperSize(sz)}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                      paperSize === sz
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Print Type */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                Print Mode
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setPrintType("black_white")}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    printType === "black_white"
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  B&W
                </button>
                <button
                  type="button"
                  onClick={() => setPrintType("colour")}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    printType === "colour"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Colour
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Sides */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                Sides
              </label>
              <select
                value={printSide}
                onChange={(e) => setPrintSide(e.target.value as any)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-2 px-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="single">Single Side</option>
                <option value="double">Double Side</option>
              </select>
            </div>

            {/* Pages */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                Pages Count
              </label>
              <input
                type="number"
                min="1"
                max="5000"
                value={pages}
                onChange={(e) => setPages(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-1.5 px-3 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {/* Copies */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                Copies
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={copies}
                onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-1.5 px-3 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Priority Express Toggle */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                Priority Queue
              </label>
              <button
                type="button"
                onClick={() => setIsPriority(!isPriority)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  isPriority
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                    : "bg-slate-950/80 border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Priority Express
                </span>
                <span>{isPriority ? "YES (+₹" + (platformSettings?.priority_fee ?? 3) + ")" : "NO"}</span>
              </button>
            </div>

            {/* Finishing Service */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                Binding Service
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-2 px-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="none">None</option>
                {servicesConfigs
                  .filter((s) => s.is_active)
                  .map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.name} (+₹{svc.price})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Calculation Output Card */}
        <div className="md:col-span-5 p-5 rounded-xl bg-slate-950/90 border border-white/10 space-y-4 shadow-inner">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Calculation Breakdown
            </span>
            <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
              Rate: ₹{breakdown.unitPrice.toFixed(2)}/pg
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>
                Printing Total ({pages} pgs × {copies} cop)
              </span>
              <span className="text-slate-200 font-medium">
                ₹{(breakdown.printCost + breakdown.platFee + breakdown.convFee).toFixed(2)}
              </span>
            </div>

            {isPriority && (
              <div className="flex justify-between text-rose-300">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Priority Charge
                </span>
                <span className="font-medium">₹{breakdown.prioFee.toFixed(2)}</span>
              </div>
            )}

            {breakdown.serviceFee > 0 && (
              <div className="flex justify-between text-sky-300">
                <span>Binding Service</span>
                <span className="font-medium">₹{breakdown.serviceFee.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-500">
              <span>GST / Taxes</span>
              <span>Exempt (₹0.00)</span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Grand Total
              </span>
              <span className="text-2xl font-black text-emerald-400">
                ₹{breakdown.grandTotal.toFixed(2)}
              </span>
            </div>
            {!breakdown.isConfigActive && (
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-md">
                Config Disabled
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
