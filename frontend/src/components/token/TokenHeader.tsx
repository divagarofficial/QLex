"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Ticket } from "lucide-react";

export default function TokenHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative z-10 w-full max-w-6xl mx-auto pt-6 pb-4 px-4 sm:px-6 flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-4">
        {/* Back Button */}
        <Link
          href="/student/dashboard"
          className="group inline-flex items-center gap-2 p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white transition duration-200 shadow-md backdrop-blur-md"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline text-xs sm:text-sm font-medium">Dashboard</span>
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              My Token
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            Track your active print order.
          </p>
        </div>
      </div>
    </motion.header>
  );
}
