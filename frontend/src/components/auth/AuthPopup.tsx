"use client";

import Popup from "@/components/popup/Popup";
import AuthCard from "./AuthCard";

interface AuthPopupProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthPopup({ open, onClose }: AuthPopupProps) {
  return (
    <Popup
      open={open}
      onClose={onClose}
      size="md"
      showCloseButton
      dismissOnBackdrop={false}
      dismissOnEsc={false}
    >
      <Popup.Body className="!p-0">
        <AuthCard />
      </Popup.Body>
    </Popup>
  );
}

