"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { User, Hash, Store, Calendar, Clock, Zap, ShieldCheck } from "lucide-react";
import StatusChip from "./StatusChip";

interface DigitalTokenCardProps {
  tokenNumber: string;
  queueNumber?: number | string | null;
  studentName: string;
  registerNumber: string;
  shopName: string;
  orderNumber: string;
  isPriority: boolean;
  orderStatus: string;
  dateStr: string;
  timeStr: string;
}

export default function DigitalTokenCard({
  tokenNumber,
  queueNumber,
  studentName,
  registerNumber,
  shopName,
  orderNumber,
  isPriority,
  orderStatus,
  dateStr,
  timeStr,
}: DigitalTokenCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative w-full rounded-3xl bg-slate-900/90 border border-cyan-500/25 p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 backdrop-blur-2xl text-slate-100 overflow-hidden"
    >
      {/* Subtle top edge reflection */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

      {/* Card Header: Brand Monogram & Status */}
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <Image
            src="/qlex-logo.png"
            alt="QLex"
            width={36}
            height={36}
            className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(231,200,115,0.4)]"
          />
          {tokenNumber && tokenNumber.startsWith("S-") ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 font-extrabold text-[11px]">
              <ShieldCheck className="w-3 h-3 text-purple-400" />
              Satellite Digital Ticket
            </span>
          ) : isPriority || (tokenNumber && tokenNumber.startsWith("P-")) ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-extrabold text-[11px]">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              Priority Token Ticket
            </span>
          ) : (
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Regular Digital Ticket
            </span>
          )}
        </div>

        <StatusChip status={orderStatus} />
      </div>

      {/* Hero Section: Token Number & Queue Number */}
      <div className="py-4 text-center border-y border-white/10 my-4 bg-white/[0.02] rounded-2xl p-6">
        <p className="text-xs uppercase tracking-widest font-semibold text-slate-400 mb-1">
          Token Number
        </p>
          
          <div className="text-6xl sm:text-7xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 font-mono drop-shadow-[0_0_35px_rgba(56,189,248,0.35)]">
            {tokenNumber}
          </div>

          {queueNumber !== undefined && queueNumber !== null && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-white/10 text-xs text-slate-300 font-mono">
              <span>Queue #:</span>
              <span className="font-bold text-cyan-300">{queueNumber}</span>
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-xs sm:text-sm">
          {/* Student Info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <User className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <p className="text-[11px] text-slate-400">Student</p>
              <p className="font-semibold text-white truncate">{studentName}</p>
            </div>
          </div>

          {/* Register Number */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <Hash className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <p className="text-[11px] text-slate-400">Register Number</p>
              <p className="font-mono font-semibold text-white">{registerNumber}</p>
            </div>
          </div>

          {/* Print Shop */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <Store className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <p className="text-[11px] text-slate-400">Print Shop</p>
              <p className="font-semibold text-white">{shopName}</p>
            </div>
          </div>

          {/* Order ID & Priority */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
            {isPriority ? (
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <div>
              <p className="text-[11px] text-slate-400">Order ID & Priority</p>
              <p className="font-mono text-xs text-slate-200">
                #{orderNumber.substring(0, 12)} •{" "}
                <span className={isPriority ? "text-amber-300 font-bold" : "text-slate-300"}>
                  {isPriority ? "Priority Queue ⚡" : "Standard Queue"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Card Footer: Date & Time */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{dateStr}</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{timeStr}</span>
          </div>
        </div>
      </motion.div>
    );
  }
