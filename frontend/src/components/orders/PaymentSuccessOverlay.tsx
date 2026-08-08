"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, ShieldCheck, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";

interface PaymentSuccessOverlayProps {
  show: boolean;
  amount: number;
  paymentId?: string;
  orderId?: string;
  onRedirect?: () => void;
}

export default function PaymentSuccessOverlay({
  show,
  amount,
  paymentId,
  orderId,
  onRedirect,
}: PaymentSuccessOverlayProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!show) return;

    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [show]);

  useEffect(() => {
    if (!show || countdown > 0) return;

    if (onRedirect) {
      onRedirect();
    } else {
      router.push("/student/token");
    }
  }, [show, countdown, onRedirect, router]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 overflow-hidden"
      >
        {/* Ambient background glow */}
        <div className="absolute w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute w-[350px] h-[350px] bg-champagne-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md text-center">
          {/* GPay Style Checkmark Badge */}
          <div className="relative mx-auto w-28 h-28 flex items-center justify-center mb-6">
            {/* Pulsing ring outer */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.8, 1.25, 1.15], opacity: [0, 0.4, 0.2] }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 rounded-full bg-emerald-500/20"
            />
            {/* Ripple ring middle */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="absolute inset-2 rounded-full border-2 border-emerald-400/40"
            />
            {/* Main Circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.15,
              }}
              className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)]"
            >
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 22,
                  delay: 0.3,
                }}
              >
                <Check size={42} className="text-obsidian stroke-[3.5]" />
              </motion.div>
            </motion.div>
          </div>

          {/* Amount Display */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <p className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-1">
              Payment Successful
            </p>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">
              ₹{amount.toFixed(2)}
            </h2>
            <p className="text-sm text-white/50 mt-1">Paid to QLex Print Services</p>
          </motion.div>

          {/* Transaction Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="mt-6 deep-glass p-5 rounded-2xl border border-white/10 text-left space-y-3"
          >
            <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
              <span className="text-white/40 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-400" />
                Status
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                Verified &amp; Paid
              </span>
            </div>

            {orderId && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Order Reference</span>
                <span className="font-mono text-white/80 font-medium truncate max-w-[180px]">
                  #{orderId.slice(0, 8)}
                </span>
              </div>
            )}

            {paymentId && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Transaction ID</span>
                <span className="font-mono text-white/60 truncate max-w-[180px]">
                  {paymentId}
                </span>
              </div>
            )}
          </motion.div>

          {/* Auto Redirect Info & Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="mt-6 space-y-3"
          >
            <button
              type="button"
              onClick={() => {
                if (onRedirect) onRedirect();
                else router.push("/student/token");
              }}
              className="popup-btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base font-semibold shadow-lg"
            >
              <Ticket size={18} />
              View My Token Now
              <ArrowRight size={18} />
            </button>

            <p className="text-xs text-white/40">
              Redirecting to your token in{" "}
              <span className="text-champagne-400 font-bold font-mono">{countdown}s</span>...
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
