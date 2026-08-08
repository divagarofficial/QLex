"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AdminHeader from "./AdminHeader";
import PasswordInput from "./PasswordInput";
import UnlockButton from "./UnlockButton";
import BackHomeButton from "./BackHomeButton";
import { loginAdmin } from "@/services/adminAuth";
import Popup from "@/components/popup/Popup";
import { CheckCircle2, ShieldAlert, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [password, setPassword] = useState("");
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

  const focusInput = useCallback(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (isError) setIsError(false);
  };

  const handleUnlock = async () => {
    if (!password.trim() || loading) return;

    setLoading(true);
    setIsError(false);
    setIsSuccess(false);

    try {
      const res = await loginAdmin(password);

      if (res.success) {
        setIsSuccess(true);
        setPopupState({
          open: true,
          variant: "success",
          title: "Access Granted",
          description: "Welcome to the QLex Administration Portal.",
        });

        // Short delay before navigation for smooth visual confirmation
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 1200);
      } else {
        setIsError(true);
        setPopupState({
          open: true,
          variant: "error",
          title: "Authentication Failed",
          description: res.message || "Incorrect password. Please try again.",
        });

        // Clear password and refocus input field
        setPassword("");
        focusInput();
      }
    } catch {
      setIsError(true);
      setPopupState({
        open: true,
        variant: "error",
        title: "Authentication Failed",
        description: "An unexpected authentication error occurred. Please try again.",
      });
      setPassword("");
      focusInput();
    } finally {
      setLoading(false);
    }
  };

  const handlePopupClose = () => {
    setPopupState((prev) => ({ ...prev, open: false }));
    if (!isSuccess) {
      focusInput();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative flex min-h-screen w-full items-center justify-center p-4 sm:p-6 md:p-8"
    >
      {/* Background Ambient Corner Lighting (Blue & Cyan) */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] sm:h-[450px] sm:w-[450px] rounded-full bg-blue-500/10 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-[320px] w-[320px] rounded-full bg-cyan-500/10 blur-[110px]" />
      <div className="pointer-events-none absolute top-1/3 right-1/3 h-[280px] w-[280px] rounded-full bg-indigo-500/10 blur-[120px]" />

      {/* Main Glass Workspace Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={
          isError
            ? {
                opacity: 1,
                scale: 1,
                y: 0,
                x: [-10, 10, -8, 8, -4, 4, 0],
              }
            : { opacity: 1, scale: 1, y: 0 }
        }
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="deep-glass relative z-10 w-full max-w-md overflow-hidden rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-white/10"
      >
        {/* Top Rim Sunlight Highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

        {/* Ambient Top Security Badge */}
        <div className="mb-4 flex items-center justify-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-blue-400/90">
          <Lock className="h-3.5 w-3.5 text-blue-400" />
          <span>High Privilege Portal</span>
        </div>

        {/* Header Component */}
        <AdminHeader />

        {/* Password Input Component */}
        <PasswordInput
          ref={inputRef}
          value={password}
          onChange={handlePasswordChange}
          onSubmit={handleUnlock}
          isError={isError}
          disabled={loading || isSuccess}
        />

        {/* Unlock Button Component */}
        <UnlockButton
          onClick={handleUnlock}
          disabled={!password.trim()}
          loading={loading}
          success={isSuccess}
        />

        {/* Back to Home Button Component */}
        <BackHomeButton />
      </motion.div>

      {/* Reusable QLex Popup Modal */}
      <Popup
        open={popupState.open}
        onClose={handlePopupClose}
        title={popupState.title}
        description={popupState.description}
        variant={popupState.variant}
        icon={
          popupState.variant === "success" ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          ) : (
            <ShieldAlert className="h-6 w-6 text-red-400" />
          )
        }
        showCloseButton={true}
        dismissOnBackdrop={true}
        dismissOnEsc={true}
      />
    </motion.div>
  );
}
