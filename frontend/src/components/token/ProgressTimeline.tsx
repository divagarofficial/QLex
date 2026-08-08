"use client";

import { motion } from "framer-motion";
import { Check, Clock, Printer, PackageCheck, CreditCard, Inbox } from "lucide-react";
import type { OrderStatus } from "@/types/token";

interface ProgressTimelineProps {
  status: OrderStatus | string;
  paymentStatus?: string;
}

export default function ProgressTimeline({ status, paymentStatus = "PAID" }: ProgressTimelineProps) {
  const normStatus = (status || "").toUpperCase();

  // Determine current active step index (0 to 4)
  let activeIndex = 1; // Default: Order Received
  if (paymentStatus === "PAID" && normStatus === "WAITING") activeIndex = 1;
  else if (normStatus === "ACCEPTED") activeIndex = 1;
  else if (normStatus === "PRINTING") activeIndex = 2;
  else if (normStatus === "READY_FOR_PICKUP" || normStatus === "READY") activeIndex = 3;
  else if (normStatus === "COLLECTED" || normStatus === "COMPLETED") activeIndex = 4;
  else if (normStatus === "CANCELLED") activeIndex = -1;

  const steps = [
    {
      id: "payment",
      title: "Payment Successful",
      desc: "Razorpay Verified",
      icon: CreditCard,
    },
    {
      id: "received",
      title: "Order Received",
      desc: "Shop Acknowledged",
      icon: Inbox,
    },
    {
      id: "printing",
      title: "Printing",
      desc: "In Print Queue",
      icon: Printer,
    },
    {
      id: "ready",
      title: "Ready for Pickup",
      desc: "At Shop Counter",
      icon: Clock,
    },
    {
      id: "collected",
      title: "Collected",
      desc: "Handed over to student",
      icon: PackageCheck,
    },
  ];

  return (
    <div className="w-full rounded-3xl bg-[#070b14]/75 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Order Progress</span>
            <span className="text-xs font-normal text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
              Live Tracker
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Real-time update from shop counter</p>
        </div>
      </div>

      {/* DESKTOP HORIZONTAL TIMELINE */}
      <div className="hidden md:flex items-start justify-between relative py-4">
        {/* Horizontal Connector Track */}
        <div className="absolute top-[34px] left-[5%] right-[5%] h-1 bg-white/10 rounded-full z-0" />
        
        {/* Active Animated Fill Line */}
        {activeIndex >= 0 && (
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${(activeIndex / (steps.length - 1)) * 90}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-[34px] left-[5%] h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full z-0 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
          />
        )}

        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center text-center w-1/5 group">
              {/* Step Circle Node */}
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.15 : 1,
                }}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 ${
                  isCompleted
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                    : isCurrent
                    ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_30px_rgba(59,130,246,0.7)] ring-4 ring-blue-500/20"
                    : "bg-slate-900/80 border-white/10 text-slate-500"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : isCurrent ? (
                  <StepIcon className="w-5 h-5 animate-pulse" />
                ) : (
                  <StepIcon className="w-5 h-5 opacity-60" />
                )}
              </motion.div>

              {/* Labels */}
              <div className="mt-3 px-1">
                <p
                  className={`text-xs font-bold transition-colors ${
                    isCurrent
                      ? "text-cyan-300"
                      : isCompleted
                      ? "text-white"
                      : "text-slate-500"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-[11px] text-slate-400/80 mt-0.5 font-normal">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* MOBILE VERTICAL TIMELINE */}
      <div className="md:hidden flex flex-col space-y-6 relative pl-2">
        {/* Vertical Track Line */}
        <div className="absolute top-4 bottom-4 left-6 w-0.5 bg-white/10 rounded-full z-0" />
        
        {/* Vertical Active Line */}
        {activeIndex >= 0 && (
          <motion.div
            initial={{ height: "0%" }}
            animate={{ height: `${(activeIndex / (steps.length - 1)) * 85}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-4 left-6 w-0.5 bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-500 rounded-full z-0 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
          />
        )}

        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.id} className="relative z-10 flex items-center gap-4">
              {/* Step Circle Node */}
              <div
                className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border transition-all duration-300 ${
                  isCompleted
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    : isCurrent
                    ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.7)] ring-2 ring-blue-400/40"
                    : "bg-slate-900 border-white/10 text-slate-500"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <StepIcon className={`w-4 h-4 ${isCurrent ? "animate-pulse" : ""}`} />
                )}
              </div>

              {/* Text Info */}
              <div>
                <p
                  className={`text-sm font-bold ${
                    isCurrent
                      ? "text-cyan-300"
                      : isCompleted
                      ? "text-white"
                      : "text-slate-500"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
