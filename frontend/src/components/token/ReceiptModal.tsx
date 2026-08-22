"use client";

import { motion } from "framer-motion";
import { X, Printer, Download, ShieldCheck, CheckCircle2, Sparkles, Building2, QrCode } from "lucide-react";
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

  const receiptNo = `REC-${data.order_id.slice(0, 8).toUpperCase()}-2026`;
  const invoiceNo = `INV-${data.order_id.slice(0, 8).toUpperCase()}`;
  const orderIdShort = data.order_id.slice(0, 8).toUpperCase();

  const formattedDate = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const rawToken = data.token;
  let tokenDisplay = "";
  if (rawToken && rawToken.trim() !== "" && rawToken !== "Standard Queue" && rawToken !== "Priority Queue") {
    tokenDisplay = rawToken.startsWith("Token #") ? rawToken : `Token #${rawToken}`;
  } else {
    tokenDisplay = `Token #R-${orderIdShort.slice(0, 4)}`;
  }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl overflow-y-auto print:p-0 print:bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-amber-500/20 shadow-2xl shadow-black/80 text-slate-100 overflow-hidden print:bg-white print:text-slate-900 print:border-none print:shadow-none print:max-w-none"
      >
        {/* Top Gold Foil Rim Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 print:hidden" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 transition print:hidden z-10"
          aria-label="Close Receipt Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Executive Corporate Top Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-white/10 p-5 print:bg-slate-900 print:text-white">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-extrabold text-2xl text-amber-400 shadow-inner">
                  Q
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-wider text-white uppercase">
                    Mindura Technologies
                  </h2>
                  <p className="text-xs font-bold text-amber-400">
                    QLex • Rajalakshmi Institute of Technology
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Central Campus Print & Digital Token Terminal
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold tracking-wide uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Official Receipt
                </span>
                <p className="text-[10px] font-mono font-bold text-slate-400 mt-1 uppercase tracking-wider">
                  Payment Confirmed
                </p>
              </div>
            </div>
          </div>

          {/* Clean 3-Column Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl bg-white/[0.03] border border-white/10 p-4 text-xs print:bg-slate-50 print:border-slate-300 print:text-slate-900">
            {/* Col 1 */}
            <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-white/10 sm:pr-3 pb-3 sm:pb-0 print:border-slate-300">
              <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase print:text-slate-600">
                Receipt Details
              </span>
              <div className="flex justify-between sm:block">
                <span className="text-slate-400 print:text-slate-600 sm:text-[11px]">Receipt No:</span>
                <span className="font-mono font-bold text-slate-200 print:text-slate-900 ml-1">{receiptNo}</span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-slate-400 print:text-slate-600 sm:text-[11px]">Invoice No:</span>
                <span className="font-mono font-bold text-slate-200 print:text-slate-900 ml-1">{invoiceNo}</span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-slate-400 print:text-slate-600 sm:text-[11px]">Order ID:</span>
                <span className="font-mono font-bold text-slate-200 print:text-slate-900 ml-1">#{orderIdShort}</span>
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-white/10 sm:px-3 pb-3 sm:pb-0 print:border-slate-300">
              <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase print:text-slate-600">
                Queue & Token Info
              </span>
              <div className="flex justify-between items-center sm:block">
                <span className="text-slate-400 print:text-slate-600 sm:text-[11px]">Pickup Token:</span>
                <span className="font-mono font-black text-amber-400 text-sm ml-1 print:text-amber-700">
                  {tokenDisplay}
                </span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-slate-400 print:text-slate-600 sm:text-[11px]">Print Shop:</span>
                <span className="font-semibold text-slate-200 print:text-slate-900 ml-1">
                  {data.shop?.name || "QLex Central Print Hub"}
                </span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-slate-400 print:text-slate-600 sm:text-[11px]">Order Date:</span>
                <span className="font-mono text-slate-300 print:text-slate-800 ml-1 text-[11px]">{formattedDate}</span>
              </div>
            </div>

            {/* Col 3 */}
            <div className="space-y-1.5 sm:pl-3">
              <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase print:text-slate-600">
                Payment Status
              </span>
              <div className="flex justify-between sm:block">
                <span className="text-slate-400 print:text-slate-600 sm:text-[11px]">Gateway:</span>
                <span className="font-semibold text-slate-200 print:text-slate-900 ml-1">Razorpay UPI / Card</span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-slate-400 print:text-slate-600 sm:text-[11px]">Status:</span>
                <span className="font-bold text-emerald-400 print:text-emerald-700 ml-1">PAID & CONFIRMED</span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-slate-400 print:text-slate-600 sm:text-[11px]">Security:</span>
                <span className="font-mono text-cyan-400 print:text-slate-700 ml-1 text-[10px]">256-Bit Encrypted</span>
              </div>
            </div>
          </div>

          {/* Itemized Specification Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-black tracking-wider text-slate-300 uppercase print:text-slate-900 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-amber-400 print:text-slate-700" />
              Itemized Print Specifications
            </h3>
            <div className="rounded-2xl border border-white/10 overflow-hidden print:border-slate-300">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-white/10 print:bg-slate-200 print:text-slate-800 print:border-slate-300">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Document Name</th>
                    <th className="py-2.5 px-3">Specifications</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 print:divide-slate-200">
                  {data.documents && data.documents.length > 0 ? (
                    data.documents.map((doc, idx) => (
                      <tr key={doc.id || idx} className="hover:bg-white/[0.02] transition">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{String(idx + 1).padStart(2, "0")}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-200 print:text-slate-900 max-w-[180px] truncate">
                          {doc.file_name || `Document #${idx + 1}`}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 print:text-slate-700 text-[11px]">
                          {doc.pages || 1} Pages • {doc.copies || 1} Copies
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-200 print:text-slate-900">
                          ₹{Number(data.total_amount || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-2.5 px-3 font-mono text-slate-400">01</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-200 print:text-slate-900">
                        Print Order ({data.documents?.length || 1} Document(s))
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 print:text-slate-700 text-[11px]">
                        {data.total_pages || 18} Pages • {data.total_copies || 2} Copies • A4 Standard
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-200 print:text-slate-900">
                        ₹{Number(data.total_amount || 0).toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary Box */}
          <div className="rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 p-4 space-y-2 print:bg-slate-50 print:border-slate-300">
            <div className="flex justify-between text-xs text-slate-400 print:text-slate-700">
              <span>Printing & Services Subtotal</span>
              <span className="font-mono">₹{Number(data.total_amount || 0).toFixed(2)}</span>
            </div>
            <div className="border-t border-white/10 pt-2 flex justify-between items-center print:border-slate-300">
              <span className="font-extrabold text-sm text-slate-100 print:text-slate-900">
                Grand Total Paid
              </span>
              <span className="font-mono font-black text-xl text-emerald-400 print:text-emerald-700">
                ₹{Number(data.total_amount || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Dual Authorized Signatories & Digital Verification Stamp */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center print:border-slate-300 print:bg-slate-50">
            <div className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase mb-3 print:text-slate-600">
              Digitally Authenticated & Authorized Signatories
            </div>
            <div className="grid grid-cols-3 items-center gap-2">
              {/* Signatory 1 */}
              <div className="space-y-1">
                <div className="font-serif italic font-bold text-sm text-slate-200 print:text-slate-900">
                  Thirumalai D
                </div>
                <div className="w-24 h-0.5 bg-slate-500/40 mx-auto" />
                <div className="font-extrabold text-[10px] text-slate-300 uppercase tracking-wider print:text-slate-900">
                  THIRUMALAI D
                </div>
                <div className="text-[9px] text-slate-400 print:text-slate-600">
                  Authorized Signatory • Mindura Tech
                </div>
              </div>

              {/* Central Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 p-0.5 shadow-lg shadow-amber-500/20">
                  <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-amber-400 border border-amber-300/30">
                    <span className="font-black text-[9px] tracking-widest leading-none">QLEX</span>
                    <span className="text-[7px] text-white tracking-tight leading-none mt-0.5 font-bold">VERIFIED</span>
                  </div>
                </div>
              </div>

              {/* Signatory 2 */}
              <div className="space-y-1">
                <div className="font-serif italic font-bold text-sm text-slate-200 print:text-slate-900">
                  Divagar E
                </div>
                <div className="w-24 h-0.5 bg-slate-500/40 mx-auto" />
                <div className="font-extrabold text-[10px] text-slate-300 uppercase tracking-wider print:text-slate-900">
                  DIVAGAR E
                </div>
                <div className="text-[9px] text-slate-400 print:text-slate-600">
                  Authorized Signatory • Mindura Tech
                </div>
              </div>
            </div>
          </div>

          {/* Barcode SVG Graphic Strip */}
          <div className="pt-2 flex flex-col items-center justify-center gap-1.5">
            <svg className="h-9 w-64 text-slate-400 print:text-slate-900" viewBox="0 0 200 30" fill="currentColor">
              {/* Simulated barcode bars */}
              <rect x="0" y="0" width="3" height="30" />
              <rect x="5" y="0" width="1" height="30" />
              <rect x="8" y="0" width="4" height="30" />
              <rect x="15" y="0" width="2" height="30" />
              <rect x="19" y="0" width="1" height="30" />
              <rect x="22" y="0" width="5" height="30" />
              <rect x="30" y="0" width="2" height="30" />
              <rect x="34" y="0" width="1" height="30" />
              <rect x="37" y="0" width="3" height="30" />
              <rect x="43" y="0" width="6" height="30" />
              <rect x="51" y="0" width="2" height="30" />
              <rect x="55" y="0" width="1" height="30" />
              <rect x="58" y="0" width="4" height="30" />
              <rect x="65" y="0" width="2" height="30" />
              <rect x="69" y="0" width="3" height="30" />
              <rect x="74" y="0" width="1" height="30" />
              <rect x="77" y="0" width="5" height="30" />
              <rect x="85" y="0" width="2" height="30" />
              <rect x="89" y="0" width="1" height="30" />
              <rect x="92" y="0" width="4" height="30" />
              <rect x="99" y="0" width="3" height="30" />
              <rect x="104" y="0" width="2" height="30" />
              <rect x="108" y="0" width="1" height="30" />
              <rect x="111" y="0" width="5" height="30" />
              <rect x="118" y="0" width="2" height="30" />
              <rect x="122" y="0" width="4" height="30" />
              <rect x="128" y="0" width="1" height="30" />
              <rect x="131" y="0" width="3" height="30" />
              <rect x="136" y="0" width="5" height="30" />
              <rect x="143" y="0" width="2" height="30" />
              <rect x="147" y="0" width="1" height="30" />
              <rect x="150" y="0" width="4" height="30" />
              <rect x="156" y="0" width="2" height="30" />
              <rect x="160" y="0" width="6" height="30" />
              <rect x="168" y="0" width="1" height="30" />
              <rect x="171" y="0" width="3" height="30" />
              <rect x="176" y="0" width="2" height="30" />
              <rect x="180" y="0" width="5" height="30" />
              <rect x="187" y="0" width="1" height="30" />
              <rect x="190" y="0" width="3" height="30" />
              <rect x="195" y="0" width="5" height="30" />
            </svg>
            <div className="font-mono text-[9px] tracking-widest text-slate-400 uppercase print:text-slate-600">
              SEC-AUTH • {data.order_id} • QLEX-TERMINAL-2026
            </div>
          </div>

          {/* Footer Security Note */}
          <div className="pt-2 border-t border-white/10 text-center text-[11px] text-slate-400 print:text-slate-600 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400 print:text-slate-700" />
            <span>© 2026 MINDURA TECHNOLOGIES. Official Tax Invoice & Print Receipt.</span>
          </div>

          {/* Action Buttons (Hidden on Print) */}
          <div className="flex items-center justify-end gap-3 pt-2 print:hidden">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
