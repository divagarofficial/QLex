"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, Users, Cpu, Info, Compass } from "lucide-react";
import { motion } from "framer-motion";

interface CreditsHeaderProps {
  title?: string;
  subtitle?: string;
  backHref?: string;
}

const navAnchors = [
  { href: "#identity", label: "Identity", icon: Sparkles },
  { href: "#team", label: "Team", icon: Users },
  { href: "#tech", label: "Tech Stack", icon: Cpu },
  { href: "#info", label: "Product Info", icon: Info },
  { href: "#vision", label: "Vision", icon: Compass },
];

export default function CreditsHeader({
  title = "Credits & Acknowledgements",
  subtitle = "The architects, technology stack, and vision powering QLex.",
  backHref = "/student/dashboard",
}: CreditsHeaderProps) {
  return (
    <header className="relative flex flex-col items-center text-center pt-2 sm:pt-6">
      {/* Back Button & Top Navigation */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <motion.div
          whileHover={{ x: -4, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
        >
          <Link
            href={backHref}
            className="relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.1] backdrop-blur-xl text-sm font-medium text-zinc-300 transition-all duration-300 hover:bg-white/[0.08] hover:border-amber-400/40 hover:text-white hover:shadow-[0_0_25px_rgba(231,200,115,0.18)] focus:outline-none focus:ring-2 focus:ring-amber-400/50 group"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-amber-300 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>Back to Dashboard</span>
          </Link>
        </motion.div>

        {/* Quick Nav Anchors */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl max-w-full overflow-x-auto scrollbar-none">
          {navAnchors.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-amber-300 hover:bg-white/[0.06] transition-all duration-200 whitespace-nowrap"
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Decorative Pill Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-blue-500/10 border border-amber-400/25 backdrop-blur-xl mb-4 shadow-lg shadow-amber-500/5"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span className="text-xs font-semibold tracking-widest uppercase text-amber-200/90">
          About QLex Platform
        </span>
      </motion.div>

      {/* Main Page Title */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-3">
        <span className="bg-gradient-to-b from-white via-amber-50 to-amber-200/80 bg-clip-text text-transparent drop-shadow-[0_10px_35px_rgba(231,200,115,0.15)]">
          {title}
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-lg text-zinc-400 max-w-md font-normal leading-relaxed">
        {subtitle}
      </p>
    </header>
  );
}

