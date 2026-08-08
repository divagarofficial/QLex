"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  isError?: boolean;
  placeholder?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      value,
      onChange,
      onSubmit,
      disabled = false,
      isError = false,
      placeholder = "Enter admin password...",
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !disabled && value.trim().length > 0) {
        e.preventDefault();
        onSubmit();
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="my-6 w-full"
      >
        <label htmlFor="admin-password-field" className="sr-only">
          Admin Password
        </label>

        <div className="relative flex items-center">
          {/* Left Lock Icon */}
          <div className="pointer-events-none absolute left-4 flex items-center justify-center text-zinc-400">
            <Lock className="h-4 w-4 transition-colors duration-300 group-focus-within:text-blue-400" />
          </div>

          {/* Input Field */}
          <input
            id="admin-password-field"
            ref={ref}
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            autoFocus
            autoComplete="off"
            spellCheck="false"
            placeholder={placeholder}
            aria-label="Admin Password"
            aria-invalid={isError}
            className={cn(
              "w-full rounded-2xl py-3.5 pl-11 pr-12 text-sm font-medium text-white placeholder-zinc-500 outline-none transition-all duration-300",
              "bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-inner",
              isError
                ? "border-red-500/50 bg-red-500/5 focus:border-red-400 focus:ring-4 focus:ring-red-500/20"
                : "focus:border-blue-400/70 focus:bg-white/[0.07] focus:ring-4 focus:ring-blue-500/20 hover:border-white/20",
              disabled && "cursor-not-allowed opacity-50"
            )}
          />

          {/* Right Show / Hide Toggle Button */}
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3.5 flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 transition-colors duration-200 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:opacity-50"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </motion.div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
