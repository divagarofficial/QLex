"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "deep-glass group relative overflow-hidden",
        className
      )}
    >
      <div className="deep-glass-reflection" />
      <div className="deep-glass-rim" />
      <div className="deep-glass-sweep" />
      <div className="relative z-10 flex flex-col items-center justify-center px-8 py-12 text-center">
        <div className="crystal-badge mb-5 opacity-60">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-white/80">
          {title}
        </h3>
        <p className="mt-2 max-w-xs text-sm text-white/40">
          {description}
        </p>
        {action && (
          <button
            onClick={action.onClick}
            className="mt-6 crystal-btn"
            aria-label={action.label}
          >
            {action.label}
          </button>
        )}
      </div>
    </motion.div>
  );
}

