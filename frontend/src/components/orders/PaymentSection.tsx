"use client";

import { motion } from "framer-motion";
import { CreditCard, Lock, Shield, ArrowRight, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreatePaymentResponse } from "@/types/orders";

interface PaymentSectionProps {
  grandTotal: number;
  creatingPayment: boolean;
  paymentData: CreatePaymentResponse | null;
  paymentError: string | null;
  onContinueToPayment: () => void;
}

export default function PaymentSection({
  grandTotal,
  creatingPayment,
  paymentData,
  paymentError,
  onContinueToPayment,
}: PaymentSectionProps) {
  return (
    <div className="space-y-6">
      {/* Order Total */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="deep-glass relative overflow-hidden"
      >
        <div className="deep-glass-reflection" />
        <div className="relative z-10 p-6 text-center">
          <p className="text-sm text-white/40 mb-2">Order Total</p>
          <motion.p
            key={grandTotal}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-5xl font-bold text-champagne-400"
          >
            ₹{grandTotal.toFixed(2)}
          </motion.p>
          <p className="text-xs text-white/30 mt-2">All taxes and fees included</p>
        </div>
      </motion.div>

      {/* Payment Method */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="deep-glass relative overflow-hidden"
      >
        <div className="deep-glass-reflection" />
        <div className="relative z-10 p-5">
          <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
            <CreditCard size={16} className="text-champagne-400" />
            Payment Method
          </h3>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white/30">R</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Razorpay</p>
              <p className="text-xs text-white/30">Credit Card • UPI • Net Banking • Wallet</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <button
          type="button"
          onClick={onContinueToPayment}
          disabled={creatingPayment}
          className={cn(
            "popup-btn-primary w-full",
            creatingPayment && "opacity-60 cursor-not-allowed"
          )}
          aria-label="Continue to payment"
        >
          {creatingPayment ? (
            <span className="flex items-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              Preparing Payment...
            </span>
          ) : paymentData ? (
            <span className="flex items-center gap-2">
              <CheckCircle size={18} />
              Payment Ready — Proceed
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Continue to Payment
              <ArrowRight size={18} />
            </span>
          )}
        </button>

        {paymentError && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10"
          >
            <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-300">{paymentError}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-center gap-4 text-xs text-white/20"
      >
        <span className="flex items-center gap-1">
          <Lock size={12} />
          Secure Payment
        </span>
        <span className="flex items-center gap-1">
          <Shield size={12} />
          SSL Encrypted
        </span>
      </motion.div>
    </div>
  );
}

