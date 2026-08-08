"use client";

import { motion } from "framer-motion";
import { X, Printer, CheckCircle2, Download, ShieldCheck } from "lucide-react";
import type { OrderTokenData } from "@/types/token";
import { generateReceiptPDF } from "@/utils/generateReceiptPDF";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: OrderTokenData;
}

export default function ReceiptModal({ isOpen, onClose, data }: ReceiptModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generateReceiptPDF({
      order: {
        order_id: data.order_id,
        token: data.token || null,
        status: "completed",
        payment_status: "paid",
        total_amount: Number(data.total_amount) || 0,
        documents: data.documents?.length || 1,
        created_at: new Date().toISOString(),
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-white/20 p-6 sm:p-8 shadow-2xl text-slate-100 print:bg-white print:text-slate-900 print:border-none print:shadow-none"
      >
        {/* Close Button (Hidden on Print) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10 print:border-slate-300">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 print:bg-slate-100 print:text-slate-900">
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">QLex Official Receipt</h2>
            <p className="text-xs text-slate-400 print:text-slate-600">College Print Ordering Platform</p>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="flex justify-between py-1 border-b border-white/5 print:border-slate-200">
            <span className="text-slate-400 print:text-slate-600">Order ID</span>
            <span className="font-mono font-bold">#{data.order_id}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-white/5 print:border-slate-200">
            <span className="text-slate-400 print:text-slate-600">Pickup Token</span>
            <span className="font-mono font-black text-cyan-300 print:text-slate-900 text-base">{data.token}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-white/5 print:border-slate-200">
            <span className="text-slate-400 print:text-slate-600">Print Shop</span>
            <span className="font-semibold">{data.shop?.name || "Campus Xerox Center"}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-white/5 print:border-slate-200">
            <span className="text-slate-400 print:text-slate-600">Total Documents</span>
            <span>{data.documents?.length || 1} Document(s)</span>
          </div>

          <div className="flex justify-between py-1 border-b border-white/5 print:border-slate-200">
            <span className="text-slate-400 print:text-slate-600">Total Pages / Copies</span>
            <span>{data.total_pages || 18} Pages • {data.total_copies || 2} Copies</span>
          </div>

          <div className="flex justify-between py-1 border-b border-white/5 print:border-slate-200">
            <span className="text-slate-400 print:text-slate-600">Payment Method</span>
            <span className="font-semibold text-emerald-400 print:text-emerald-700">Online UPI / Card (Paid)</span>
          </div>

          <div className="flex justify-between items-center py-3 mt-4 bg-white/5 print:bg-slate-100 p-3 rounded-xl">
            <span className="font-bold text-slate-200 print:text-slate-900 text-sm">Total Paid Amount</span>
            <span className="font-extrabold text-cyan-300 print:text-slate-900 text-lg">₹{data.total_amount || 47}</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-[11px] text-slate-400 print:text-slate-600 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400 print:text-slate-700" />
          <span>Verified Payment by Razorpay • QLex Token System</span>
        </div>

        {/* Action Buttons (Hidden on Print) */}
        <div className="mt-6 flex items-center justify-end gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
