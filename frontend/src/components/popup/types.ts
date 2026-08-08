import type { ReactNode } from "react";

export type PopupVariant = "default" | "success" | "error" | "warning" | "info" | "confirmation";

export type PopupSize = "sm" | "md" | "lg" | "xl";

export interface PopupProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  icon?: ReactNode;
  size?: PopupSize;
  variant?: PopupVariant;
  dismissOnBackdrop?: boolean;
  dismissOnEsc?: boolean;
  showCloseButton?: boolean;
  persistent?: boolean;
  showBranding?: boolean;
  children?: ReactNode;
}

export interface PopupHeaderProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  variant?: PopupVariant;
  showCloseButton?: boolean;
  onClose?: () => void;
}

export interface PopupBodyProps {
  children: ReactNode;
  className?: string;
}

export interface PopupFooterProps {
  children: ReactNode;
  className?: string;
}

export const POPUP_SIZE_MAP: Record<PopupSize, string> = {
  sm: "w-[440px]",
  md: "w-[480px]",
  lg: "w-[540px]",
  xl: "w-[600px]",
};

export const VARIANT_ICON_COLORS: Record<PopupVariant, string> = {
  default: "text-white/70",
  success: "text-[#22c55e]",
  error: "text-[#ef4444]",
  warning: "text-[#e7c873]",
  info: "text-[#3b82f6]",
  confirmation: "text-[#e7c873]",
};

export const VARIANT_ACCENT_BORDERS: Record<PopupVariant, string> = {
  default: "",
  success:
    "border-emerald-500/10 shadow-[0_0_60px_-20px_rgba(34,197,94,0.15)]",
  error:
    "border-red-500/10 shadow-[0_0_60px_-20px_rgba(239,68,68,0.15)]",
  warning:
    "border-amber-400/10 shadow-[0_0_60px_-20px_rgba(231,200,115,0.12)]",
  info: "border-blue-400/10 shadow-[0_0_60px_-20px_rgba(59,130,246,0.12)]",
  confirmation:
    "border-champagne-400/10 shadow-[0_0_60px_-20px_rgba(231,200,115,0.12)]",
};

