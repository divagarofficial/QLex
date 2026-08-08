"use client";

import { Building2, ShieldCheck, CreditCard, Lock, ArrowUpRight } from "lucide-react";

interface BankInformationCardProps {
  bankName?: string;
  accountHolder?: string;
  accountNumberMasked?: string;
  ifsc?: string;
  settlementMode?: string;
}

export default function BankInformationCard({
  bankName = "Axis Bank",
  accountHolder = "RIT Print Shop",
  accountNumberMasked = "•••• •••• 9842",
  ifsc = "UTIB0004521",
  settlementMode = "UPI / NEFT Instant Settlement",
}: BankInformationCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Bank Account Details</h3>
            <p className="text-xs text-slate-400">Merchant Payout Destination</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          Verified
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Bank Name
          </span>
          <span className="text-sm font-bold text-white mt-0.5 block">{bankName}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Account Holder
          </span>
          <span className="text-sm font-bold text-white mt-0.5 block">{accountHolder}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" />
            Account Number
          </span>
          <span className="text-sm font-bold font-mono text-slate-200 mt-0.5 block">
            {accountNumberMasked}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            IFSC Code
          </span>
          <span className="text-sm font-bold font-mono text-amber-300 mt-0.5 block">{ifsc}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-400 border-t border-white/10">
        <span className="flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-amber-400" />
          Mode: <strong className="text-slate-200">{settlementMode}</strong>
        </span>
        <span className="text-[11px] text-slate-400 font-medium">Automatic Daily Payouts</span>
      </div>
    </div>
  );
}
