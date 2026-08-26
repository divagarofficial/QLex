"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import LoginHeader from "./LoginHeader";
import PinInput from "./PinInput";
import UnlockButton from "./UnlockButton";
import BackHomeButton from "./BackHomeButton";
import { loginShop } from "@/services/shopAuth";
import Popup from "@/components/popup/Popup";
import { CheckCircle2, AlertTriangle, Lock, Building2, Store } from "lucide-react";

function ShopLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialHub = searchParams.get("hub") === "satellite" ? "satellite" : "central";
  const [selectedHub, setSelectedHub] = useState<"central" | "satellite">(initialHub);

  const [pin, setPin] = useState<string[]>(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Popup state
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
      const res = await loginShop(pinString);

      if (res.success) {
        setIsSuccess(true);
        const targetPath = selectedHub === "satellite" ? "/shop/satellite" : "/shop/dashboard";
        const hubName = selectedHub === "satellite" ? "QLex Satellite Print Hub" : "QLex Central Print Hub";

        setPopupState({
          open: true,
          variant: "success",
          title: "Access Granted",
          description: `Welcome to ${hubName}! Opening terminal dashboard...`,
        });

        // Delay redirect slightly for smooth popup & pulse feedback
        setTimeout(() => {
          router.push(targetPath);
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
        description: "An unexpected error occurred. Please try again.",
      });
      setPin(["", "", "", ""]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Background Ambient Corner Lighting */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] sm:h-[450px] sm:w-[450px] rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[100px]" />

      {/* Main Glass Workspace Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="deep-glass relative z-10 w-full max-w-md overflow-hidden rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-white/10"
      >
        {/* Top Rim Sunlight Highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent" />

        {/* Ambient Top Glow Badge */}
        <div className="mb-4 flex items-center justify-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-amber-400/90">
          <Lock className="h-3.5 w-3.5" />
          <span>Restricted Operator Workspace</span>
        </div>

        {/* Hub Selection Toggle Bar */}
        <div className="mb-6 flex rounded-2xl bg-black/60 p-1.5 border border-white/10">
          <button
            type="button"
            onClick={() => setSelectedHub("central")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedHub === "central"
                ? "bg-gradient-to-r from-amber-400 to-amber-600 text-obsidian shadow-lg shadow-amber-500/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Store className="h-3.5 w-3.5" />
            <span>QLex Central Print Hub</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedHub("satellite")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedHub === "satellite"
                ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-obsidian shadow-lg shadow-emerald-500/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>QLex Satellite Print Hub</span>
          </button>
        </div>

        {/* Header Component */}
        <LoginHeader />

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

        {/* Back to Home Button Component */}
        <BackHomeButton />
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

export default function ShopLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ShopLoginForm />
    </Suspense>
  );
}
