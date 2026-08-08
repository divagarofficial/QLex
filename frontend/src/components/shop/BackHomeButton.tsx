"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function BackHomeButton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-6 flex justify-center"
    >
      <Link
        href="/"
        className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-zinc-400 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
        <span>Back to Home</span>
      </Link>
    </motion.div>
  );
}
