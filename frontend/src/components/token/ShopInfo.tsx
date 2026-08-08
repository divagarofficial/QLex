"use client";

import { Store, MapPin, Clock, Phone, Navigation, ExternalLink } from "lucide-react";
import type { ShopDetailsInfo } from "@/types/token";

interface ShopInfoProps {
  shop?: ShopDetailsInfo;
}

export default function ShopInfo({ shop }: ShopInfoProps) {
  const shopData: ShopDetailsInfo = shop || {
    name: "Campus Xerox Center",
    location: "Student Center, Block B, Ground Floor, Main Campus",
    working_hours: "08:00 AM - 08:00 PM (Mon-Sat)",
    contact_number: "+91 98765 43210",
    google_maps_url: "https://maps.google.com/?q=Campus+Xerox+Center",
  };

  return (
    <div className="w-full rounded-3xl bg-[#070b14]/75 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <Store className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Print Shop Details</h3>
          <p className="text-xs text-slate-400">Fulfillment center information</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Shop Name */}
        <div className="flex items-start gap-3">
          <Store className="w-4 h-4 text-cyan-400 mt-1 shrink-0" />
          <div>
            <p className="text-xs text-slate-400">Shop Name</p>
            <p className="text-sm font-bold text-white">{shopData.name}</p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-cyan-400 mt-1 shrink-0" />
          <div>
            <p className="text-xs text-slate-400">Location</p>
            <p className="text-sm text-slate-200">{shopData.location}</p>
          </div>
        </div>

        {/* Working Hours */}
        <div className="flex items-start gap-3">
          <Clock className="w-4 h-4 text-cyan-400 mt-1 shrink-0" />
          <div>
            <p className="text-xs text-slate-400">Working Hours</p>
            <p className="text-sm text-slate-200">{shopData.working_hours}</p>
          </div>
        </div>

        {/* Contact */}
        <div className="flex items-start gap-3">
          <Phone className="w-4 h-4 text-cyan-400 mt-1 shrink-0" />
          <div>
            <p className="text-xs text-slate-400">Contact Hotline</p>
            <p className="text-sm font-mono text-cyan-300">{shopData.contact_number}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-white/10">
        <a
          href={`tel:${shopData.contact_number.replace(/\s+/g, "")}`}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs sm:text-sm font-bold text-white transition duration-200 group"
        >
          <Phone className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
          <span>Call Shop</span>
        </a>

        <a
          href={shopData.google_maps_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs sm:text-sm font-bold text-cyan-300 transition duration-200 group"
        >
          <Navigation className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
          <span>Navigate</span>
        </a>
      </div>
    </div>
  );
}
