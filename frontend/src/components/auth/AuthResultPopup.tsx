"use client";

import { Check, X } from "lucide-react";
import Popup from "@/components/popup/Popup";

interface AuthResultPopupProps {
  open: boolean;
  type: "success" | "error";
  title: string;
  message: string;
  buttonText: string;
  onClose: () => void;
  onAction: () => void;
}

const variantIcons: Record<"success" | "error", React.ReactNode> = {
  success: <Check size={28} strokeWidth={2.5} />,
  error: <X size={28} strokeWidth={2.5} />,
};

export default function AuthResultPopup({
  open,
  type,
  title,
  message,
  buttonText,
  onClose,
  onAction,
}: AuthResultPopupProps) {
  return (
    <Popup
      open={open}
      onClose={onClose}
      title={title}
      description={message}
      icon={variantIcons[type]}
      variant={type}
      size="sm"
      showCloseButton={false}
      dismissOnBackdrop={false}
      dismissOnEsc={false}
      showBranding
    >
      <div className="flex flex-col gap-4 px-0 pt-6 pb-0">
        <button
          type="button"
          onClick={onAction}
          className={
            type === "success"
              ? "popup-btn-primary"
              : "popup-btn-danger"
          }
        >
          <span className="relative z-10">{buttonText}</span>
        </button>
      </div>
    </Popup>
  );
}

