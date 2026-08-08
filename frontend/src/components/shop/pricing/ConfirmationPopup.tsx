"use client";

import Popup from "@/components/popup/Popup";
import PopupBody from "@/components/popup/PopupBody";
import PopupFooter from "@/components/popup/PopupFooter";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface ConfirmationPopupProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSaving: boolean;
}

export default function ConfirmationPopup({
  open,
  onClose,
  onConfirm,
  isSaving,
}: ConfirmationPopupProps) {
  return (
    <Popup
      open={open}
      onClose={onClose}
      title="Confirm Pricing Update"
      description="Review your changes before applying them live to student print orders."
      variant="confirmation"
      size="sm"
      icon={<AlertTriangle className="w-6 h-6 text-amber-400" />}
      dismissOnBackdrop={!isSaving}
      dismissOnEsc={!isSaving}
    >
      <PopupBody>
        <div className="py-2 text-sm text-slate-300 space-y-2">
          <p>
            Are you sure you want to update the shop pricing configuration?
          </p>
          <p className="text-xs text-slate-400 bg-white/5 p-3 rounded-xl border border-white/10">
            This will immediately update print rates for all new student orders created at your store.
          </p>
        </div>
      </PopupBody>

      <PopupFooter>
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 disabled:opacity-40 transition-all"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSaving}
          className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md disabled:opacity-40 transition-all flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Yes, Update Pricing</span>
            </>
          )}
        </button>
      </PopupFooter>
    </Popup>
  );
}
