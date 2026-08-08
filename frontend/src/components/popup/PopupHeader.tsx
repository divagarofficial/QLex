"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PopupHeaderProps, PopupVariant } from "./types";
import { VARIANT_ICON_COLORS } from "./types";

// ── Variant-specific icon badge glow classes ──────────────────────
const VARIANT_BADGE_GLOW: Record<PopupVariant, string> = {
  default: "",
  success: "popup-icon-badge-success",
  error: "popup-icon-badge-error",
  warning: "popup-icon-badge-warning",
  info: "popup-icon-badge-info",
  confirmation: "popup-icon-badge-confirmation",
};

export default function PopupHeader({
  title,
  description,
  icon,
  variant = "default",
  showCloseButton = true,
  onClose,
}: PopupHeaderProps) {
  return (
    <div className="relative flex flex-col items-center px-2 pt-6 pb-0 text-center">
      {/* Close button — absolute top-right */}
      {showCloseButton && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="popup-close-btn absolute top-0 right-0"
          aria-label="Close dialog"
        >
          <X size={15} />
        </button>
      )}

      {/* Icon — centered premium glass badge with entrance animation + variant glow */}
      {icon && (
        <div
          className={cn(
            "popup-icon-badge popup-icon-entrance",
            VARIANT_ICON_COLORS[variant as PopupVariant],
            VARIANT_BADGE_GLOW[variant as PopupVariant]
          )}
        >
          {icon}
        </div>
      )}

      {/* Title */}
      {title && (
        <h2
          className={cn(
            "text-white font-bold tracking-tight",
            icon ? "mt-6" : "mt-0",
            "text-[30px] leading-tight"
          )}
        >
          {title}
        </h2>
      )}

      {/* Description */}
      {description && (
        <p
          className={cn(
            "text-white/65 leading-relaxed max-w-[360px] mx-auto",
            title ? "mt-3" : icon ? "mt-6" : "mt-0",
            "text-[16px]"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

