"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Zap, X, Copy, Check, Loader2, CheckCircle2, QrCode, Building2, ExternalLink } from "lucide-react";
import confetti from "canvas-confetti";
import { getExpressOrderStatus } from "@/services/expressOrders";

interface DecentroUpiModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  shopName: string;
  upiIntent?: string;
  qrCodeUrl?: string;
  onPaymentSuccess: () => void;
}

export default function DecentroUpiModal({
  isOpen,
  onClose,
  orderId,
  amount,
  shopName,
  upiIntent,
  qrCodeUrl,
  onPaymentSuccess,
}: DecentroUpiModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Waiting for UPI / Bank payment...");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const payeeName = "Divagar E";
  const accountNumber = "9360087608";
  const ifscCode = "AIRP0000001"; // Airtel Payments Bank
  const payeeVpa = "thirudiva@upi";
  
  // NPCI Account+IFSC auto-resolver VPA format for 1-tap pre-filled Bank Transfer:
  const accountIfscVpa = `${accountNumber}@${ifscCode}.ifsc.npci`;

  // Poll order status every 3 seconds to auto-detect Webhook verification
  useEffect(() => {
    if (!isOpen || !orderId) return;

    let intervalId: NodeJS.Timeout;
    async function checkStatus() {
      try {
        const res = await getExpressOrderStatus(orderId);
        if (res.payment_status === "PAID" || res.status === "PAID" || res.token_number) {
          setIsVerifying(true);
          setStatusMessage("Payment Verified! Generating Pickup Token...");
          confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
          setTimeout(() => {
            onPaymentSuccess();
          }, 1200);
        }
      } catch (err) {
        console.error("Direct UPI poll error:", err);
      }
    }

    intervalId = setInterval(checkStatus, 3000);
    return () => clearInterval(intervalId);
  }, [isOpen, orderId, onPaymentSuccess]);

  if (!isOpen) return null;

  const refCode = orderId ? `QLX_${orderId.slice(0, 8)}` : "QLX_ORDER";
  
  // Pre-filled Bank Transfer Intent (Account + IFSC Resolver)
  const bankTransferUpi = upiIntent || `upi://pay?pa=${accountIfscVpa}&pn=${encodeURIComponent(payeeName)}&tr=${refCode}&tn=${refCode}&am=${amount.toFixed(2)}&cu=INR`;
  
  // Standard VPA Intent
  const standardVpaUpi = `upi://pay?pa=${payeeVpa}&pn=${encodeURIComponent(payeeName)}&tr=${refCode}&tn=${refCode}&am=${amount.toFixed(2)}&cu=INR&mc=5999`;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b0f17] border border-champagne-500/30 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Top Glow Header */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-champagne-500 via-amber-400 to-champagne-300" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="w-11 h-11 rounded-2xl bg-champagne-500/15 border border-champagne-500/30 text-champagne-400 flex items-center justify-center mx-auto mb-2.5">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider border border-amber-500/30 mb-1">
            ⚡ Pre-Filled Bank & UPI Pay
          </div>
          <h2 className="text-lg font-bold text-white">Direct Bank / UPI Transfer</h2>
          <p className="text-xs text-slate-400 mt-0.5">Payee: <strong className="text-white font-semibold">{payeeName}</strong></p>
        </div>

        {/* Amount Header Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs mb-3">
          <div>
            <span className="text-slate-400 block font-medium">Bank Name</span>
            <span className="font-bold text-white text-xs">Airtel Payments Bank</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block font-medium">Total Owed</span>
            <span className="text-xl font-black text-champagne-400 font-mono">₹{amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Bank Account Details Card with Copy Buttons */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-2 mb-3 text-xs">
          <div className="text-[10px] uppercase font-black tracking-wider text-amber-400 border-b border-amber-500/20 pb-1 flex items-center justify-between">
            <span>Pre-Filled Bank Account Credentials</span>
            <span className="text-emerald-400 font-mono">100% Risk Free</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <span className="text-slate-400 block text-[11px]">Account Number</span>
              <span className="font-bold text-white font-mono text-sm">{accountNumber}</span>
            </div>
            <button
              onClick={() => copyToClipboard(accountNumber, "account")}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-[11px] transition-colors flex items-center gap-1 border border-amber-500/30"
            >
              {copiedField === "account" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-300" />
                  <span>Copy Acc</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between py-1 border-t border-slate-800/80">
            <div>
              <span className="text-slate-400 block text-[11px]">IFSC Code</span>
              <span className="font-bold text-white font-mono text-sm">{ifscCode}</span>
            </div>
            <button
              onClick={() => copyToClipboard(ifscCode, "ifsc")}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-[11px] transition-colors flex items-center gap-1 border border-amber-500/30"
            >
              {copiedField === "ifsc" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-300" />
                  <span>Copy IFSC</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Pre-Filled 1-Tap Intent Button */}
        <div className="space-y-2 mb-3">
          <a
            href={bankTransferUpi}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-champagne-400 to-amber-500 hover:from-amber-300 hover:to-champagne-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-center"
          >
            <Building2 className="w-4 h-4 text-slate-950" />
            <span>Pay via Pre-Filled Account & IFSC</span>
            <ExternalLink className="w-4 h-4 text-slate-950" />
          </a>
        </div>

        {/* QR Code Container */}
        <div className="p-3.5 rounded-2xl bg-white text-slate-900 text-center shadow-xl border border-champagne-500/40 my-2">
          <div className="mb-1.5">
            <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full bg-slate-950 text-champagne-400">
              OR Scan with GPay • PhonePe • Paytm
            </span>
          </div>

          <div className="p-2 bg-white inline-block rounded-xl border border-slate-200 shadow-inner">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="Direct Dynamic UPI QR" className="w-40 h-40 mx-auto rounded-lg" />
            ) : (
              <QRCodeSVG value={bankTransferUpi} size={160} level="H" fgColor="#0b0f17" bgColor="#ffffff" />
            )}
          </div>

          <p className="text-[11px] font-bold text-slate-800 mt-1 flex items-center justify-center gap-1">
            <QrCode className="w-3.5 h-3.5 text-amber-600" />
            <span>Scan to Transfer ₹{amount.toFixed(2)}</span>
          </p>
        </div>

        {/* Verification Status Banner */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center gap-2 text-xs text-champagne-300/90 font-medium mt-3">
          {isVerifying ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold">{statusMessage}</span>
            </>
          ) : (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-champagne-400" />
              <span>{statusMessage}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
