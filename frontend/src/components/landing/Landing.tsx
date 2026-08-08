"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Building2, Zap, CreditCard, QrCode } from "lucide-react";

import RoleCards from "./RoleCards";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 1.2, ease: [0.16, 1, 0.3, 1] as const },
});

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
      <section className="relative flex min-h-[80vh] flex-col items-center justify-start px-6 pt-[6vh] sm:pt-[8vh] md:pt-[10vh]">
        {/* ─── MINDURA TECHNOLOGIES PRESENTS BRANDING ─── */}
        <motion.div {...fadeUp(0.05)} className="flex flex-col items-center gap-3 sm:gap-4">
          {/* Logo with Ambient Glass Badge */}
          <div className="relative group cursor-default">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(231,200,115,0.2) 0%, transparent 70%)",
                filter: "blur(14px)",
              }}
            />
            <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] transition-transform duration-500 hover:scale-105">
              <Image
                src="/mindura-logo.svg"
                width={32}
                height={32}
                alt="Mindura"
                className="h-7 w-7 sm:h-8 sm:w-8 opacity-90 transition-opacity duration-300 group-hover:opacity-100"
                priority
              />
            </div>
          </div>

          {/* Mindura Technologies Name */}
          <span className="text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.42em] sm:tracking-[0.52em] text-transparent bg-clip-text bg-gradient-to-r from-white via-white/95 to-white/70 drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)]">
            Mindura Technologies
          </span>
        </motion.div>

        {/* Presents — Champagne Pill with Gradient Hairline Dividers */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 1.2 }}
          className="mt-3.5 flex items-center gap-2.5 sm:mt-5 sm:gap-4 md:gap-5"
        >
          <div
            className="h-px w-12 sm:w-20 md:w-28"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(231,200,115,0.5), transparent)",
            }}
          />
          <div className="relative overflow-hidden rounded-full border border-[rgba(231,200,115,0.3)] bg-[rgba(231,200,115,0.06)] px-3.5 py-0.5 sm:px-4 sm:py-1 backdrop-blur-md shadow-[0_0_20px_rgba(231,200,115,0.12)]">
            <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-[#E7C873]/60 to-transparent" />
            <span className="text-[9px] sm:text-[10px] md:text-xs font-semibold uppercase tracking-[0.5em] sm:tracking-[0.65em] text-[#E7C873] drop-shadow-[0_0_8px_rgba(231,200,115,0.3)]">
              Presents
            </span>
          </div>
          <div
            className="h-px w-12 sm:w-20 md:w-28"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(231,200,115,0.5), transparent)",
            }}
          />
        </motion.div>

        {/* QLex Hero */}
        <motion.div
          style={{ y: titleY, opacity }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-[4vh] flex flex-col items-center sm:mt-[6vh] md:mt-[8vh] w-full"
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

          {/* ─── FOR RAJALAKSHMI INSTITUTE OF TECHNOLOGY (Fitted Single Line Mobile) ─── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 flex flex-col items-center gap-1.5 sm:gap-2 sm:mt-7 md:mt-8 w-full max-w-full px-2"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className="h-px w-8 sm:w-16 md:w-20"
                style={{
                  background:
                    "linear-gradient(to right, transparent, rgba(231,200,115,0.45), transparent)",
                }}
              />
              <span className="text-[9px] sm:text-xs tracking-[0.4em] sm:tracking-[0.55em] uppercase font-light text-white/50">
                FOR
              </span>
              <div
                className="h-px w-8 sm:w-16 md:w-20"
                style={{
                  background:
                    "linear-gradient(to right, transparent, rgba(231,200,115,0.45), transparent)",
                }}
              />
            </div>

            <div className="group relative overflow-hidden rounded-full border border-[rgba(231,200,115,0.22)] bg-[rgba(231,200,115,0.04)] px-3 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 backdrop-blur-xl shadow-[0_0_25px_rgba(231,200,115,0.06)] transition-all duration-500 hover:border-[rgba(231,200,115,0.45)] hover:shadow-[0_0_35px_rgba(231,200,115,0.15)] hover:bg-[rgba(231,200,115,0.08)] max-w-full">
              {/* Top edge highlight */}
              <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-[#E7C873]/50 to-transparent" />
              
              <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 md:gap-3 whitespace-nowrap">
                <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 shrink-0 text-[#E7C873] transition-transform duration-500 group-hover:scale-110" />
                <span className="text-[9px] min-[360px]:text-[9.5px] min-[400px]:text-[10.5px] sm:text-xs md:text-sm font-bold tracking-[0.08em] min-[360px]:tracking-[0.12em] sm:tracking-[0.22em] md:tracking-[0.3em] uppercase bg-gradient-to-r from-[#FFF5D6] via-[#E7C873] to-[#F5D98E] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(231,200,115,0.2)] whitespace-nowrap">
                  RAJALAKSHMI INSTITUTE OF TECHNOLOGY
                </span>
              </div>
            </div>
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
          className="mt-[8vh] w-full max-w-6xl px-4 text-center sm:mt-[12vh] md:mt-[14vh]"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white/90 sm:text-4xl md:text-5xl lg:text-6xl">
            Choose Your Experience
          </h2>

          <div className="mt-8 w-full sm:mt-12 md:mt-16">
            <RoleCards />
          </div>

          <p className="mt-8 text-center text-sm leading-relaxed text-white/30 sm:text-base md:text-lg sm:mt-10 md:mt-14">
            Built for every participant in the Rajalakshmi Institute of Technology campus printing ecosystem.
          </p>
        </motion.div>

        <div className="h-[6vh] sm:h-[8vh] md:h-[10vh]" />
      </section>
    </main>
  );
}


