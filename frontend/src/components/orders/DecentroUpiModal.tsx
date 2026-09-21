"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Zap, X, ExternalLink, Loader2, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
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
  const [statusMessage, setStatusMessage] = useState("Waiting for UPI payment...");

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
        console.error("Decentro poll error:", err);
      }
    }

    intervalId = setInterval(checkStatus, 3000);
    return () => clearInterval(intervalId);
  }, [isOpen, orderId, onPaymentSuccess]);

  if (!isOpen) return null;

  // Fallback NPCI Compliant UPI Intent string if API returns empty
  const refCode = orderId ? `QLX_${orderId.slice(0, 8)}` : "QLX_ORDER";
  const fallbackUpi = upiIntent || `upi://pay?pa=thirudiva@upi&pn=${encodeURIComponent("Divagar E")}&tr=${refCode}&tn=${refCode}&am=${amount.toFixed(2)}&cu=INR&mc=5999`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b0f17] border border-champagne-500/30 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative overflow-hidden">
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
        <div className="text-center mb-5">
          <div className="w-11 h-11 rounded-2xl bg-champagne-500/15 border border-champagne-500/30 text-champagne-400 flex items-center justify-center mx-auto mb-2.5">
            <Zap className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/30 mb-1">
            ⚡ Direct UPI • Divagar E
          </div>
          <h2 className="text-lg font-bold text-white">Scan & Pay via UPI</h2>
          <p className="text-xs text-slate-400 mt-0.5">Payee: <strong className="text-white font-semibold">Divagar E</strong> (thirudiva@upi)</p>
        </div>

        {/* Total Amount Card */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs mb-4">
          <div>
            <span className="text-slate-400 block font-medium">Recipient VPA</span>
            <span className="font-bold text-champagne-300 font-mono">thirudiva@upi</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block font-medium">Total Owed</span>
            <span className="text-lg font-black text-champagne-400 font-mono">₹{amount.toFixed(2)}</span>
          </div>
        </div>


        {/* QR Code Container */}
        <div className="p-5 rounded-2xl bg-white text-slate-900 text-center shadow-xl border border-champagne-500/40 my-3">
          <div className="mb-2">
            <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full bg-slate-950 text-champagne-400">
              GPay • PhonePe • Paytm • BHIM
            </span>
          </div>

          <div className="p-3 bg-white inline-block rounded-xl border border-slate-200 shadow-inner my-1">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="Decentro Dynamic UPI QR" className="w-44 h-44 mx-auto rounded-lg" />
            ) : (
              <QRCodeSVG value={fallbackUpi} size={180} level="H" fgColor="#0b0f17" bgColor="#ffffff" />
            )}
          </div>

          <p className="text-[11px] font-bold text-slate-700 mt-2">
            Scan with any UPI App to Pay ₹{amount.toFixed(2)}
          </p>
        </div>

        {/* Direct Mobile UPI Intent Button */}
        <div className="mt-4 space-y-2.5">
          <a
            href={fallbackUpi}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-champagne-400 via-amber-400 to-amber-500 hover:from-champagne-300 hover:to-amber-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-champagne-500/20 transition-all flex items-center justify-center gap-2 text-center"
          >
            <span>Open UPI App (GPay / PhonePe)</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Verification Status Banner */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center gap-2 text-xs text-champagne-300/90 font-medium">
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
    </div>
  );
}
