"use client";

import { motion } from "framer-motion";
import { Save, RotateCcw, X, Check } from "lucide-react";

interface StickyActionBarProps {
  hasChanges: boolean;
  isValid: boolean;
  isSaving: boolean;
  onSave: () => void;
  onReset: () => void;
  onCancel: () => void;
}

export default function StickyActionBar({
  hasChanges,
  isValid,
  isSaving,
  onSave,
  onReset,
  onCancel,
}: StickyActionBarProps) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      className="fixed bottom-4 left-0 right-0 z-40 px-4 pointer-events-none"
    >
      <div className="max-w-[1000px] mx-auto pointer-events-auto">
        <div className="flex items-center justify-between p-3.5 sm:px-6 rounded-2xl bg-slate-900/90 border border-white/15 backdrop-blur-2xl shadow-2xl shadow-black/80">
          <div className="flex items-center gap-3">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                hasChanges ? "bg-amber-400 animate-ping" : "bg-emerald-400"
              }`}
            />
            <span className="text-xs sm:text-sm font-medium text-slate-200">
              {hasChanges
                ? "You have unsaved pricing changes"
                : "All pricing settings up to date"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReset}
              disabled={!hasChanges || isSaving}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-transparent hover:bg-white/5 disabled:opacity-40 transition-all flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cancel</span>
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={!hasChanges || !isValid || isSaving}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
