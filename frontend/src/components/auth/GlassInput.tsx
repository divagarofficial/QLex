"use client";

import { useId, useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlassInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  icon?: LucideIcon;
}

export default function GlassInput({
  label,
  type = "text",
  value,
  onChange,
  error,
  disabled = false,
  autoComplete,
  placeholder,
  required = false,
  icon: Icon,
}: GlassInputProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative">
      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl border transition-all duration-500",
          "bg-[rgba(255,255,255,0.03)]",
          focused
            ? "border-[rgba(231,200,115,0.4)] shadow-[0_0_25px_rgba(231,200,115,0.08),inset_0_1px_0_rgba(255,255,255,0.12)]"
            : error
              ? "border-[rgba(239,68,68,0.35)] shadow-[0_0_15px_rgba(239,68,68,0.06)]"
              : "border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.16)] hover:bg-[rgba(255,255,255,0.04)]",
        )}
      >
        {/* Top edge highlight */}
        <div className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-60" />

        <div className="flex items-center">
          {/* Optional leading icon */}
          {Icon && (
            <div className="pl-4 pt-4 text-white/30 transition-colors duration-300 group-hover:text-white/50">
              <Icon size={18} className={cn(focused && "text-[#E7C873]", error && "text-red-400")} />
            </div>
          )}

          <div className="relative flex-1">
            {/* Input */}
            <input
              id={id}
              type={actualType}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              disabled={disabled}
              autoComplete={autoComplete}
              placeholder={placeholder || " "}
              required={required}
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
              className={cn(
                "relative z-10 block w-full bg-transparent px-4 pb-2 pt-7 text-[15px] text-white/90 outline-none transition-colors duration-300",
                "placeholder:text-white/0",
                "autofill:bg-transparent autofill:shadow-[inset_0_0_0_1000px_rgba(255,255,255,0.02)] autofill:[-webkit-text-fill-color:rgba(255,255,255,0.9)]",
                disabled && "cursor-not-allowed opacity-50",
                Icon && "pl-2",
              )}
            />

            {/* Floating label */}
            <label
              htmlFor={id}
              className={cn(
                "pointer-events-none absolute top-1/2 -translate-y-1/2 select-none transition-all duration-300",
                "text-white/40 text-sm",
                Icon ? "left-2" : "left-4",
                (focused || value) && "top-3.5 translate-y-0 text-[11px] font-medium tracking-wide",
                focused && "text-[#E7C873]",
                error && "text-[rgba(239,68,68,0.8)]",
              )}
            >
              {label}
              {required && <span className="ml-0.5 text-[rgba(231,200,115,0.6)]">*</span>}
            </label>
          </div>

          {/* Password visibility toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              disabled={disabled}
              className="relative z-20 pr-4 pt-4 text-white/30 hover:text-white/70 transition-colors focus:outline-none cursor-pointer"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        {/* Bottom rim reflection */}
        <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      </div>

      {/* Error message */}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 px-1 text-[12px] leading-relaxed text-[rgba(239,68,68,0.85)] tracking-wide font-medium"
        >
          {error}
        </p>
      )}
    </div>
  );
}

