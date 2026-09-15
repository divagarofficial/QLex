"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer, Copy, Check, ExternalLink, X, QrCode } from "lucide-react";

interface CounterQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopName: string;
  shopSlug: string;
}

export default function CounterQRCodeModal({
  isOpen,
  onClose,
  shopName,
  shopSlug,
}: CounterQRCodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://qlexmindtech.vercel.app";
  const kioskUrl = `${baseUrl}/${shopSlug}`;

  function handleCopy() {
    navigator.clipboard.writeText(kioskUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-obsidian border border-white/15 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-champagne-500/10 border border-champagne-500/20 text-champagne-400 flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Counter Standee & QR Code</h2>
          <p className="text-xs text-white/50 mt-1">
            Display this QR code on your front desk counter for instant walk-in prints.
          </p>
        </div>

        {/* Printable Standee Preview Box */}
        <div
          id="printable-counter-standee"
          className="p-6 rounded-2xl bg-white text-obsidian text-center shadow-lg border-2 border-champagne-500/40 my-4"
        >
          <div className="mb-2">
            <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full bg-obsidian text-champagne-400">
              ⚡ QLex Express Kiosk
            </span>
          </div>

          <h3 className="text-xl font-black text-obsidian tracking-tight mt-1">{shopName}</h3>
          <p className="text-xs font-semibold text-neutral-600 mb-4">
            Scan with your Phone Camera • No App Needed
          </p>

          {/* QR Code SVG */}
          <div className="p-3 bg-white inline-block rounded-xl border border-neutral-200 shadow-inner">
            <QRCodeSVG
              value={kioskUrl}
              size={180}
              level="H"
              includeMargin={false}
              fgColor="#030406"
              bgColor="#ffffff"
            />
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-200">
            <p className="text-[11px] font-bold text-neutral-800">
              1. Enter Phone ➔ 2. Upload PDF ➔ 3. Pay UPI ➔ 4. Collect Here
            </p>
            <p className="text-[10px] font-mono text-neutral-500 mt-1">{kioskUrl}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mt-5">
          <button
            onClick={handlePrint}
            className="py-3 px-4 rounded-xl bg-champagne-500 hover:bg-champagne-400 text-obsidian font-bold text-xs shadow-md shadow-champagne-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print Standee
          </button>

          <button
            onClick={handleCopy}
            className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-colors flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied Link!" : "Copy URL"}
          </button>
        </div>

        <div className="mt-3 text-center">
          <a
            href={kioskUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-champagne-300/80 hover:text-champagne-300 font-medium transition-colors"
          >
            Preview Customer Mobile View <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
