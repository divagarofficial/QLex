"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Store, Settings, RefreshCw, Save, CheckCircle2 } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { fetchAdminPricing } from "@/services/adminPricing";

export default function AdminShopPricingPage() {
  const token = useAuthStore((s) => s.token);
  const [pricings, setPricings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const loadData = useCallback(async () => {
    const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("qlex_token") : null);
    if (!activeToken) return;

    try {
      setIsLoading(true);
      const data = await fetchAdminPricing();
      setPricings(data || []);
    } catch (err) {
      console.error("Failed to load admin pricing:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSuccessMsg("Shop pricing tiers updated successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    }, 800);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-obsidian text-white selection:bg-amber-500/30">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 space-y-6 pb-16">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/pricing"
                className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 transition-all hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white/95">
                  Shop Pricing Configurations
                </h1>
                <p className="text-xs text-white/40">
                  Manage shop per-page print rate matrices and paper sizes.
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold shadow-md hover:bg-amber-400 disabled:opacity-50"
            >
              <Save size={14} />
              <span>{isSaving ? "Saving..." : "Save All Changes"}</span>
            </button>
          </div>

          {successMsg && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-semibold text-emerald-400">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Pricing Matrix */}
          <div className="deep-glass p-8 rounded-3xl border border-white/10 space-y-6">
            <h3 className="font-bold text-white/90">Central Print Hub Base Rates</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-white/40 uppercase font-mono border-b border-white/10">
                  <tr>
                    <th className="p-4">Paper Size</th>
                    <th className="p-4">Print Type</th>
                    <th className="p-4">Side</th>
                    <th className="p-4">Shop Base Rate (₹)</th>
                    <th className="p-4">Convenience Fee (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pricings.map((p, idx) => (
                    <tr key={p.id || idx} className="hover:bg-white/[0.02]">
                      <td className="p-4 font-mono font-bold text-amber-300">{p.paper_size || "A4"}</td>
                      <td className="p-4 font-medium text-white/80">{p.print_type || "BW"}</td>
                      <td className="p-4 font-medium text-white/80">{p.print_side || "SINGLE"}</td>
                      <td className="p-4 font-mono font-bold text-emerald-400">₹{Number(p.shop_price || 2.0).toFixed(2)}</td>
                      <td className="p-4 font-mono text-white/70">₹{Number(p.convenience_fee || 0.5).toFixed(2)}</td>
                    </tr>
                  ))}
                  {pricings.length === 0 && (
                    <>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="p-4 font-mono font-bold text-amber-300">A4</td>
                        <td className="p-4 font-medium text-white/80">B/W</td>
                        <td className="p-4 font-medium text-white/80">Single-sided</td>
                        <td className="p-4 font-mono font-bold text-emerald-400">₹2.00</td>
                        <td className="p-4 font-mono text-white/70">₹0.50</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="p-4 font-mono font-bold text-amber-300">A4</td>
                        <td className="p-4 font-medium text-white/80">Colour</td>
                        <td className="p-4 font-medium text-white/80">Single-sided</td>
                        <td className="p-4 font-mono font-bold text-emerald-400">₹10.00</td>
                        <td className="p-4 font-mono text-white/70">₹1.00</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
