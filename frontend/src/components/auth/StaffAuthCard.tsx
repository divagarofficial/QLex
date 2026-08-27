"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, LogIn, UserPlus, UserCheck, Sparkles } from "lucide-react";
import StaffLoginForm from "./StaffLoginForm";
import StaffRegisterForm from "./StaffRegisterForm";
import Popup from "@/components/popup/Popup";
import { useAuthStore } from "@/store/authStore";
import { getCurrentUser } from "@/services/auth";

type AuthMode = "login" | "register";

export default function StaffAuthCard() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [result, setResult] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
    buttons: { label: string; action: () => void; variant?: "primary" | "secondary" }[];
  } | null>(null);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    };
  }, []);

  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const hydrate = useAuthStore((s) => s.hydrate);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // If staff is already authenticated, auto-redirect to staff dashboard
  useEffect(() => {
    const storedToken = hydrate();
    if (storedToken || (token && isAuthenticated)) {
      router.replace("/staff/dashboard");
    }
  }, [router, hydrate, token, isAuthenticated]);

  const handleLoginSuccess = useCallback(
    async (token: string) => {
      setToken(token);
      try {
        const user = await getCurrentUser(token);
        setUser(user);
      } catch {
        // If /me fails, still allow login
      }

      setResult({
        type: "success",
        title: "Welcome Back, Staff!",
        message: "Authentication successful. Redirecting to your staff portal...",
        buttons: [
          {
            label: "Continue",
            action: () => {
              if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
              setResult(null);
              router.push("/staff/dashboard");
            },
          },
        ],
      });
      autoCloseTimerRef.current = setTimeout(() => {
        setResult(null);
        router.push("/staff/dashboard");
      }, 1500);
    },
    [router, setToken, setUser]
  );

  const handleLoginError = useCallback((errorMessage: string) => {
    setResult({
      type: "error",
      title: "Sign In Failed",
      message: errorMessage || "Invalid Staff ID or Password.",
      buttons: [
        {
          label: "Try Again",
          action: () => setResult(null),
          variant: "primary",
        },
      ],
    });
  }, []);

  const handleRegisterSuccess = useCallback(() => {
    setResult({
      type: "success",
      title: "Staff Account Created Successfully",
      message:
        "Your QLex staff account has been created. You can now sign in using your Staff ID and Password.",
      buttons: [
        {
          label: "Continue to Sign In",
          action: () => {
            setResult(null);
            setMode("login");
          },
          variant: "primary",
        },
      ],
    });
  }, []);

  const handleRegisterError = useCallback((errorMessage: string) => {
    setResult({
      type: "error",
      title: "Registration Failed",
      message: errorMessage || "Unable to create staff account. Please try again.",
      buttons: [
        {
          label: "Try Again",
          action: () => setResult(null),
          variant: "primary",
        },
      ],
    });
  }, []);

  const closeAll = useCallback(() => {
    setResult(null);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#030406]">
      {/* Environmental Lighting Orbs */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, rgba(59,130,246,0.03) 50%, transparent 75%)",
          filter: "blur(100px)",
        }}
      />

      {/* Header Bar */}
      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 pt-6">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-white/70 backdrop-blur-md transition-all duration-300 hover:border-emerald-500/40 hover:bg-white/[0.06] hover:text-emerald-400"
        >
          <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>

        {/* Institution Badge */}
        <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 backdrop-blur-md">
          <Building2 className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[10px] font-semibold tracking-widest text-emerald-400 uppercase">
            RAJALAKSHMI INSTITUTE OF TECHNOLOGY
          </span>
        </div>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="deep-glass relative w-full max-w-[480px] overflow-hidden"
        >
          <div className="deep-glass-reflection" />
          <div className="deep-glass-rim" />
          <div className="deep-glass-sweep" />
          <div className="relative z-10 px-5 py-8 sm:px-8 sm:py-10">
            {/* Institution Badge & Logo */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-3 mb-6"
            >
              <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 sm:px-3.5 backdrop-blur-md">
                <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-emerald-400" />
                <span className="text-[8.5px] min-[360px]:text-[9.5px] sm:text-[11px] font-bold tracking-wide text-emerald-400 uppercase whitespace-nowrap">
                  RAJALAKSHMI INSTITUTE OF TECHNOLOGY
                </span>
              </div>

              {/* Logo */}
              <div className="relative mt-1">
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 h-[130px] w-[130px] -translate-x-1/2 -translate-y-1/2"
                  style={{
                    background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)",
                    filter: "blur(35px)",
                  }}
                />
                <Image
                  src="/qlex-logo.svg"
                  width={90}
                  height={90}
                  alt="QLex"
                  className="relative h-auto w-[76px] sm:w-[92px]"
                  priority
                />
              </div>

              <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-medium tracking-[0.3em] uppercase text-emerald-400/80">
                <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Staff Portal</span>
              </div>
            </motion.div>

            {/* Tabs */}
            <div className="relative mb-6">
              <div className="relative flex w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.25)] p-1">
                <motion.div
                  layout
                  layoutId="staff-tab-indicator"
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-emerald-500/15 border border-emerald-500/30"
                  style={{
                    left: mode === "login" ? "4px" : "calc(50% + 0px)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-medium tracking-wide transition-colors duration-300 ${
                    mode === "login" ? "text-emerald-400" : "text-white/40 hover:text-white/70"
                  }`}
                >
                  <LogIn size={15} />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-medium tracking-wide transition-colors duration-300 ${
                    mode === "register" ? "text-emerald-400" : "text-white/40 hover:text-white/70"
                  }`}
                >
                  <UserPlus size={15} />
                  <span>Register</span>
                </button>
              </div>
            </div>

            {/* Forms */}
            <AnimatePresence mode="wait">
              {mode === "login" ? (
                <StaffLoginForm key="login" onSuccess={handleLoginSuccess} onError={handleLoginError} />
              ) : (
                <StaffRegisterForm key="register" onSuccess={handleRegisterSuccess} onError={handleRegisterError} />
              )}
            </AnimatePresence>

            {/* Feature pill */}
            <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-3 py-2 text-[10px] sm:text-[11px] text-emerald-300/70">
              <Sparkles className="h-3 w-3 text-emerald-400" />
              <span>Direct Routing to QLex Satellite Print Hub • Free Staff Orders</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Result Popup */}
      {result && (
        <Popup
          open={true}
          onClose={closeAll}
          title={result.title}
          description={result.message}
          variant={result.type}
          size="sm"
          showCloseButton={false}
          dismissOnBackdrop={false}
          dismissOnEsc={false}
        >
          <div className="flex flex-col gap-3 px-8 pb-8 pt-2">
            {result.buttons.map((btn, idx) => (
              <button
                key={idx}
                type="button"
                onClick={btn.action}
                className="relative w-full overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/10 py-3.5 text-[14px] font-medium tracking-wide text-emerald-400 transition-all hover:bg-emerald-500/20 cursor-pointer"
              >
                {btn.label}
              </button>
            ))}
          </div>
        </Popup>
      )}
    </div>
  );
}
