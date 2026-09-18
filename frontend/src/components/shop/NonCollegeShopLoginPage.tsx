"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Store, Lock, CheckCircle2, AlertTriangle, ArrowLeft, MapPin } from "lucide-react";
import PinInput from "./PinInput";
import UnlockButton from "./UnlockButton";
import { loginShop } from "@/services/shopAuth";
import { fetchPublicShopBySlug, type PublicShop } from "@/services/expressOrders";
import Popup from "@/components/popup/Popup";

interface NonCollegeShopLoginPageProps {
  shopSlug: string;
}

export default function NonCollegeShopLoginPage({ shopSlug: inputSlug }: NonCollegeShopLoginPageProps) {
  const router = useRouter();
  const shopSlug = (inputSlug || "acme").toLowerCase();

  const [shopInfo, setShopInfo] = useState<PublicShop | null>(null);
  const [shopName, setShopName] = useState<string>(
    shopSlug.includes("acme") ? "ACME OFFSET AND PRINTERS" : shopSlug.replace(/-/g, " ").toUpperCase()
  );

  const [pin, setPin] = useState<string[]>(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [popupState, setPopupState] = useState<{
    open: boolean;
    variant: "success" | "error";
    title: string;
    description: string;
  }>({
    open: false,
    variant: "error",
    title: "",
    description: "",
  });

  // Fetch shop details for displaying actual shop name & address on login screen
  useEffect(() => {
    async function loadShop() {
      try {
        const data = await fetchPublicShopBySlug(shopSlug);
        if (data && data.name) {
          setShopInfo(data);
          setShopName(data.name);
        }
      } catch {
        // Keep formatted slug fallback
      }
    }
    loadShop();
  }, [shopSlug]);

  const handlePinChange = (newPin: string[]) => {
    setPin(newPin);
    if (isError) setIsError(false);
  };

  const handleUnlock = async (pinStringOverride?: string) => {
    const pinString = pinStringOverride || pin.join("");
    if (pinString.length !== 4 || loading) return;

    setLoading(true);
    setIsError(false);
    setIsSuccess(false);

    try {
      const res = await loginShop(pinString, shopSlug);

      if (res.success) {
        setIsSuccess(true);
        const displayName = res.shop_name || shopName;

        setPopupState({
          open: true,
          variant: "success",
          title: "Access Granted",
          description: `Welcome to ${displayName}! Opening operator workbench...`,
        });

        setTimeout(() => {
          router.push(`/shop/${shopSlug}/dashboard`);
        }, 1200);
      } else {
        setIsError(true);
        setPopupState({
          open: true,
          variant: "error",
          title: "Access Denied",
          description: res.message || "Incorrect PIN. Please try again.",
        });

        setPin(["", "", "", ""]);
      }
    } catch {
      setIsError(true);
      setPopupState({
        open: true,
        variant: "error",
        title: "Authentication Error",
        description: "An unexpected error occurred during login.",
      });
      setPin(["", "", "", ""]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4 sm:p-6 md:p-8 bg-[#04060a] text-white">
      {/* Background Ambient Lighting */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] sm:h-[500px] sm:w-[500px] rounded-full bg-amber-500/10 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[100px]" />

      {/* Main Operator Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="deep-glass relative z-10 w-full max-w-md overflow-hidden rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-white/10"
      >
        {/* Top Sunlight Rim */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />

        {/* Header Navigation */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/shops")}
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Directory</span>
          </button>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            <Lock className="h-3.5 w-3.5" />
            <span>Restricted Operator Kiosk</span>
          </div>
        </div>

        {/* Shop Avatar & Details */}
        <div className="text-center my-6">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
            <Store className="h-7 w-7" />
          </div>

          <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest block mb-1">
            /shop/{shopSlug}
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">{shopName}</h1>
          {shopInfo?.tagline && (
            <p className="text-xs text-amber-300/90 font-medium mt-1">{shopInfo.tagline}</p>
          )}
          {shopInfo?.address && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-white/50 mt-2">
              <MapPin className="h-3.5 w-3.5 text-white/40" />
              <span>{shopInfo.address}</span>
            </div>
          )}
        </div>

        {/* Enter PIN Prompt */}
        <div className="text-center mb-2">
          <span className="inline-block rounded-full bg-black/60 border border-white/10 px-3 py-1 text-xs text-white/70">
            Enter 4-Digit Operator Access PIN
          </span>
        </div>

        {/* PIN Input Component */}
        <PinInput
          pin={pin}
          onChange={handlePinChange}
          onComplete={(completedPin) => handleUnlock(completedPin)}
          isError={isError}
          isSuccess={isSuccess}
          disabled={loading || isSuccess}
        />

        {/* Unlock Button Component */}
        <UnlockButton
          onClick={() => handleUnlock()}
          disabled={pin.join("").length !== 4}
          loading={loading}
          success={isSuccess}
        />
      </motion.div>

      {/* Reusable QLex Popup Modal */}
      <Popup
        open={popupState.open}
        onClose={() => setPopupState((prev) => ({ ...prev, open: false }))}
        title={popupState.title}
        description={popupState.description}
        variant={popupState.variant}
        icon={
          popupState.variant === "success" ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-red-400" />
          )
        }
        showCloseButton={true}
        dismissOnBackdrop={true}
        dismissOnEsc={true}
      />
    </div>
  );
}
