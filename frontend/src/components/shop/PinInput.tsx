"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import PinBox from "./PinBox";

interface PinInputProps {
  pin: string[];
  onChange: (pin: string[]) => void;
  onComplete?: (pin: string) => void;
  isError?: boolean;
  isSuccess?: boolean;
  disabled?: boolean;
}

export default function PinInput({
  pin,
  onChange,
  onComplete,
  isError = false,
  isSuccess = false,
  disabled = false,
}: PinInputProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto focus the first box on initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRefs.current[0] && !disabled) {
        inputRefs.current[0].focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [disabled]);

  const handleChange = (index: number, val: string) => {
    if (disabled) return;

    // Filter to last typed character and ensure numeric
    const char = val.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const newPin = [...pin];
    newPin[index] = char;
    onChange(newPin);

    // Auto-advance to next box if character entered
    if (char && index < 3) {
      const nextIndex = index + 1;
      setFocusedIndex(nextIndex);
      inputRefs.current[nextIndex]?.focus();
    }

    // Check if full 4 digits are completed
    const fullPin = newPin.join("");
    if (fullPin.length === 4 && onComplete) {
      onComplete(fullPin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === "Backspace") {
      e.preventDefault();
      const newPin = [...pin];

      if (newPin[index]) {
        // If current box has value, clear it
        newPin[index] = "";
        onChange(newPin);
      } else if (index > 0) {
        // Move to previous box and clear it
        const prevIndex = index - 1;
        newPin[prevIndex] = "";
        onChange(newPin);
        setFocusedIndex(prevIndex);
        inputRefs.current[prevIndex]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      const prevIndex = index - 1;
      setFocusedIndex(prevIndex);
      inputRefs.current[prevIndex]?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
      e.preventDefault();
      const nextIndex = index + 1;
      setFocusedIndex(nextIndex);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").trim();
    // Match first 4 digits from pasted content
    const digits = pastedText.replace(/\D/g, "").slice(0, 4).split("");

    if (digits.length === 0) return;

    const newPin = ["", "", "", ""];
    digits.forEach((digit, idx) => {
      if (idx < 4) newPin[idx] = digit;
    });

    onChange(newPin);

    // Focus box after last pasted digit
    const nextFocus = Math.min(digits.length, 3);
    setFocusedIndex(nextFocus);
    inputRefs.current[nextFocus]?.focus();

    if (newPin.join("").length === 4 && onComplete) {
      onComplete(newPin.join(""));
    }
  };

  return (
    <motion.div
      animate={
        isError
          ? {
              x: [0, -12, 12, -10, 10, -5, 5, 0],
              transition: { duration: 0.5, ease: "easeInOut" },
            }
          : isSuccess
          ? {
              scale: [1, 1.04, 1],
              y: [0, -4, 0],
              transition: { duration: 0.4, ease: "easeOut" },
            }
          : {}
      }
      className="my-6 flex items-center justify-center gap-3 sm:gap-4"
    >
      {Array.from({ length: 4 }).map((_, idx) => (
        <PinBox
          key={idx}
          index={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          value={pin[idx] || ""}
          focused={focusedIndex === idx}
          isError={isError}
          isSuccess={isSuccess}
          disabled={disabled}
          onFocus={() => setFocusedIndex(idx)}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
        />
      ))}
    </motion.div>
  );
}
