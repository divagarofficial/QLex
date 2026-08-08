"use client";

import { motion } from "framer-motion";
import { Check, Inbox, CreditCard, Layers, Printer, Clock, PackageCheck } from "lucide-react";

interface QueueProgressProps {
  orderStatus: string;
  paymentStatus: string;
}

export default function QueueProgress({ orderStatus, paymentStatus }: QueueProgressProps) {
  const normOrder = (orderStatus || "").toUpperCase();
  const normPay = (paymentStatus || "").toUpperCase();

  // Determine active stage index (0 to 5)
  let activeIndex = 0; // Default: Order Received

  if (normPay === "PAID" || normPay === "COMPLETED") {
    activeIndex = 1; // Payment Confirmed
  }

  if (normOrder === "WAITING" || normOrder === "QUEUED" || normOrder === "ACCEPTED") {
    activeIndex = 2; // Queued
  } else if (normOrder === "PRINTING") {
    activeIndex = 3; // Printing
  } else if (normOrder === "READY_FOR_PICKUP" || normOrder === "READY") {
    activeIndex = 4; // Ready for Pickup
  } else if (normOrder === "COLLECTED" || normOrder === "SERVED" || normOrder === "COMPLETED") {
    activeIndex = 5; // Collected
  }

  const stages = [
    {
      id: "received",
      title: "Order Received",
      icon: Inbox,
    },
    {
      id: "payment",
      title: "Payment Confirmed",
      icon: CreditCard,
    },
    {
      id: "queued",
      title: "Queued",
      icon: Layers,
    },
    {
      id: "printing",
      title: "Printing",
      icon: Printer,
    },
    {
      id: "ready",
      title: "Ready for Pickup",
      icon: Clock,
    },
    {
      id: "collected",
      title: "Collected",
      icon: PackageCheck,
    },
  ];

  return (
    <div className="w-full rounded-3xl bg-[#070b14]/80 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Queue Progress</h3>
          <p className="text-xs text-slate-400 mt-0.5">Automated queue lifecycle tracker</p>
        </div>
      </div>

      {/* DESKTOP HORIZONTAL PROGRESS */}
      <div className="hidden md:flex items-start justify-between relative py-4">
        {/* Track background line */}
        <div className="absolute top-[32px] left-[4%] right-[4%] h-1 bg-white/10 rounded-full z-0" />

        {/* Active filled line */}
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${(activeIndex / (stages.length - 1)) * 92}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute top-[32px] left-[4%] h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full z-0 shadow-[0_0_12px_rgba(6,182,212,0.7)]"
        />

        {stages.map((stage, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const StageIcon = stage.icon;

          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center text-center w-1/6">
              {/* Stage Node Circle */}
              <motion.div
                animate={{
                  scale: isCurrent ? 1.15 : 1,
                }}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                  isCompleted
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    : isCurrent
                    ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_25px_rgba(59,130,246,0.8)] ring-4 ring-blue-500/20"
                    : "bg-slate-900 border-white/10 text-slate-600"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <StageIcon className={`w-4 h-4 ${isCurrent ? "animate-pulse" : ""}`} />
                )}
              </motion.div>

              {/* Title */}
              <p
                className={`mt-2.5 text-xs font-semibold ${
                  isCurrent
                    ? "text-cyan-300"
                    : isCompleted
                    ? "text-white"
                    : "text-slate-500"
                }`}
              >
                {stage.title}
              </p>
            </div>
          );
        })}
      </div>

      {/* MOBILE VERTICAL PROGRESS */}
      <div className="md:hidden flex flex-col space-y-5 relative pl-2">
        {/* Track Line */}
        <div className="absolute top-3 bottom-3 left-5 w-0.5 bg-white/10 rounded-full z-0" />

        {/* Active Line */}
        <motion.div
          initial={{ height: "0%" }}
          animate={{ height: `${(activeIndex / (stages.length - 1)) * 88}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute top-3 left-5 w-0.5 bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-500 rounded-full z-0 shadow-[0_0_12px_rgba(6,182,212,0.7)]"
        />

        {stages.map((stage, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const StageIcon = stage.icon;

          return (
            <div key={stage.id} className="relative z-10 flex items-center gap-3.5">
              <div
                className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center border transition-all duration-300 ${
                  isCompleted
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                    : isCurrent
                    ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.8)] ring-2 ring-blue-400/40"
                    : "bg-slate-900 border-white/10 text-slate-600"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <StageIcon className={`w-3.5 h-3.5 ${isCurrent ? "animate-pulse" : ""}`} />
                )}
              </div>

              <p
                className={`text-xs font-semibold ${
                  isCurrent
                    ? "text-cyan-300"
                    : isCompleted
                    ? "text-white"
                    : "text-slate-500"
                }`}
              >
                {stage.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
