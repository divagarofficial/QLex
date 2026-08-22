"use client";

import { MapPin, Clock, Info, ShieldCheck, QrCode } from "lucide-react";

interface CollectionInformationProps {
  location?: string;
  workingHours?: string;
  collectionStatus: string;
}

export default function CollectionInformation({
  location = "QLex Central Print Hub, RIT Campus Road, Opposite to A Block, RIT Main Campus",
  workingHours = "08:00 AM - 03:00 PM (Mon - Sat)",
  collectionStatus,
}: CollectionInformationProps) {
  const normStatus = (collectionStatus || "").toUpperCase();
  const isReady = normStatus === "READY_FOR_PICKUP" || normStatus === "READY";
  const isCollected = normStatus === "COLLECTED" || normStatus === "SERVED" || normStatus === "COMPLETED";

  return (
    <div className="w-full rounded-3xl bg-[#070b14]/80 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white">Collection Information</h3>
          <p className="text-xs text-slate-400 mt-0.5">Pickup counter instructions & verification</p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border ${
            isCollected
              ? "bg-slate-500/15 text-slate-300 border-slate-500/30"
              : isReady
              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 animate-pulse"
              : "bg-amber-500/15 text-amber-300 border-amber-500/30"
          }`}
        >
          {isCollected ? "Collected" : isReady ? "Ready for Pickup" : "Pending Collection"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: Location & Instructions */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-cyan-400 mt-1 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Pickup Location</p>
              <p className="text-sm font-semibold text-white">{location}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-purple-400 mt-1 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Working Hours</p>
              <p className="text-sm text-slate-200">{workingHours}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Collection Instructions</p>
              <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                Present your Token Number or Register Number at the counter when collecting your printed documents.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Verification Method</p>
              <p className="text-xs font-mono text-emerald-300 mt-0.5">
                Token & Student Register Number Verification
              </p>
            </div>
          </div>
        </div>

        {/* Right: Reserved QR Code Integration Box */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-3">
            <QrCode className="w-8 h-8 opacity-60" />
          </div>
          <p className="text-xs font-semibold text-slate-300">QR Code Verification</p>
          <span className="mt-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-[10px] font-mono text-cyan-400 border border-cyan-500/20">
            Scanner Ready
          </span>
          <p className="text-[11px] text-slate-400 mt-2">
            Reserved space for automated counter QR scanner integration.
          </p>
        </div>
      </div>
    </div>
  );
}
