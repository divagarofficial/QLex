"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { User, Lock } from "lucide-react";
import GlassInput from "./GlassInput";
import { login } from "@/services/auth";
import Popup from "@/components/popup/Popup";

interface LoginFormProps {
  onSuccess: (token: string) => void;
  onError: (message: string) => void;
}

interface FormErrors {
  register_number?: string;
  password?: string;
}

export default function LoginForm({ onSuccess, onError }: LoginFormProps) {
  const [registerNumber, setRegisterNumber] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!registerNumber.trim()) {
      e.register_number = "Register number is required.";
    } else if (registerNumber.trim().length < 3) {
      e.register_number = "Register number must be at least 3 characters.";
    }
    if (!password) {
      e.password = "Password is required.";
    }
    return e;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await login({
        register_number: registerNumber.trim(),
        password,
      });
      onSuccess(res.access_token);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid Register Number or Password.";
      onError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-5"
        noValidate
      >
        <GlassInput
          label="Register Number"
          value={registerNumber}
          onChange={setRegisterNumber}
          error={errors.register_number}
          autoComplete="username"
          disabled={loading}
          required
          icon={User}
        />

        <GlassInput
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          error={errors.password}
          autoComplete="current-password"
          disabled={loading}
          required
          icon={Lock}
        />

        {/* Forgot Password link */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setForgotOpen(true)}
            className="text-[12px] tracking-wide text-white/30 hover:text-white/50 transition-colors duration-300 cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={!loading ? { scale: 1.015 } : undefined}
          whileTap={!loading ? { scale: 0.985 } : undefined}
          className={`
            relative w-full overflow-hidden rounded-2xl border py-4 text-[15px] font-medium tracking-wide
            transition-all duration-500 outline-none
            ${
              loading
                ? "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-white/40 cursor-not-allowed"
                : "border-[rgba(231,200,115,0.25)] bg-[rgba(231,200,115,0.06)] text-[#E7C873] hover:border-[rgba(231,200,115,0.4)] hover:bg-[rgba(231,200,115,0.1)] hover:shadow-[0_0_30px_rgba(231,200,115,0.08)] cursor-pointer"
            }
          `}
        >
          {/* Top edge highlight */}
          <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

          {/* Loading spinner */}
          {loading ? (
            <span className="inline-flex items-center gap-3">
              <svg className="animate-spin h-4 w-4 text-white/40" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing In...
            </span>
          ) : (
            "Sign In"
          )}
        </motion.button>
      </motion.form>

      {/* Forgot Password info popup */}
      <Popup
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Coming Soon"
        description="Password recovery will be available in a future update."
        variant="info"
        size="sm"
        showCloseButton
        dismissOnBackdrop
        dismissOnEsc
      >
        <div className="px-8 pb-8 pt-2">
          <button
            type="button"
            onClick={() => setForgotOpen(false)}
            className="relative w-full overflow-hidden rounded-2xl border border-[rgba(59,130,246,0.25)] bg-[rgba(59,130,246,0.06)] py-3.5 text-[14px] font-medium tracking-wide text-[#3b82f6] transition-all duration-500 outline-none hover:border-[rgba(59,130,246,0.4)] hover:bg-[rgba(59,130,246,0.1)] cursor-pointer"
          >
            <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
            OK
          </button>
        </div>
      </Popup>
    </>
  );
}

