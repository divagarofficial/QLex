"use client";

import { useRef } from "react";
import { Printer, Download, X, CheckCircle2, ShieldCheck, Building2 } from "lucide-react";
import Popup from "@/components/popup/Popup";
import type { PaymentItem } from "@/types/student";
import { generateReceiptPDF } from "@/utils/generateReceiptPDF";

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  payment: PaymentItem | null;
}

export default function ReceiptModal({
  open,
  onClose,
  payment,
}: ReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!payment) return null;

  const receiptNo = `REC-${payment.payment_id.slice(0, 8).toUpperCase()}-2026`;
  const invoiceNo = `INV-${payment.order_id.slice(0, 8).toUpperCase()}`;
  const orderIdShort = payment.order_id.slice(0, 8).toUpperCase();

  const formattedDate = payment.paid_at
    ? new Date(payment.paid_at).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      })
    : new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      });

  const amount = Number(payment.amount) || 0;

  const rawToken = payment.token;
  let tokenDisplay = "";
  if (rawToken && rawToken.trim() !== "" && rawToken !== "Standard Queue" && rawToken !== "Priority Queue") {
    tokenDisplay = rawToken.startsWith("Token #") ? rawToken : `Token #${rawToken}`;
  } else {
    tokenDisplay = `Token #R-${orderIdShort.slice(0, 4)}`;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generateReceiptPDF({
      order: {
        order_id: payment.order_id,
        token: payment.token || null,
        status: payment.status || "completed",
        payment_status: "paid",
        total_amount: amount,
        documents: 1,
        created_at: payment.paid_at || new Date().toISOString(),
      },
    });
  };

  return (
    <Popup
      open={open}
      onClose={onClose}
      variant="default"
      size="lg"
      showCloseButton
      title="Official Payment Receipt"
      description="Tax Invoice & Digital Token Receipt"
    >
      <div className="space-y-5 pt-1 text-slate-100 print:text-slate-900" ref={printRef}>
        {/* Executive Corporate Top Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-white/10 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-extrabold text-xl text-amber-400">
                Q
              </div>
              <div>
                <h3 className="text-base font-black tracking-wider text-white uppercase">
                  Mindura Technologies
                </h3>
                <p className="text-xs font-bold text-amber-400">
                  QLex • Rajalakshmi Institute of Technology
                </p>
                <p className="text-[10px] text-slate-400">
                  Central Campus Print & Digital Token Terminal
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Paid & Confirmed
              </span>
              <p className="text-[10px] font-mono font-bold text-slate-400 mt-1 uppercase">
                Official Receipt
              </p>
            </div>
          </div>
        </div>

        {/* 3-Column Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl bg-white/[0.03] border border-white/10 p-3.5 text-xs print:bg-slate-50 print:border-slate-300">
          {/* Col 1 */}
          <div className="space-y-1 sm:border-r border-white/10 sm:pr-3">
            <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              Receipt Details
            </span>
            <div className="flex justify-between sm:block">
              <span className="text-slate-400 sm:text-[11px]">Receipt No:</span>
              <span className="font-mono font-bold text-slate-200 ml-1">{receiptNo}</span>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-slate-400 sm:text-[11px]">Invoice No:</span>
              <span className="font-mono font-bold text-slate-200 ml-1">{invoiceNo}</span>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-slate-400 sm:text-[11px]">Order ID:</span>
              <span className="font-mono font-bold text-slate-200 ml-1">#{orderIdShort}</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-1 sm:border-r border-white/10 sm:px-3">
            <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              Queue & Token Info
            </span>
            <div className="flex justify-between items-center sm:block">
              <span className="text-slate-400 sm:text-[11px]">Pickup Token:</span>
              <span className="font-mono font-black text-amber-400 text-sm ml-1">
                {tokenDisplay}
              </span>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-slate-400 sm:text-[11px]">Payment Date:</span>
              <span className="font-mono text-slate-300 ml-1 text-[11px]">{formattedDate}</span>
            </div>
          </div>

          {/* Col 3 */}
          <div className="space-y-1 sm:pl-3">
            <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              Payment Status
            </span>
            <div className="flex justify-between sm:block">
              <span className="text-slate-400 sm:text-[11px]">Gateway:</span>
              <span className="font-semibold text-slate-200 ml-1">Razorpay UPI / Card</span>
            </div>
            <div className="flex justify-between sm:block">
              <span className="text-slate-400 sm:text-[11px]">Status:</span>
              <span className="font-bold text-emerald-400 ml-1">PAID & CONFIRMED</span>
            </div>
          </div>
        </div>

        {/* Breakdown Box */}
        <div className="space-y-2">
          <h4 className="text-xs font-black tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            Financial Breakdown
          </h4>
          <div className="space-y-2 rounded-2xl bg-white/[0.02] border border-white/10 p-3.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Printing Subtotal</span>
              <span className="font-mono text-slate-200">₹{amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2 font-black text-sm text-slate-100">
              <span>Grand Total Paid</span>
              <span className="font-mono text-emerald-400 text-lg">₹{amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Dual Signatories & Verification Stamp */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 text-center">
          <div className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase mb-2">
            Digitally Authenticated & Authorized Signatories
          </div>
          <div className="grid grid-cols-3 items-center gap-2">
            <div className="space-y-0.5">
              <div className="font-serif italic font-bold text-xs text-slate-200">
                Thirumalai D
              </div>
              <div className="w-20 h-0.5 bg-slate-500/40 mx-auto" />
              <div className="font-extrabold text-[9px] text-slate-300 uppercase">
                THIRUMALAI D
              </div>
              <div className="text-[8px] text-slate-400">
                Authorized Signatory
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 p-0.5 shadow-md">
                <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-amber-400 border border-amber-300/30">
                  <span className="font-black text-[8px] tracking-widest leading-none">QLEX</span>
                  <span className="text-[6px] text-white tracking-tight leading-none mt-0.5 font-bold">VERIFIED</span>
                </div>
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="font-serif italic font-bold text-xs text-slate-200">
                Divagar E
              </div>
              <div className="w-20 h-0.5 bg-slate-500/40 mx-auto" />
              <div className="font-extrabold text-[9px] text-slate-300 uppercase">
                DIVAGAR E
              </div>
              <div className="text-[8px] text-slate-400">
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>

        {/* Barcode Graphic Strip */}
        <div className="flex flex-col items-center justify-center gap-1">
          <svg className="h-7 w-56 text-slate-400" viewBox="0 0 200 30" fill="currentColor">
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
          <div className="font-mono text-[9px] tracking-widest text-slate-400 uppercase">
            SEC-AUTH • {payment.order_id} • QLEX-PAYMENT-2026
          </div>
        </div>

        {/* Footer Security Note */}
        <div className="flex items-center gap-1.5 justify-center text-[11px] text-amber-200/80 pt-1">
          <ShieldCheck size={15} className="shrink-0 text-amber-400" />
          <span>Digitally verified by QLex Razorpay Gateway • Mindura Technologies</span>
        </div>
      </div>

      <Popup.Footer>
        <button
          onClick={handleDownloadPDF}
          className="popup-btn-primary flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black"
        >
          <Download size={15} />
          <span>Download PDF</span>
        </button>
        <button
          onClick={handlePrint}
          className="popup-btn-secondary flex items-center gap-2"
        >
          <Printer size={15} />
          <span>Print Receipt</span>
        </button>
        <button onClick={onClose} className="popup-btn-secondary">
          Close
        </button>
      </Popup.Footer>
    </Popup>
  );
}
