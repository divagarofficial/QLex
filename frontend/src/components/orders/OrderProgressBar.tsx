"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STEPS = [
  { id: 1, label: "Upload" },
  { id: 2, label: "Options" },
  { id: 3, label: "Review" },
  { id: 4, label: "Payment" },
];

interface OrderProgressBarProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function OrderProgressBar({
  currentStep,
  onStepClick,
}: OrderProgressBarProps) {
  return (
    <nav aria-label="Order progress" className="w-full px-2">
      <ol className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isClickable = step.id < currentStep && onStepClick !== undefined;

          return (
            <li key={step.id} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => {
                  if (isClickable && onStepClick) onStepClick(step.id);
                }}
                disabled={!isClickable}
                className={cn(
                  "flex items-center gap-2 group transition-all duration-500",
                  isClickable ? "cursor-pointer" : "cursor-default"
                )}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Step ${step.id}: ${step.label}${isCompleted ? " (completed)" : ""}`}
              >
                <motion.div
                  animate={{ scale: isCurrent ? 1.1 : 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "relative flex items-center justify-center w-9 h-9 rounded-full",
                    "border transition-all duration-500",
                    isCompleted && "bg-champagne-500 border-champagne-500",
                    isCurrent && "border-champagne-500 bg-champagne-500/10",
                    !isCompleted && !isCurrent && "border-white/10 bg-white/[0.03]"
                  )}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Check size={16} className="text-[#1a1a1a]" />
                    </motion.div>
                  ) : (
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        isCurrent ? "text-champagne-500" : "text-white/30"
                      )}
                    >
                      {step.id}
                    </span>
                  )}
                </motion.div>
                <span
                  className={cn(
                    "hidden sm:block text-sm font-medium transition-all duration-300",
                    isCompleted && "text-champagne-400",
                    isCurrent && "text-white/80",
                    !isCompleted && !isCurrent && "text-white/30"
                  )}
                >
                  {step.label}
                </span>
              </button>
              {index < STEPS.length - 1 && (
                <div className="flex-1 mx-3">
                  <div className="h-[2px] bg-white/5 rounded-full relative overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{
                        width: isCompleted ? "100%" : "0%",
                      }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-y-0 left-0 bg-champagne-500 rounded-full"
                    />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
