"use client";

import { useEffect, useRef, useCallback, useState, useId } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePopupContext } from "./PopupContext";
import PopupHeader from "./PopupHeader";
import PopupBody from "./PopupBody";
import PopupFooter from "./PopupFooter";
import type { PopupProps, PopupSize, PopupVariant } from "./types";
import { POPUP_SIZE_MAP } from "./types";

// ── Focus trap helper ──────────────────────────────────────────────
function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableSelector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getFocusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(focusableSelector));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    const focusable = getFocusable();
    if (focusable.length > 0) {
      focusable[0].focus();
    }

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [active, containerRef]);
}

// ── Popup variant accent class map ─────────────────────────────────
const VARIANT_CONTAINER_CLASS: Record<PopupVariant, string> = {
  default: "",
  success: "popup-variant-success",
  error: "popup-variant-error",
  warning: "popup-variant-warning",
  info: "popup-variant-info",
  confirmation: "popup-variant-confirmation",
};

// ── Main Popup component ───────────────────────────────────────────
export default function Popup({
  open,
  onClose,
  title,
  description,
  icon,
  size = "md",
  variant = "default",
  dismissOnBackdrop = true,
  dismissOnEsc = true,
  showCloseButton = true,
  persistent = false,
  showBranding = false,
  children,
}: PopupProps) {
  const popupId = useId();
  const { registerPopup, unregisterPopup } = usePopupContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      registerPopup(popupId);
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else {
      unregisterPopup(popupId);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === "function") {
        previousFocusRef.current.focus();
      }
    }
    return () => unregisterPopup(popupId);
  }, [open, popupId, registerPopup, unregisterPopup]);

  useFocusTrap(containerRef, open);

  useEffect(() => {
    if (!open || !dismissOnEsc || persistent) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, dismissOnEsc, persistent, onClose]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (dismissOnBackdrop && !persistent && e.target === e.currentTarget) {
        onClose();
      }
    },
    [dismissOnBackdrop, persistent, onClose]
  );

  const hasHeader = !!(title || description || icon || showCloseButton);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          key="popup-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="popup-premium-backdrop"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-label={title || "Dialog"}
        >
          <motion.div
            ref={containerRef}
            key="popup-modal"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: {
                duration: 0.32,
                ease: [0.16, 1, 0.3, 1],
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.92,
              y: 15,
              transition: { duration: 0.2, ease: "easeOut" },
            }}
            className={cn(
              "popup-premium-container",
              POPUP_SIZE_MAP[size as PopupSize],
              VARIANT_CONTAINER_CLASS[variant as PopupVariant]
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Light sweep animation on mount */}
            <div className="popup-sweep" />

            {/* Environment reflection overlay */}
            <div className="popup-premium-reflection" />

            {/* Ambient glow under the popup */}
            <div className="popup-premium-glow" />

            {/* QLex Branding */}
            {showBranding && (
              <div className="popup-branding" aria-hidden="true">
                <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="qb" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#E7C873" />
                      <stop offset="50%" stopColor="#F5D98E" />
                      <stop offset="100%" stopColor="#C9A544" />
                    </linearGradient>
                  </defs>
                  <text x="200" y="280" fontFamily="system-ui, sans-serif" fontSize="200" fontWeight="900" fill="url(#qb)" textAnchor="middle" dominantBaseline="central">
                    Q
                  </text>
                </svg>
              </div>
            )}

            {hasHeader && (
              <PopupHeader
                title={title}
                description={description}
                icon={icon}
                variant={variant as PopupVariant}
                showCloseButton={showCloseButton}
                onClose={onClose}
              />
            )}

            <div className="popup-content-stagger">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

Popup.Header = PopupHeader;
Popup.Body = PopupBody;
Popup.Footer = PopupFooter;

