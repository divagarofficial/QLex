"use client";

import { useState, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, Mail, Lock, BookOpen, ShieldCheck } from "lucide-react";
import GlassInput from "./GlassInput";
import GlassSelect from "./GlassSelect";
import { register, getDepartments, getYears } from "@/services/auth";
import type {
  UserResponse,
  DepartmentOption,
  YearOption,
} from "./types";

interface RegisterFormProps {
  onSuccess: (user: UserResponse) => void;
  onError: (message: string) => void;
}

interface FormErrors {
  register_number?: string;
  full_name?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
  department_id?: string;
  year_id?: string;
  section_name?: string;
  general?: string;
}

function validateForm(data: {
  register_number: string;
  full_name: string;
  phone: string;
  email: string;
  password: string;
  confirm_password: string;
  department_id: string;
  year_id: string;
  section_name: string;
}): FormErrors {
  const errors: FormErrors = {};

  if (!data.register_number.trim() || data.register_number.trim().length < 3) {
    errors.register_number = "Register number must be at least 3 characters.";
  } else if (data.register_number.trim().length > 30) {
    errors.register_number = "Register number must be at most 30 characters.";
  }
  if (!data.full_name.trim() || data.full_name.trim().length < 2) {
    errors.full_name = "Full name must be at least 2 characters.";
  } else if (data.full_name.trim().length > 150) {
    errors.full_name = "Full name must be at most 150 characters.";
  }
  if (!data.phone.trim() || data.phone.trim().length < 10) {
    errors.phone = "Phone number must be at least 10 digits.";
  } else if (data.phone.trim().length > 15) {
    errors.phone = "Phone number must be at most 15 digits.";
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!data.password || data.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }
  if (data.password !== data.confirm_password) {
    errors.confirm_password = "Passwords do not match.";
  }
  if (!data.department_id) {
    errors.department_id = "Please select a department.";
  }
  if (!data.year_id) {
    errors.year_id = "Please select a year.";
  }
  if (!data.section_name.trim()) {
    errors.section_name = "Please enter your section.";
  } else if (!/^[a-zA-Z]{1,5}$/.test(data.section_name.trim())) {
    errors.section_name = "Section must be an alphabet letter (A to Z).";
  }

  return errors;
}

export default function RegisterForm({ onSuccess, onError }: RegisterFormProps) {
  const [registerNumber, setRegisterNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [yearId, setYearId] = useState("");
  const [sectionName, setSectionName] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  // Lookup data fetched from backend
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [years, setYears] = useState<YearOption[]>([]);
  const [lookupLoading, setLookupLoading] = useState(true);
  const [lookupError, setLookupError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchLookups() {
      setLookupLoading(true);
      setLookupError(null);
      try {
        const [deptRes, yearRes] = await Promise.all([
          getDepartments(),
          getYears(),
        ]);
        if (!cancelled) {
          setDepartments(deptRes.departments);
          setYears(yearRes.years);
        }
      } catch {
        if (!cancelled) {
          setLookupError("Unable to load departments and years. Please try again later.");
        }
      } finally {
        if (!cancelled) setLookupLoading(false);
      }
    }
    fetchLookups();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      register_number: registerNumber.trim(),
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      password,
      confirm_password: confirmPassword,
      department_id: departmentId,
      year_id: yearId,
      section_name: sectionName.trim().toUpperCase(),
    };

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        ...formData,
        email: formData.email || null,
      });
      onSuccess(user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to create your account. Please try again.";
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

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-4"
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

      {/* Row 2: Contact */}
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
          label="Email (Optional)"
          type="email"
          value={email}
          onChange={setEmail}
          error={fieldError("email")}
          autoComplete="email"
          disabled={loading}
          icon={Mail}
        />
      </div>

      {/* Row 3: Department dropdown + Year dropdown + Section free-text input */}
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

      {/* Row 4: Passwords */}
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

      {/* General / API error */}
      <AnimatePresence mode="wait">
        {errors.general && (
          <motion.p
            key="reg-error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="text-[13px] leading-relaxed text-[rgba(239,68,68,0.7)] tracking-wide text-center"
          >
            {errors.general}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Submit button */}
      <motion.button
        type="submit"
        disabled={loading || lookupLoading}
        whileHover={!loading && !lookupLoading ? { scale: 1.015 } : undefined}
        whileTap={!loading && !lookupLoading ? { scale: 0.985 } : undefined}
        className="relative w-full overflow-hidden rounded-2xl border border-[rgba(231,200,115,0.25)] bg-[rgba(231,200,115,0.06)] py-4 text-[15px] font-medium tracking-wide text-[#E7C873] transition-all duration-500 outline-none hover:border-[rgba(231,200,115,0.4)] hover:bg-[rgba(231,200,115,0.1)] hover:shadow-[0_0_30px_rgba(231,200,115,0.08)] disabled:cursor-not-allowed disabled:border-[rgba(255,255,255,0.06)] disabled:bg-[rgba(255,255,255,0.03)] disabled:text-white/40"
      >
        {/* Top edge highlight */}
        <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {loading ? (
          <span className="inline-flex items-center gap-3">
            <svg className="animate-spin h-4 w-4 text-white/40" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Creating Account...
          </span>
        ) : lookupLoading ? (
          <span className="inline-flex items-center gap-3">
            <svg className="animate-spin h-4 w-4 text-white/40" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading...
          </span>
        ) : (
          "Create Account"
        )}
      </motion.button>
    </motion.form>
  );
}

function getYearSuffix(n: number): string {
  if (n === 1) return "st";
  if (n === 2) return "nd";
  if (n === 3) return "rd";
  return "th";
}

