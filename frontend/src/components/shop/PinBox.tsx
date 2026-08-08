"use client";

import { forwardRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PinBoxProps {
  index: number;
  value: string;
  focused: boolean;
  isError?: boolean;
  isSuccess?: boolean;
  disabled?: boolean;
  onFocus: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
}

/**
 * Individual Glass PIN Digit Box Component
 * Displays typed character briefly before masking to bullet dot `●` for Apple Passcode feel.
 */
const PinBox = forwardRef<HTMLInputElement, PinBoxProps>(
  (
    {
      index,
      value,
      focused,
      isError = false,
      isSuccess = false,
      disabled = false,
      onFocus,
      onChange,
      onKeyDown,
      onPaste,
    },
    ref
  ) => {
    const [masked, setMasked] = useState(false);

    // Digit masking timer (show character for 450ms then convert to bullet dot)
    useEffect(() => {
      if (!value) {
        setMasked(false);
        return;
      }

      setMasked(false);
      const timer = setTimeout(() => {
        setMasked(true);
      }, 450);

      return () => clearTimeout(timer);
    }, [value]);

    return (
      <div
        className={cn(
          "relative flex h-16 w-14 items-center justify-center rounded-2xl border transition-all duration-300 sm:h-20 sm:w-16 md:h-20 md:w-18",
          // Glass surface background
          "bg-white/[0.04] backdrop-blur-xl shadow-lg",
          // Normal state vs Focus state vs Error vs Success
          isSuccess
            ? "border-emerald-400/80 bg-emerald-500/10 shadow-[0_0_25px_rgba(52,211,153,0.3)] scale-105"
            : isError
            ? "border-red-500/80 bg-red-500/10 shadow-[0_0_25px_rgba(239,68,68,0.3)]"
            : focused
            ? "border-amber-400/80 bg-white/[0.08] shadow-[0_0_25px_rgba(231,200,115,0.25)] scale-105"
            : value
            ? "border-white/30 bg-white/[0.06]"
            : "border-white/10 hover:border-white/20",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {/* Subtle top rim light */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Input Element */}
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value}
          disabled={disabled}
          onFocus={onFocus}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          aria-label={`Digit ${index + 1} of 4`}
          aria-required="true"
          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
        />

        {/* Displayed Digit / Bullet Mask */}
        <div className="pointer-events-none relative z-10 flex items-center justify-center font-mono select-none">
          {value ? (
            masked ? (
              <span
                className={cn(
                  "text-2xl transition-transform duration-200 sm:text-3xl",
                  isSuccess
                    ? "text-emerald-400"
                    : isError
                    ? "text-red-400"
                    : "text-amber-300"
                )}
              >
                ●
              </span>
            ) : (
              <span
                className={cn(
                  "text-2xl font-bold transition-all duration-150 sm:text-3xl",
                  isSuccess
                    ? "text-emerald-300"
                    : isError
                    ? "text-red-300"
                    : "text-white"
                )}
              >
                {value}
              </span>
            )
          ) : (
            // Placeholder dot / cursor indicator when focused
            <span
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-300",
                focused
                  ? "bg-amber-400/80 animate-pulse scale-125"
                  : "bg-white/10"
              )}
            />
          )}
        </div>
      </div>
    );
  }
);

PinBox.displayName = "PinBox";

export default PinBox;
