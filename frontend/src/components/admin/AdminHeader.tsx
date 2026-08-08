"use client";

import Logo from "@/components/common/Logo";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminHeader() {
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

      {/* Security Crystal Icon Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/25 bg-blue-500/10 backdrop-blur-xl shadow-[0_0_35px_rgba(59,130,246,0.2)]"
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-600/20 via-cyan-400/10 to-transparent opacity-70" />
        <ShieldCheck className="relative z-10 h-8 w-8 text-blue-400" />
      </motion.div>

      {/* Main Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="bg-gradient-to-r from-white via-blue-100 to-cyan-300 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl"
      >
        Admin Portal
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-1.5 max-w-xs text-sm font-medium text-zinc-400 sm:max-w-sm"
      >
        Restricted access for authorized administrators only.
      </motion.p>

      {/* Restricted Access Pill */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="mt-5 flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 px-3.5 py-1 text-xs font-semibold text-blue-300 backdrop-blur-md"
      >
        <ShieldAlert className="h-3.5 w-3.5 text-blue-400" />
        <span className="tracking-wide">RESTRICTED ACCESS</span>
      </motion.div>
    </div>
  );
}
