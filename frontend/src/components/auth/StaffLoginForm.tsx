"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { UserCheck, Lock } from "lucide-react";
import GlassInput from "./GlassInput";
import { loginStaff } from "@/services/auth";
import Popup from "@/components/popup/Popup";

interface StaffLoginFormProps {
  onSuccess: (token: string) => void;
  onError: (message: string) => void;
}

interface FormErrors {
  staff_id?: string;
  password?: string;
}

export default function StaffLoginForm({ onSuccess, onError }: StaffLoginFormProps) {
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!staffId.trim()) {
      e.staff_id = "Staff ID is required.";
    } else if (staffId.trim().length < 3) {
      e.staff_id = "Staff ID must be at least 3 characters.";
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
      const res = await loginStaff({
        staff_id: staffId.trim(),
        password,
      });
      onSuccess(res.access_token);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid Staff ID or Password.";
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
          label="Staff ID"
          value={staffId}
          onChange={setStaffId}
          error={errors.staff_id}
          autoComplete="username"
          disabled={loading}
          required
          placeholder="e.g. STF-1042"
          icon={UserCheck}
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
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400/50 cursor-not-allowed"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:border-emerald-400/50 hover:bg-emerald-500/20 hover:shadow-[0_0_30px_rgba(16,185,129,0.12)] cursor-pointer"
            }
          `}
        >
          {/* Top edge highlight */}
          <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />

          {/* Loading spinner */}
          {loading ? (
            <span className="inline-flex items-center gap-3">
              <svg className="animate-spin h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing In...
            </span>
          ) : (
            "Sign In as Staff"
          )}
        </motion.button>
      </motion.form>

      {/* Forgot Password info popup */}
      <Popup
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Password Assistance"
        description="Please contact RIT Central Admin or IT Support to reset your staff credentials."
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
            className="relative w-full overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/10 py-3.5 text-[14px] font-medium tracking-wide text-emerald-400 transition-all duration-500 outline-none hover:bg-emerald-500/20 cursor-pointer"
          >
            <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />
            Understood
          </button>
        </div>
      </Popup>
    </>
  );
}
