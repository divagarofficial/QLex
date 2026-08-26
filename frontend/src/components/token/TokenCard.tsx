"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, QrCode, Sparkles, ShieldCheck, Maximize2, X } from "lucide-react";
import type { OrderTokenData } from "@/types/token";
import StatusBadge from "./StatusBadge";

interface TokenCardProps {
  data: OrderTokenData;
}

export default function TokenCard({ data }: TokenCardProps) {
  const [copied, setCopied] = useState(false);
  const [showLargeQR, setShowLargeQR] = useState(false);

  const qrPayload = JSON.stringify({
    order_id: data.order_id,
    student_id: data.student_id || "STU-DEMO",
    token: data.token,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(data.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative group w-full"
      >
        {/* Glow border ring effect */}
        <div className="absolute -inset-0.5 rounded-[34px] bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 opacity-40 group-hover:opacity-75 blur-xl transition duration-700 pointer-events-none" />

        {/* Glass Card Container */}
        <div className="relative rounded-[32px] bg-[#070b14]/85 backdrop-blur-2xl border border-white/15 p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-500 hover:border-cyan-400/30">
          
          {/* Subtle top reflective rim line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />

          {/* Background watermark icon */}
          <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none text-white select-none">
            <QrCode className="w-72 h-72" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            
            {/* Top Bar: Label & Status Badge */}
            <div className="w-full flex items-center justify-between gap-2 mb-6">
              {data.token && data.token.startsWith("S-") ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-xs font-extrabold text-purple-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Satellite Pickup Token</span>
                </div>
              ) : data.is_priority || (data.token && data.token.startsWith("P-")) ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-xs font-extrabold text-amber-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Priority Pickup Token</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-semibold text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Regular Pickup Token</span>
                </div>
              )}
              <StatusBadge status={data.status} />
            </div>

            {/* Large Token Title */}
            <div className="relative my-2 group/token cursor-pointer" onClick={handleCopy}>
              <p className="text-xs uppercase tracking-widest font-semibold text-slate-400 mb-1">
                Your Token Number
              </p>
              
              <div className="relative inline-flex items-center justify-center gap-3">
                <span className="text-5xl sm:text-7xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 font-mono drop-shadow-[0_0_35px_rgba(56,189,248,0.4)]">
                  {data.token}
                </span>

                {/* Copy Button Icon */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy();
                  }}
                  title="Copy Token"
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition duration-200"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-slate-300" />
                  )}
                </button>
              </div>

              {copied && (
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="block text-xs text-emerald-400 font-medium mt-1"
                >
                  Token copied to clipboard!
                </motion.span>
              )}
            </div>

            {/* Order ID */}
            <div className="mt-2 mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900/60 border border-white/10 text-xs font-mono text-slate-300">
              <span className="text-slate-500">Order ID:</span>
              <span className="font-semibold text-cyan-300">#{data.order_id}</span>
            </div>

            {/* Center QR Code Container */}
            <div className="relative my-2 p-4 sm:p-5 rounded-2xl bg-white/95 border border-white/20 shadow-2xl group/qr cursor-pointer transition-transform duration-300 hover:scale-105"
                 onClick={() => setShowLargeQR(true)}>
              
              {/* Corner Frame Markers */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-600" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-600" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-600" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-600" />

              <QRCodeSVG
                value={qrPayload}
                size={180}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="H"
                includeMargin={false}
              />

              {/* Hover Overlay hint */}
              <div className="absolute inset-0 rounded-2xl bg-slate-950/60 opacity-0 group-hover/qr:opacity-100 flex items-center justify-center gap-2 text-white text-xs font-medium backdrop-blur-xs transition duration-300">
                <Maximize2 className="w-4 h-4 text-cyan-300" />
                <span>Tap to Expand</span>
              </div>
            </div>

            {/* Subtitle instructions */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-300/90 font-medium">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Present this QR or Token during pickup.</span>
            </div>

          </div>
        </div>
      </motion.div>

      {/* Expanded Modal for QR Code */}
      <AnimatePresence>
        {showLargeQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-white/20 p-8 shadow-2xl text-center flex flex-col items-center"
            >
              <button
                type="button"
                onClick={() => setShowLargeQR(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-white mb-1">Pickup QR Code</h3>
              <p className="text-xs text-slate-400 mb-6 font-mono">Token: {data.token}</p>

              <div className="p-6 bg-white rounded-2xl shadow-xl">
                <QRCodeSVG
                  value={qrPayload}
                  size={240}
                  bgColor="#ffffff"
                  fgColor="#020617"
                  level="H"
                />
              </div>

              <p className="text-xs text-slate-300 mt-6">
                Scan using the QLex shop terminal during document pickup.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
