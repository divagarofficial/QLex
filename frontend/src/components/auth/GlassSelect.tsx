"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface GlassSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
}

export default function GlassSelect({
  label,
  value,
  onChange,
  options,
  error,
  disabled = false,
  placeholder = "Select...",
  required = false,
}: GlassSelectProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl border transition-all duration-500",
          "bg-[rgba(255,255,255,0.03)]",
          focused
            ? "border-[rgba(231,200,115,0.4)] shadow-[0_0_20px_rgba(231,200,115,0.06),inset_0_1px_0_rgba(255,255,255,0.1)]"
            : error
              ? "border-[rgba(239,68,68,0.35)]"
              : "border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.14)]",
        )}
      >
        {/* Top edge highlight */}
        <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-60" />

        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          className={cn(
            "relative z-10 block w-full appearance-none bg-transparent px-4 pb-2 pt-7 text-[15px] text-white/90 outline-none transition-colors duration-300",
            "cursor-pointer",
            !value && "text-white/30",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0a0d12] text-white/90">
              {opt.label}
            </option>
          ))}
        </select>

        {/* Floating label */}
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 select-none transition-all duration-300",
            "text-white/40 text-sm",
            (focused || value) && "top-3.5 translate-y-0 text-[11px] tracking-wide",
            focused && "text-[rgba(231,200,115,0.7)]",
            error && "text-[rgba(239,68,68,0.6)]",
          )}
        >
          {label}
          {required && <span className="ml-0.5 text-[rgba(231,200,115,0.5)]">*</span>}
        </label>

        {/* Chevron */}
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/30">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Bottom rim reflection */}
        <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      </div>

      {/* Error message */}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 px-1 text-[12px] leading-relaxed text-[rgba(239,68,68,0.7)] tracking-wide"
        >
          {error}
        </p>
      )}
    </div>
  );
}
