"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Zap, CreditCard, QrCode } from "lucide-react";

import RoleCards from "./RoleCards";

export default function Landing() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <main ref={ref} className="relative flex-1 overflow-x-hidden bg-[#030406]">
      {/* Background ambient lighting orbs */}
      <div
        className="pointer-events-none fixed left-1/2 top-10 h-[600px] w-[800px] -translate-x-1/2 rounded-full"
        style={{
          background: "radial-gradient(ellipse 50% 40% at 50% 30%, rgba(231,200,115,0.05) 0%, rgba(59,130,246,0.03) 50%, transparent 80%)",
          filter: "blur(120px)",
        }}
      />

      {/* ─── HERO — Mobile-first: 75-80vh on mobile, full screen on desktop ─── */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-start px-6 pt-[8vh] sm:pt-[10vh] md:pt-[12vh]">
        {/* QLex Hero */}
        <motion.div
          style={{ y: titleY, opacity }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex flex-col items-center w-full"
        >
          {/* Soft champagne glow behind logo */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[400px] -translate-x-1/2 -translate-y-1/2 sm:h-[400px] sm:w-[550px] md:h-[500px] md:w-[700px]"
            style={{
              background:
                "radial-gradient(ellipse 40% 35% at 50% 50%, rgba(231,200,115,0.07) 0%, transparent 60%)",
              filter: "blur(100px)",
            }}
          />

          {/* QLex Logo */}
          <div className="relative">
            <Image
              src="/qlex-logo.svg"
              width={400}
              height={400}
              alt="QLex"
              className="relative h-auto w-[200px] sm:w-[260px] md:w-[320px] lg:w-[380px]"
              priority
            />
          </div>

          {/* UPLOAD TO PICKUP */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 1 }}
            className="mt-5 flex flex-col items-center sm:mt-7 md:mt-9"
          >
            <p className="text-base tracking-[0.4em] uppercase text-[#E7C873] sm:text-lg sm:tracking-[0.45em] md:text-xl md:tracking-[0.55em] leading-tight font-semibold">
              UPLOAD TO PICKUP
            </p>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 1 }}
            className="mt-5 max-w-xl text-center text-sm leading-6 text-white/50 sm:text-base md:text-lg md:leading-9 sm:mt-7"
          >
            Skip the queue. Upload your documents. Pay online. Collect when ready.
          </motion.p>

          {/* Live Stats / Feature Badges */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 1 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 sm:mt-8"
          >
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-white/70 backdrop-blur-md transition-colors hover:border-[#E7C873]/30 hover:text-[#E7C873]">
              <Zap className="h-3.5 w-3.5 text-[#E7C873]" />
              <span>Express Printing</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-white/70 backdrop-blur-md transition-colors hover:border-blue-400/30 hover:text-blue-300">
              <CreditCard className="h-3.5 w-3.5 text-blue-400" />
              <span>UPI Payments</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-white/70 backdrop-blur-md transition-colors hover:border-violet-400/30 hover:text-violet-300">
              <QrCode className="h-3.5 w-3.5 text-violet-400" />
              <span>Live Queue Tokens</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Choose Your Experience — Responsive spacing */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.05, duration: 1.2 }}
          className="mt-[8vh] w-full max-w-7xl px-4 text-center sm:mt-[12vh] md:mt-[14vh]"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white/90 sm:text-4xl md:text-5xl lg:text-6xl">
            Choose Your Experience
          </h2>

          <div className="mt-8 w-full sm:mt-12 md:mt-16">
            <RoleCards />
          </div>

          <p className="mt-8 text-center text-sm leading-relaxed text-white/30 sm:text-base md:text-lg sm:mt-10 md:mt-14">
            Built for every participant in the campus printing ecosystem.
          </p>
        </motion.div>

        <div className="h-[6vh] sm:h-[8vh] md:h-[10vh]" />
      </section>
    </main>
  );
}


