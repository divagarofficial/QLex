"use client";

import { useState, useMemo } from "react";
import { PricingRule, ServiceRule, PlatformSettings } from "@/services/adminPricing";
import { Calculator, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

interface PricingCalculatorProps {
  pricingRules: PricingRule[];
  services: ServiceRule[];
  platformFee: number;
  priorityFee: number;
}

export default function PricingCalculator({
  pricingRules,
  services,
  platformFee,
  priorityFee,
}: PricingCalculatorProps) {
  const [pages, setPages] = useState<number>(10);
  const [copies, setCopies] = useState<number>(1);
  const [paperSize, setPaperSize] = useState<string>("A4");
  const [printType, setPrintType] = useState<string>("BW");
  const [printSide, setPrintSide] = useState<string>("SINGLE");
  const [isPriority, setIsPriority] = useState<boolean>(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("none");

  // Matched pricing rule from backend
  const matchedRule = useMemo(() => {
    const isBW = printType === "BW" || printType === "black_white";
    const isSingle = printSide === "SINGLE" || printSide === "single";
    return (
      pricingRules.find((r) => {
        if (r.paper_size !== paperSize) return false;
        const rPt = (r.print_type || "").toLowerCase();
        const rPs = (r.print_side || "").toLowerCase();
        const rIsBW = rPt === "bw" || rPt === "black_white" || rPt === "black_and_white";
        const rIsSingle = rPs === "single";
        return rIsBW === isBW && rIsSingle === isSingle;
      }) || { shop_price: 1.5, convenience_fee: 0.2, is_active: true }
    );
  }, [pricingRules, paperSize, printType, printSide]);

  // Selected service
  const matchedService = useMemo(() => {
    if (selectedServiceId === "none") return null;
    return services.find((s) => s.id === selectedServiceId) || null;
  }, [services, selectedServiceId]);

  // Real-time calculation
  const totalPages = Math.max(1, pages) * Math.max(1, copies);
  const printCost = totalPages * matchedRule.shop_price;
  const convenienceFeeTotal = totalPages * matchedRule.convenience_fee;
  const serviceCost = matchedService ? matchedService.price : 0;
  const appliedPriorityFee = isPriority ? priorityFee : 0;
  const tax = 0;

  const grandTotal = printCost + serviceCost + platformFee + convenienceFeeTotal + appliedPriorityFee + tax;

  return (
    <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-slate-800/90 p-5 shadow-xl backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Live Price Calculator & Simulator</h3>
            <p className="text-xs text-slate-400">Test pricing rules against test document parameters in real-time</p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 uppercase tracking-wider">
          Simulation Only
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        {/* Input Parameters Form */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Page Count</label>
              <input
                type="number"
                min="1"
                max="5000"
                value={pages}
                onChange={(e) => setPages(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono font-semibold focus:outline-none focus:border-cyan-500/80"
              />
            </div>
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Copies</label>
              <input
                type="number"
                min="1"
                max="100"
                value={copies}
                onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono font-semibold focus:outline-none focus:border-cyan-500/80"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Paper Size</label>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500/80 cursor-pointer"
              >
                <option value="A4">A4 Standard</option>
                <option value="A3">A3 Large</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Print Mode</label>
              <select
                value={printType}
                onChange={(e) => setPrintType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500/80 cursor-pointer"
              >
                <option value="BW">Black & White</option>
                <option value="COLOR">Full Colour</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Print Side</label>
              <select
                value={printSide}
                onChange={(e) => setPrintSide(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500/80 cursor-pointer"
              >
                <option value="SINGLE">Single Sided</option>
                <option value="DOUBLE">Double Sided</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Finishing Service</label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500/80 cursor-pointer"
              >
                <option value="none">None (Standard Staple)</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (+₹{s.price.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 cursor-pointer w-full hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={isPriority}
                  onChange={(e) => setIsPriority(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-800"
                />
                <span className="font-semibold text-xs text-slate-200">Include Priority Pass (+₹{priorityFee.toFixed(2)})</span>
              </label>
            </div>
          </div>
        </div>

        {/* Live Calculation Preview Breakdown */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 block border-b border-slate-800 pb-1.5">
              Itemized Cost Breakdown ({totalPages} Total Pages)
            </span>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Shop Printing Rate:</span>
                <span className="font-mono">₹{matchedRule.shop_price.toFixed(2)} / pg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Printing Subtotal:</span>
                <span className="font-semibold text-slate-200">₹{(printCost + platformFee + convenienceFeeTotal).toFixed(2)}</span>
              </div>
              {serviceCost > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Binding Service:</span>
                  <span className="font-semibold text-purple-400">₹{serviceCost.toFixed(2)}</span>
                </div>
              )}
              {appliedPriorityFee > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Priority Pass Fee:</span>
                  <span className="font-semibold text-emerald-400">₹{appliedPriorityFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Taxes (GST 0%):</span>
                <span className="font-mono text-slate-400">₹0.00</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="font-bold text-slate-200 text-xs">Simulated Order Total</span>
            <span className="text-lg font-extrabold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
              ₹{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
