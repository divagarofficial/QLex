"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
}

/**
 * Premium Glass Panel — Deep glassmorphism
 * For larger container elements
 */
export default function GlassPanel({ children, className }: GlassPanelProps) {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.015,
      }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(
        "deep-glass group relative",
        className
      )}
    >
      {/* Environment reflection overlay — warm top-right + cool bottom-left */}
      <div className="deep-glass-reflection" />

      {/* Bottom rim cool light reflection */}
      <div className="deep-glass-rim" />

      {/* Light sweep on hover */}
      <div className="deep-glass-sweep" />

      {/* Content */}
      <div className="relative z-10 p-8">{children}</div>
    </motion.div>
  );
}

