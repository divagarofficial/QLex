"use client";

import Logo from "@/components/common/Logo";
import { Store, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginHeader() {
  return (
    <div className="flex flex-col items-center text-center">
      {/* QLex Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6"
      >
        <Logo />
      </motion.div>

      {/* Crystal Store Icon Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10 backdrop-blur-xl shadow-[0_0_30px_rgba(231,200,115,0.15)]"
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-yellow-400/10 to-transparent opacity-60" />
        <Store className="relative z-10 h-8 w-8 text-[#e7c873]" />
      </motion.div>

      {/* Large Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="bg-gradient-to-r from-white via-amber-100 to-champagne-300 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl"
      >
        Shop Portal
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-1.5 flex items-center justify-center gap-1.5 text-sm font-medium text-zinc-400"
      >
        <ShieldCheck className="h-4 w-4 text-amber-400/80" />
        <span>Secure Access for Print Shop Operators</span>
      </motion.p>

      {/* PIN Prompt Subtitle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md"
      >
        <p className="text-xs font-semibold tracking-wide text-zinc-300">
          Enter your shop access PIN
        </p>
      </motion.div>
    </div>
  );
}
