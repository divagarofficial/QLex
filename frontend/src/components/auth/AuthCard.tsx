"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, LogIn, UserPlus, GraduationCap, Sparkles } from "lucide-react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import Popup from "@/components/popup/Popup";
import { useAuthStore } from "@/store/authStore";
import { getCurrentUser } from "@/services/auth";

type AuthMode = "login" | "register";

export default function AuthCard() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [result, setResult] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
    buttons: { label: string; action: () => void; variant?: "primary" | "secondary" }[];
  } | null>(null);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    };
  }, []);

  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);

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
        title: "Welcome Back!",
        message: "Authentication successful. Redirecting to your dashboard...",
        buttons: [
          {
            label: "Continue",
            action: () => {
              if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
              setResult(null);
              router.push("/student/dashboard");
            },
          },
        ],
      });
      autoCloseTimerRef.current = setTimeout(() => {
        setResult(null);
        router.push("/student/dashboard");
      }, 1500);
    },
    [router, setToken, setUser]
  );

  const handleLoginError = useCallback((errorMessage: string) => {
    setResult({
      type: "error",
      title: "Sign In Failed",
      message: errorMessage || "Invalid Register Number or Password.",
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
      title: "Account Created Successfully",
      message:
        "Your QLex account has been created successfully. You can now sign in using your Register Number and Password.",
      buttons: [
        {
          label: "Continue to Sign In",
          action: () => {
            setResult(null);
            setMode("login");
          },
          variant: "primary",
        },
        {
          label: "Stay Here",
          action: () => setResult(null),
          variant: "secondary",
        },
      ],
    });
  }, []);

  const handleRegisterError = useCallback((errorMessage: string) => {
    setResult({
      type: "error",
      title: "Registration Failed",
      message: errorMessage || "Unable to create your account. Please try again.",
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
      {/* Background ambient lighting orbs */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(231,200,115,0.06) 0%, rgba(124,58,237,0.03) 50%, transparent 75%)",
          filter: "blur(100px)",
        }}
      />
      <div
        className="pointer-events-none absolute right-10 bottom-1/4 h-[400px] w-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />

      {/* Top Bar with Back to Home button */}
      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 pt-6">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-white/70 backdrop-blur-md transition-all duration-300 hover:border-[#E7C873]/40 hover:bg-white/[0.06] hover:text-[#E7C873]"
        >
          <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>

        {/* Institution Mini Badge */}
        <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[rgba(231,200,115,0.18)] bg-[rgba(231,200,115,0.04)] px-3.5 py-1.5 backdrop-blur-md">
          <Building2 className="h-3.5 w-3.5 text-[#E7C873]" />
          <span className="text-[10px] font-semibold tracking-widest text-[#E7C873] uppercase">
            RAJALAKSHMI INSTITUTE OF TECHNOLOGY
          </span>
        </div>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="deep-glass relative w-full max-w-[460px] overflow-hidden"
        >
          <div className="deep-glass-reflection" />
          <div className="deep-glass-rim" />
          <div className="deep-glass-sweep" />
          <div className="relative z-10 px-5 py-8 sm:px-8 sm:py-10">
            {/* Institution Badge on Mobile & Header on Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-3 mb-6"
            >
              {/* Institution badge */}
              <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-[rgba(231,200,115,0.25)] bg-[rgba(231,200,115,0.06)] px-3 py-1 sm:px-3.5 backdrop-blur-md shadow-[0_0_15px_rgba(231,200,115,0.05)] max-w-full">
                <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-[#E7C873]" />
                <span className="text-[8.5px] min-[360px]:text-[9.5px] sm:text-[11px] font-bold tracking-wide sm:tracking-wider text-[#E7C873] uppercase whitespace-nowrap">
                  RAJALAKSHMI INSTITUTE OF TECHNOLOGY
                </span>
              </div>

              {/* Logo */}
              <div className="relative mt-1">
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 h-[130px] w-[130px] -translate-x-1/2 -translate-y-1/2"
                  style={{
                    background: "radial-gradient(circle, rgba(231,200,115,0.12) 0%, transparent 70%)",
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

              <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-medium tracking-[0.3em] uppercase text-white/50">
                <GraduationCap className="h-3.5 w-3.5 text-violet-400" />
                <span>Student Portal</span>
              </div>
            </motion.div>

            {/* Tabs */}
            <div className="relative mb-6">
              <div className="relative flex w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.25)] p-1">
                <motion.div
                  layout
                  layoutId="auth-tab-indicator"
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-[rgba(231,200,115,0.12)] border border-[rgba(231,200,115,0.22)] shadow-[0_0_15px_rgba(231,200,115,0.08)]"
                  style={{
                    left: mode === "login" ? "4px" : "calc(50% + 0px)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-medium tracking-wide transition-colors duration-300 ${
                    mode === "login" ? "text-[#E7C873]" : "text-white/40 hover:text-white/70"
                  }`}
                  aria-selected={mode === "login"}
                  role="tab"
                >
                  <LogIn size={15} />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-medium tracking-wide transition-colors duration-300 ${
                    mode === "register" ? "text-[#E7C873]" : "text-white/40 hover:text-white/70"
                  }`}
                  aria-selected={mode === "register"}
                  role="tab"
                >
                  <UserPlus size={15} />
                  <span>Register</span>
                </button>
              </div>
            </div>

            {/* Forms */}
            <AnimatePresence mode="wait">
              {mode === "login" ? (
                <LoginForm key="login" onSuccess={handleLoginSuccess} onError={handleLoginError} />
              ) : (
                <RegisterForm key="register" onSuccess={handleRegisterSuccess} onError={handleRegisterError} />
              )}
            </AnimatePresence>

            {/* Quick feature pill */}
            <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.015] px-3 py-2 text-[10px] sm:text-[11px] text-white/35">
              <Sparkles className="h-3 w-3 text-[#E7C873]" />
              <span>Campus Instant Document Printing & Online Tokens</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Result popup using reusable Popup component */}
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
                className={`relative w-full overflow-hidden rounded-2xl border py-3.5 text-[14px] font-medium tracking-wide transition-all duration-500 outline-none cursor-pointer ${
                  btn.variant === "secondary"
                    ? "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-white/60 hover:border-[rgba(255,255,255,0.18)] hover:bg-[rgba(255,255,255,0.06)] hover:text-white/80"
                    : result.type === "success"
                      ? "border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.06)] text-[#22c55e] hover:border-[rgba(34,197,94,0.4)] hover:bg-[rgba(34,197,94,0.1)]"
                      : "border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.06)] text-[#ef4444] hover:border-[rgba(239,68,68,0.4)] hover:bg-[rgba(239,68,68,0.1)]"
                }`}
              >
                <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                {btn.label}
              </button>
            ))}
          </div>
        </Popup>
      )}
    </div>
  );
}

