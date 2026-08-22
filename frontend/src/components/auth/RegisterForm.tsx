"use client";

import { useState, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, Mail, Lock, BookOpen, ShieldCheck, KeyRound, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import GlassInput from "./GlassInput";
import GlassSelect from "./GlassSelect";
import { register, sendOTP, getDepartments, getYears, getRegistrationSettings } from "@/services/auth";
import type {
  UserResponse,
  DepartmentOption,
  YearOption,
} from "./types";
import Link from "next/link";

interface RegisterFormProps {
  onSuccess: (user: UserResponse) => void;
  onError: (message: string) => void;
}

interface FormErrors {
  register_number?: string;
  full_name?: string;
  phone?: string;
  email?: string;
  otp_code?: string;
  password?: string;
  confirm_password?: string;
  department_id?: string;
  year_id?: string;
  section_name?: string;
  general?: string;
}

const ALLOWED_RIT_DOMAINS = ["ritchennai.edu.in", "rajalakshmi.edu.in", "rit.ac.in", "rit.edu"];

function isRITEmail(email: string, isFirstYear?: boolean): boolean {
  if (!email || !email.includes("@")) return false;
  if (isFirstYear) {
    return email.trim().split("@").pop()?.includes(".") ?? false;
  }
  const domain = email.trim().split("@").pop()?.toLowerCase() || "";
  return ALLOWED_RIT_DOMAINS.some((d) => domain === d || domain.endsWith("." + d));
}

export default function RegisterForm({ onSuccess, onError }: RegisterFormProps) {
  // Step 1 vs Step 2 state
  const [step, setStep] = useState<"details" | "otp">("details");

  // Form State
  const [registerNumber, setRegisterNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [yearId, setYearId] = useState("");
  const [sectionName, setSectionName] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState<string | null>(null);

  // Lookup & Setting data fetched from backend
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [years, setYears] = useState<YearOption[]>([]);
  const [allowFirstYearPersonal, setAllowFirstYearPersonal] = useState(true);
  const [lookupLoading, setLookupLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchLookups() {
      setLookupLoading(true);
      try {
        const [deptRes, yearRes, regSettings] = await Promise.all([
          getDepartments(),
          getYears(),
          getRegistrationSettings().catch(() => ({ allow_first_year_personal_email: true, allowed_domains: [] })),
        ]);
        if (!cancelled) {
          setDepartments(deptRes.departments);
          setYears(yearRes.years);
          setAllowFirstYearPersonal(regSettings.allow_first_year_personal_email ?? true);
        }
      } catch {
        // Handle lookup load fail
      } finally {
        if (!cancelled) setLookupLoading(false);
      }
    }
    fetchLookups();
    return () => { cancelled = true; };
  }, []);

  // Step 1: Validate Student Details & Send OTP
  const handleSendOTP = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setOtpSentMessage(null);

    const newErrors: FormErrors = {};

    if (!registerNumber.trim() || registerNumber.trim().length < 3) {
      newErrors.register_number = "Register number must be at least 3 characters.";
    }
    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.full_name = "Full name must be at least 2 characters.";
    }
    if (!phone.trim() || phone.trim().length < 10) {
      newErrors.phone = "Phone number must be at least 10 digits.";
    }
    const selectedYear = years.find((y) => y.id === yearId);
    const isFirstYear = (selectedYear ? selectedYear.year_number === 1 : false) && allowFirstYearPersonal;

    if (!email.trim()) {
      newErrors.email = isFirstYear ? "Email address is required." : "RIT email address is required.";
    } else if (!isRITEmail(email, isFirstYear)) {
      newErrors.email = isFirstYear
        ? "Please enter a valid email address."
        : "Registration is restricted to official RIT student email addresses (@ritchennai.edu.in).";
    }
    if (!departmentId) {
      newErrors.department_id = "Please select your department.";
    }
    if (!yearId) {
      newErrors.year_id = "Please select your year.";
    }
    if (!sectionName.trim()) {
      newErrors.section_name = "Please enter section.";
    } else if (!/^[a-zA-Z]{1,5}$/.test(sectionName.trim())) {
      newErrors.section_name = "Section must be a letter (e.g. A).";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await sendOTP(email.trim(), yearId);
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

  // Step 2: Verify OTP & Complete Registration
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
      const user = await register({
        register_number: registerNumber.trim(),
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        otp_code: otpCode.trim(),
        password,
        confirm_password: confirmPassword,
        department_id: departmentId,
        year_id: yearId,
        section_name: sectionName.trim().toUpperCase(),
      });
      onSuccess(user);
    } catch (err: any) {
      const message = err.message || "Unable to complete account registration. Please verify your OTP code.";
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

  const yearOptions = [
    { value: "", label: "Select Year" },
    ...years.map((y) => ({ value: y.id, label: `${y.year_number}${getYearSuffix(y.year_number)} Year` })),
  ];

  const selectedYearObj = years.find((y) => y.id === yearId);
  const isFirstYearSelected = (selectedYearObj ? selectedYearObj.year_number === 1 : false) && allowFirstYearPersonal;

  return (
    <div className="flex flex-col gap-4">
      {/* Notice & Guest Checkout Prompt Banner */}
      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-3.5 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                {isFirstYearSelected ? "1st Year Student Registration" : "RIT Student Account Registration"}
              </span>
            </div>
            {isFirstYearSelected ? (
              <p className="mt-0.5 text-xs text-emerald-300 leading-relaxed font-medium">
                ✨ 1st Year Mode Active: Personal email (<code className="text-white bg-emerald-500/20 px-1 py-0.5 rounded">@gmail.com</code>) is accepted!
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-white/70 leading-relaxed">
                Account registration for RIT students (<code className="text-cyan-300">@ritchennai.edu.in</code>). 1st years can use personal email.
              </p>
            )}
          </div>
        </div>

        {/* Express Guest Checkout Shortcut */}
        <div className="mt-3 pt-2.5 border-t border-cyan-500/15 flex items-center justify-between">
          <span className="text-[12px] text-white/60">Not an RIT student?</span>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E7C873] hover:text-amber-300 transition-colors"
          >
            <span>Express Guest Checkout</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {step === "details" ? (
        /* STEP 1: Student Details + Send OTP */
        <motion.form
          onSubmit={handleSendOTP}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="flex flex-col gap-3 sm:gap-4"
          noValidate
        >
          {/* Row 1: ID fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <GlassInput
              label="Register Number"
              value={registerNumber}
              onChange={setRegisterNumber}
              error={fieldError("register_number")}
              autoComplete="off"
              disabled={loading}
              required
              icon={User}
              placeholder="e.g. 211421104001"
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

          {/* Row 2: Contact & Mandatory RIT Email */}
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
              label={isFirstYearSelected ? "Email (Personal @gmail.com allowed)" : "RIT Student Email (Mandatory)"}
              type="email"
              value={email}
              onChange={setEmail}
              error={fieldError("email")}
              autoComplete="email"
              disabled={loading}
              required
              placeholder={isFirstYearSelected ? "e.g. student@gmail.com" : "name@ritchennai.edu.in"}
              icon={Mail}
            />
          </div>

          {/* Row 3: Department dropdown + Year dropdown + Section */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <GlassSelect
              label="Department"
              value={departmentId}
              onChange={setDepartmentId}
              options={departmentOptions}
              error={fieldError("department_id")}
              disabled={loading || lookupLoading}
              required
            />
            <GlassSelect
              label="Year"
              value={yearId}
              onChange={setYearId}
              options={yearOptions}
              error={fieldError("year_id")}
              disabled={loading || lookupLoading}
              required
            />
            <GlassInput
              label="Section"
              value={sectionName}
              onChange={setSectionName}
              error={fieldError("section_name")}
              autoComplete="off"
              disabled={loading}
              required
              placeholder="e.g. A"
              icon={BookOpen}
            />
          </div>

          {/* Submit / Send OTP Button */}
          <motion.button
            type="submit"
            disabled={loading || lookupLoading}
            whileHover={!loading ? { scale: 1.01 } : undefined}
            whileTap={!loading ? { scale: 0.99 } : undefined}
            className="mt-2 relative w-full overflow-hidden rounded-2xl border border-[rgba(231,200,115,0.3)] bg-[rgba(231,200,115,0.08)] py-3.5 text-[15px] font-semibold text-[#E7C873] transition-all duration-300 hover:bg-[rgba(231,200,115,0.15)] flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-[#E7C873]" viewBox="0 0 24 24" fill="none">
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
                  className="text-[11px] text-cyan-300 hover:text-cyan-200 underline font-medium cursor-pointer"
                >
                  Resend OTP
                </button>
              </div>
              <p className="mt-1 text-[11px] text-white/70">
                Verification code sent to <code className="text-emerald-300">{email}</code>. Enter the code below.
              </p>
              <p className="mt-1 text-[10px] text-amber-300/80">
                Tip: If your college mail filter delays the email, check your Spam folder or use test code <code className="text-white font-mono bg-white/10 px-1 py-0.5 rounded">999999</code>.
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
              className="flex-1 overflow-hidden rounded-2xl border border-[rgba(231,200,115,0.3)] bg-[rgba(231,200,115,0.12)] py-3.5 text-[15px] font-semibold text-[#E7C873] transition-all hover:bg-[rgba(231,200,115,0.2)] flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-[#E7C873]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying & Creating Account...
                </span>
              ) : (
                "Verify OTP & Create Account"
              )}
            </motion.button>
          </div>
        </motion.form>
      )}
    </div>
  );
}

function getYearSuffix(n: number): string {
  if (n === 1) return "st";
  if (n === 2) return "nd";
  if (n === 3) return "rd";
  return "th";
}
