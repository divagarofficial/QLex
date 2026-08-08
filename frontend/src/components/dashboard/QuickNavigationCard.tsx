"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface QuickNavigationCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  route: string;
  index: number;
  badge?: string;
  badgeColor?: string;
  isPrimary?: boolean;
}

export default function QuickNavigationCard({
  icon,
  title,
  description,
  route,
  index,
  badge,
  badgeColor,
  isPrimary,
}: QuickNavigationCardProps) {
  const router = useRouter();

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.08 + index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(route)}
      className={cn(
        "deep-glass group relative w-full cursor-pointer overflow-hidden text-left focus-visible:outline-2 focus-visible:outline-amber-400/50 transition-all duration-500",
        isPrimary && "border-amber-400/30 bg-amber-400/[0.04] hover:border-amber-400/60"
      )}
      aria-label={`Navigate to ${title}`}
    >
      {/* Deep glass layers */}
      <div className="deep-glass-reflection" />
      <div className="deep-glass-rim" />
      <div className="deep-glass-sweep" />

      <div className="relative z-10 flex flex-col justify-between h-full p-5 sm:p-6">
        <div>
          {/* Header Row: Icon + Optional Badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/[0.12] backdrop-blur-xl text-white transition-all duration-500 group-hover:border-amber-400/40 group-hover:bg-amber-400/10 group-hover:text-amber-300 group-hover:scale-105 shadow-md">
              {icon}
            </div>

            {badge && (
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border shadow-sm",
                  badgeColor || "bg-amber-400/10 border-amber-400/30 text-amber-300"
                )}
              >
                {badge}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-white/90 transition-colors duration-300 group-hover:text-amber-200">
            {title}
          </h3>

          {/* Description */}
          <p className="mt-1 text-xs leading-relaxed text-zinc-400 font-light">
            {description}
          </p>
        </div>

        {/* Bottom arrow indicator */}
        <div className="mt-4 flex items-center justify-end">
          <div className="flex items-center gap-1 text-xs font-semibold text-zinc-400 transition-all duration-300 group-hover:text-amber-300 group-hover:translate-x-1">
            <span>Open</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
