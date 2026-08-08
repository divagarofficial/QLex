"use client";

import { motion } from "framer-motion";
import { Check, Clock, Printer, PackageCheck, AlertCircle, Sparkles } from "lucide-react";

interface QueueTimelineProps {
  myToken: string | null;
  status: string | null; // e.g. WAITING, PRINTING, READY, SERVED
  studentsAhead: number;
}

export default function QueueTimeline({
  myToken,
  status,
  studentsAhead,
}: QueueTimelineProps) {
  // Determine current timeline step (0 to 5)
  const calculateCurrentStep = (): number => {
    if (!myToken) return 0;
    const s = (status || "WAITING").toUpperCase();

    if (s === "SERVED" || s === "COMPLETED") return 5;
    if (s === "READY") return 5;
    if (s === "PRINTING") return 4;
    if (studentsAhead === 0) return 3; // Your Turn
    if (studentsAhead === 1) return 2; // 1 Token Ahead
    return 1; // X Tokens Ahead
  };

  const currentStep = calculateCurrentStep();

  const steps = [
    {
      id: 0,
      label: "Current Serving",
      subtext: "Shop processing tokens",
      icon: Clock,
    },
    {
      id: 1,
      label: studentsAhead > 1 ? `${studentsAhead} Tokens Ahead` : "In Queue",
      subtext: "Waiting for turn",
      icon: Clock,
    },
    {
      id: 2,
      label: "1 Token Ahead",
      subtext: "Next in line",
      icon: Clock,
    },
    {
      id: 3,
      label: "Your Turn",
      subtext: "Preparing print job",
      icon: Sparkles,
    },
    {
      id: 4,
      label: "Printing",
      subtext: "Document on bed",
      icon: Printer,
    },
    {
      id: 5,
      label: "Ready for Pickup",
      subtext: "Collect at counter",
      icon: PackageCheck,
    },
  ];

  return (
    <div className="deep-glass relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-white/10">
      <div className="deep-glass-reflection" />
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white/90">Queue Timeline</h3>
            <p className="text-xs text-white/50">
              Live progression of your print order from queue to pickup
            </p>
          </div>
          {myToken && (
            <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-mono text-amber-300">
              {myToken}
            </span>
          )}
        </div>

        {/* Horizontal Timeline (Desktop/Tablet) */}
        <div className="relative hidden md:block py-4">
          {/* Track Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-white/10 rounded-full" />
          <motion.div
            className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-gradient-to-r from-amber-500 via-amber-400 to-cyan-400 rounded-full"
            initial={{ width: "0%" }}
            animate={{
              width: `${(currentStep / (steps.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* Nodes */}
          <div className="relative z-10 flex justify-between">
            {steps.map((step) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center text-center group cursor-default"
                >
                  <motion.div
                    animate={
                      isCurrent
                        ? { scale: [1, 1.15, 1], boxShadow: "0 0 20px rgba(245, 217, 142, 0.4)" }
                        : { scale: 1 }
                    }
                    transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                      isCompleted
                        ? "bg-amber-500 border-amber-400 text-slate-950"
                        : isCurrent
                        ? "bg-amber-400 border-amber-300 text-slate-950 shadow-lg shadow-amber-500/50"
                        : "bg-slate-900 border-white/20 text-white/40"
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={18} strokeWidth={3} />
                    ) : (
                      <Icon size={16} className={isCurrent ? "animate-pulse" : ""} />
                    )}
                  </motion.div>

                  <div className="mt-3 space-y-0.5 max-w-[100px]">
                    <div
                      className={`text-xs font-bold leading-tight ${
                        isCurrent
                          ? "text-amber-300"
                          : isCompleted
                          ? "text-white/80"
                          : "text-white/40"
                      }`}
                    >
                      {step.label}
                    </div>
                    <div className="text-[10px] text-white/40">{step.subtext}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vertical Timeline (Mobile) */}
        <div className="relative block md:hidden space-y-4 pl-4 border-l-2 border-white/10">
          {steps.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const Icon = step.icon;

            return (
              <div key={step.id} className="relative pl-6 pb-2">
                {/* Node Bullet */}
                <div
                  className={`absolute -left-[25px] top-0 flex h-7 w-7 items-center justify-center rounded-full border ${
                    isCompleted
                      ? "bg-amber-500 border-amber-400 text-slate-950"
                      : isCurrent
                      ? "bg-amber-400 border-amber-300 text-slate-950 shadow-md shadow-amber-400/50"
                      : "bg-slate-900 border-white/20 text-white/40"
                  }`}
                >
                  {isCompleted ? <Check size={14} /> : <Icon size={12} />}
                </div>

                <div>
                  <div
                    className={`text-xs font-bold ${
                      isCurrent ? "text-amber-300" : isCompleted ? "text-white/80" : "text-white/40"
                    }`}
                  >
                    {step.label}
                  </div>
                  <div className="text-[11px] text-white/40">{step.subtext}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
