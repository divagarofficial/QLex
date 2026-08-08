"use client";

import { useRef } from "react";
import { Printer, Download, X, CheckCircle2, Shield, Store } from "lucide-react";
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

  const receiptNo = `REC-${payment.payment_id.slice(0, 8).toUpperCase()}`;
  const invoiceNo = `INV-${payment.order_id.slice(0, 8).toUpperCase()}`;
  const dateStr = payment.paid_at
    ? new Date(payment.paid_at).toLocaleString([], {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleString();

  const amount = Number(payment.amount);
  const printingSubtotal = amount.toFixed(2);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generateReceiptPDF({
      order: {
        order_id: payment.order_id,
        token: payment.token || null,
        status: "completed",
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
      size="md"
      showCloseButton
      title="Official Payment Receipt"
      description="Tax Invoice & Digital Receipt"
    >
      <div className="space-y-6 pt-2" ref={printRef}>
        {/* Header Branding */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black text-xl">
              Q
            </div>
            <div>
              <h3 className="font-bold text-white/95 text-base">QLex Print Hub</h3>
              <div className="flex items-center gap-1 text-[11px] text-white/50">
                <Store size={12} />
                <span>Central Campus Terminal</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
              <CheckCircle2 size={12} /> Paid
            </span>
            <div className="mt-1 font-mono text-[10px] text-white/40">
              {receiptNo}
            </div>
          </div>
        </div>

        {/* Invoice Metadata */}
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white/[0.03] border border-white/10 p-3.5 text-xs">
          <div>
            <span className="text-white/40">Receipt Number</span>
            <div className="font-mono font-bold text-white/90">{receiptNo}</div>
          </div>
          <div>
            <span className="text-white/40">Invoice Number</span>
            <div className="font-mono font-bold text-white/90">{invoiceNo}</div>
          </div>
          <div>
            <span className="text-white/40">Token Assigned</span>
            <div className="font-mono font-bold text-amber-300">
              {payment.token ? `Token #${payment.token}` : "Standard Queue"}
            </div>
          </div>
          <div>
            <span className="text-white/40">Payment Date</span>
            <div className="font-mono text-white/80">{dateStr}</div>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-white/70 uppercase tracking-wider">
            Fee Breakdown
          </h4>
          <div className="space-y-1.5 rounded-2xl bg-white/[0.02] border border-white/10 p-3.5 text-xs">
            <div className="flex justify-between text-white/70">
              <span>Printing Subtotal</span>
              <span className="font-mono">₹{printingSubtotal}</span>
            </div>

            <div className="flex justify-between border-t border-white/10 pt-2 font-bold text-sm text-white/95">
              <span>Grand Total Paid</span>
              <span className="font-mono text-emerald-400">₹{amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Security Note */}
        <div className="flex items-center gap-2 rounded-xl bg-amber-500/[0.05] border border-amber-500/20 p-3 text-[11px] text-amber-200/80">
          <Shield size={16} className="shrink-0 text-amber-400" />
          <span>
            Digitally verified by QLex Razorpay Payment Gateway. Keep this receipt for print collection.
          </span>
        </div>
      </div>

      <Popup.Footer>
        <button
          onClick={handleDownloadPDF}
          className="popup-btn-primary flex items-center gap-2"
        >
          <Download size={15} />
          <span>Download PDF</span>
        </button>
        <button
          onClick={handlePrint}
          className="popup-btn-secondary flex items-center gap-2"
        >
          <Printer size={15} />
          <span>Print</span>
        </button>
        <button onClick={onClose} className="popup-btn-secondary">
          Close
        </button>
      </Popup.Footer>
    </Popup>
  );
}
