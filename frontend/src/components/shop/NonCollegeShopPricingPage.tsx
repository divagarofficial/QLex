"use client";

import { useEffect, useState } from "react";
import NonCollegeShopHeader from "./NonCollegeShopHeader";
import CounterQRCodeModal from "./CounterQRCodeModal";
import Popup from "@/components/popup/Popup";
import { fetchPublicShopBySlug, type PublicShop } from "@/services/expressOrders";

import {
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Save,
  Printer,
  Sparkles,
  Zap,
} from "lucide-react";

interface NonCollegeShopPricingPageProps {
  shopSlug?: string;
}

export default function NonCollegeShopPricingPage({
  shopSlug: inputSlug = "acme-offset-and-printers",
}: NonCollegeShopPricingPageProps) {
  const shopSlug = (inputSlug || "acme-offset-and-printers").toLowerCase();

  const [shopProfile, setShopProfile] = useState<PublicShop | null>(null);
  const [shopName, setShopName] = useState<string>(
    shopSlug.includes("acme") ? "ACME OFFSET AND PRINTERS" : shopSlug.replace(/-/g, " ").toUpperCase()
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // Pricing State
  const [bwSingle, setBwSingle] = useState<number>(1.5);
  const [bwDouble, setBwDouble] = useState<number>(2.5);
  const [colorSingle, setColorSingle] = useState<number>(10.0);
  const [colorDouble, setColorDouble] = useState<number>(18.0);
  const [priorityFee, setPriorityFee] = useState<number>(5.0);

  const [popupState, setPopupState] = useState<{
    open: boolean;
    variant: "error" | "success";
    title: string;
    description: string;
  }>({
    open: false,
    variant: "error",
    title: "",
    description: "",
  });

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        const profile = await fetchPublicShopBySlug(shopSlug);
        if (profile && isMounted && profile.name) {
          setShopProfile(profile);
          setShopName(profile.name);
        }
      } catch (e) {
        console.log(`[NonCollegeShopPricingPage] Profile lookup for ${shopSlug}:`, e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [shopSlug]);

  const handleSaveRates = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setPopupState({
        open: true,
        variant: "success",
        title: "Rate Card Updated",
        description: `Custom print rates saved for ${shopName}.`,
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col font-sans">
      <NonCollegeShopHeader
        shopName={shopName}
        shopSlug={shopSlug}
        activeTab="pricing"
        onRefresh={() => {}}
        onShowQR={() => setShowQRModal(true)}
        loading={loading}
      />

      <main className="flex-1 p-4 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-400" /> Rate Card & Pricing Config — {shopName}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure per-page print charges and priority express fees for customers ordering at {shopName}.
            </p>
          </div>

          <button
            disabled={saving}
            onClick={handleSaveRates}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Rate Card"}</span>
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Black & White Rates */}
          <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 space-y-5 shadow-xl">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Black & White Print Rates</h3>
                <p className="text-xs text-slate-400">Standard document printing rate per side</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Single Sided (₹ per page)
                </label>
                <input
                  type="number"
                  step="0.25"
                  value={bwSingle}
                  onChange={(e) => setBwSingle(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Double Sided / Duplex (₹ per sheet)
                </label>
                <input
                  type="number"
                  step="0.25"
                  value={bwDouble}
                  onChange={(e) => setBwDouble(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Color Rates */}
          <div className="rounded-3xl bg-slate-900/60 border border-white/10 p-6 space-y-5 shadow-xl">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Color Print Rates</h3>
                <p className="text-xs text-slate-400">Full color inkjet / laser document rate</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Color Single Sided (₹ per page)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={colorSingle}
                  onChange={(e) => setColorSingle(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Color Double Sided (₹ per sheet)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={colorDouble}
                  onChange={(e) => setColorDouble(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Priority Express Fee */}
          <div className="md:col-span-2 rounded-3xl bg-slate-900/60 border border-amber-500/20 p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 pb-3 border-b border-amber-500/20">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-300">Priority Queue Express Fee</h3>
                <p className="text-xs text-slate-400">Surcharge for jump-the-queue express print jobs</p>
              </div>
            </div>

            <div className="max-w-md">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Priority Express Fee (₹ per order)
              </label>
              <input
                type="number"
                step="1"
                value={priorityFee}
                onChange={(e) => setPriorityFee(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      </main>

      <CounterQRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        shopName={shopName}
        shopSlug={shopSlug}
      />

      <Popup
        open={popupState.open}
        onClose={() => setPopupState((prev) => ({ ...prev, open: false }))}
        title={popupState.title}
        description={popupState.description}
        variant={popupState.variant}
        icon={<CheckCircle2 className="h-6 w-6 text-emerald-400" />}
        showCloseButton={true}
        dismissOnBackdrop={true}
        dismissOnEsc={true}
      />
    </div>
  );
}
