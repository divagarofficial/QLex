"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function GlassButton({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="
      crystal-btn
      group
      "
    >
      <span className="relative flex items-center gap-2">
        {children}
        <ArrowRight
          className="transition-transform duration-400 group-hover:translate-x-1"
          size={16}
        />
      </span>
    </motion.button>
  );
}

