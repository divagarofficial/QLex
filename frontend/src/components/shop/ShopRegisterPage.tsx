"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Store, ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle, KeyRound } from "lucide-react";
import PinInput from "./PinInput";
import { registerShop } from "@/services/shopAuth";
import Popup from "@/components/popup/Popup";

export default function ShopRegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    phone: "",
    email: "",
    address: "",
    operating_hours: "8:00 AM - 9:00 PM",
  });

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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "name" && !prev.slug) {
        updated.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }
      return updated;
    });
  };

  const handlePinChange = (newPin: string[]) => {
    setPin(newPin);
    if (isError) setIsError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pinString = pin.join("");

    if (!formData.name.trim() || !formData.slug.trim()) {
      setPopupState({
        open: true,
        variant: "error",
        title: "Validation Error",
        description: "Please enter a valid Shop Name and Slug identifier.",
      });
      return;
    }

    if (pinString.length !== 4) {
      setIsError(true);
      setPopupState({
        open: true,
        variant: "error",
        title: "PIN Required",
        description: "Please set a 4-digit PIN for your shop operator login.",
      });
      return;
    }

    setLoading(true);
    setIsError(false);

    try {
      const res = await registerShop({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        pin: pinString,
        is_express_enabled: true,
      });

      if (res.success) {
        setIsSuccess(true);
        setPopupState({
          open: true,
          variant: "success",
          title: "Registration Successful!",
          description: `Shop '${formData.name}' created with custom 4-digit PIN! Redirecting...`,
        });

        setTimeout(() => {
          router.push(`/shop/login?hub=satellite`);
        }, 1500);
      } else {
        setIsError(true);
        setPopupState({
          open: true,
          variant: "error",
          title: "Registration Failed",
          description: res.message || "Failed to register shop. Please try again.",
        });
      }
    } catch {
      setIsError(true);
      setPopupState({
        open: true,
        variant: "error",
        title: "Error",
        description: "An unexpected error occurred during shop registration.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4 sm:p-6 md:p-8 bg-obsidian text-white">
      {/* Background Glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-amber-500/10 blur-[140px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="deep-glass relative z-10 w-full max-w-lg overflow-hidden rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <button
            type="button"
            onClick={() => router.push("/shop/login")}
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </button>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            <Store className="h-3.5 w-3.5" />
            <span>Non-College Express Shop</span>
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-white tracking-tight">Register Print Shop</h1>
          <p className="text-xs text-white/60 mt-1">
            Create an express print hub and set your secret 4-digit operator PIN.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1">Shop Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Tech Park Express Prints"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full rounded-xl bg-black/50 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">Shop Slug / Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. acme-express"
                value={formData.slug}
                onChange={(e) => handleInputChange("slug", e.target.value)}
                className="w-full rounded-xl bg-black/50 border border-white/10 px-3.5 py-2.5 text-xs font-mono text-amber-300 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full rounded-xl bg-black/50 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1">Address / Location</label>
            <input
              type="text"
              placeholder="e.g. Tech Park Counter #2, Main Entrance"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="w-full rounded-xl bg-black/50 border border-white/10 px-3.5 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* 4-Digit PIN Setup Section */}
          <div className="pt-2 pb-1 border-t border-b border-white/10 my-4">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-300 mb-2">
              <KeyRound className="h-4 w-4" />
              <span>Set Your 4-Digit Login PIN</span>
            </div>
            <p className="text-[11px] text-center text-white/50 mb-3">
              This 4-digit PIN will be used to unlock your shop operator dashboard.
            </p>

            <PinInput
              pin={pin}
              onChange={handlePinChange}
              isError={isError}
              isSuccess={isSuccess}
              disabled={loading || isSuccess}
            />
          </div>

          <button
            type="submit"
            disabled={loading || pin.join("").length !== 4}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-400 to-amber-600 text-obsidian shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{loading ? "Registering Shop..." : "Complete Registration & Save PIN"}</span>
          </button>
        </form>

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
      </motion.div>
    </div>
  );
}
