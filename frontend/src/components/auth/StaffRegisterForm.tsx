"use client";

import { useState, useEffect, type FormEvent } from "react";
import { motion } from "framer-motion";
import { UserCheck, Phone, Mail, Lock, ShieldCheck, KeyRound, ArrowRight, Building2, CheckCircle2, Sparkles } from "lucide-react";
import GlassInput from "./GlassInput";
import GlassSelect from "./GlassSelect";
import { registerStaff, sendOTP, getDepartments } from "@/services/auth";
import type { UserResponse, DepartmentOption } from "./types";

interface StaffRegisterFormProps {
  onSuccess: (user: UserResponse) => void;
  onError: (message: string) => void;
}

interface FormErrors {
  staff_id?: string;
  full_name?: string;
  phone?: string;
  email?: string;
  otp_code?: string;
  password?: string;
  confirm_password?: string;
  department_id?: string;
  general?: string;
}

export default function StaffRegisterForm({ onSuccess, onError }: StaffRegisterFormProps) {
  // Step 1 vs Step 2 state
  const [step, setStep] = useState<"details" | "otp">("details");

  // Form State
  const [staffId, setStaffId] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState<string | null>(null);

  // Lookup data fetched from backend
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [lookupLoading, setLookupLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchLookups() {
      setLookupLoading(true);
      try {
        const deptRes = await getDepartments();
        if (!cancelled) {
          setDepartments(deptRes.departments || []);
        }
      } catch {
        // Handle lookup fail silently
      } finally {
        if (!cancelled) setLookupLoading(false);
      }
    }
    fetchLookups();
    return () => { cancelled = true; };
  }, []);

  // Step 1: Validate Staff Details & Send OTP
  const handleSendOTP = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setOtpSentMessage(null);

    const newErrors: FormErrors = {};

    if (!staffId.trim() || staffId.trim().length < 3) {
      newErrors.staff_id = "Staff ID must be at least 3 characters.";
    }
    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.full_name = "Full name must be at least 2 characters.";
    }
    if (!phone.trim() || phone.trim().length < 10) {
      newErrors.phone = "Phone number must be at least 10 digits.";
    }
    if (!email.trim() || !email.includes("@")) {
      newErrors.email = "Please enter a valid official/institutional email address.";
    }
    if (!departmentId) {
      newErrors.department_id = "Please select your department.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await sendOTP(email.trim());
      setOtpSentMessage(res.message || "OTP verification code sent to your email.");
      setStep("otp");
    } catch (err: any) {
      const msg = err.message || "Unable to send verification OTP code. Please check your email.";
      setErrors({ email: msg });
      onError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Complete Staff Registration
  const handleFinalRegister = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: FormErrors = {};

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      newErrors.otp_code = "Enter the 6-digit OTP code sent to your email.";
    }
    if (!password || password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    if (password !== confirmPassword) {
      newErrors.confirm_password = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const user = await registerStaff({
        staff_id: staffId.trim(),
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        otp_code: otpCode.trim(),
        password,
        confirm_password: confirmPassword,
        department_id: departmentId,
      });
      onSuccess(user);
    } catch (err: any) {
      const message = err.message || "Unable to create staff account. Please check your details.";
      setErrors({ general: message });
      onError(message);
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (key: keyof FormErrors) => errors[key] || "";

  const departmentOptions = [
    { value: "", label: "Select Department" },
    ...departments.map((d) => ({ value: d.id, label: d.name })),
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Notice Banner for Staff */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Faculty & Staff Account Registration
            </span>
            <p className="mt-0.5 text-xs text-white/70 leading-relaxed">
              Institutional staff accounts receive direct routing to <strong className="text-emerald-300">QLex Satellite Print Hub</strong> with zero cost printing.
            </p>
          </div>
        </div>
      </div>

      {step === "details" ? (
        /* STEP 1: Staff Details + Department */
        <motion.form
          onSubmit={handleSendOTP}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="flex flex-col gap-3 sm:gap-4"
          noValidate
        >
          {/* Row 1: Staff ID & Full Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <GlassInput
              label="Staff ID"
              value={staffId}
              onChange={setStaffId}
              error={fieldError("staff_id")}
              autoComplete="off"
              disabled={loading}
              required
              icon={UserCheck}
              placeholder="e.g. STF-1042"
            />
            <GlassInput
              label="Full Name"
              value={fullName}
              onChange={setFullName}
              error={fieldError("full_name")}
              autoComplete="name"
              disabled={loading}
              required
              icon={ShieldCheck}
            />
          </div>

          {/* Row 2: Contact & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <GlassInput
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={setPhone}
              error={fieldError("phone")}
              autoComplete="tel"
              disabled={loading}
              required
              icon={Phone}
            />
            <GlassInput
              label="Official Email Address"
              type="email"
              value={email}
              onChange={setEmail}
              error={fieldError("email")}
              autoComplete="email"
              disabled={loading}
              required
              placeholder="e.g. staff@ritchennai.edu.in"
              icon={Mail}
            />
          </div>

          {/* Row 3: Department selection (No Year / Section) */}
          <GlassSelect
            label="Department"
            value={departmentId}
            onChange={setDepartmentId}
            options={departmentOptions}
            error={fieldError("department_id")}
            disabled={loading || lookupLoading}
            required
          />

          {/* Submit / Send OTP Button */}
          <motion.button
            type="submit"
            disabled={loading || lookupLoading}
            whileHover={!loading ? { scale: 1.01 } : undefined}
            whileTap={!loading ? { scale: 0.99 } : undefined}
            className="mt-2 relative w-full overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/10 py-3.5 text-[15px] font-semibold text-emerald-400 transition-all duration-300 hover:bg-emerald-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending Verification OTP...
              </span>
            ) : (
              <>
                <span>Send Verification OTP Code</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>
        </motion.form>
      ) : (
        /* STEP 2: Enter OTP & Set Password */
        <motion.form
          onSubmit={handleFinalRegister}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
            <div className="text-xs text-emerald-200 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{otpSentMessage}</span>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="text-[11px] text-emerald-300 hover:text-emerald-200 underline font-medium cursor-pointer"
                >
                  Resend OTP
                </button>
              </div>
              <p className="mt-1 text-[11px] text-white/70">
                Verification code sent to <code className="text-emerald-300">{email}</code>. Enter the code below.
              </p>
            </div>
          </div>

          <GlassInput
            label="6-Digit OTP Code"
            value={otpCode}
            onChange={setOtpCode}
            error={fieldError("otp_code")}
            autoComplete="one-time-code"
            disabled={loading}
            required
            icon={KeyRound}
            placeholder="e.g. 123456"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <GlassInput
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              error={fieldError("password")}
              autoComplete="new-password"
              disabled={loading}
              required
              icon={Lock}
            />
            <GlassInput
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={fieldError("confirm_password")}
              autoComplete="new-password"
              disabled={loading}
              required
              icon={Lock}
            />
          </div>

          {errors.general && (
            <p className="text-xs text-rose-400 text-center">{errors.general}</p>
          )}

          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={() => setStep("details")}
              disabled={loading}
              className="px-4 py-3.5 rounded-2xl border border-white/10 bg-white/5 text-xs text-white/70 hover:text-white hover:bg-white/10 transition"
            >
              Back
            </button>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.01 } : undefined}
              whileTap={!loading ? { scale: 0.99 } : undefined}
              className="flex-1 overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/15 py-3.5 text-[15px] font-semibold text-emerald-400 transition-all hover:bg-emerald-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying & Creating Staff Account...
                </span>
              ) : (
                "Verify & Create Staff Account"
              )}
            </motion.button>
          </div>
        </motion.form>
      )}
    </div>
  );
}
