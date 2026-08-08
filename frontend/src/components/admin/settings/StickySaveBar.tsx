"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, RotateCcw, AlertCircle, Loader2 } from "lucide-react";

interface StickySaveBarProps {
  isDirty: boolean;
  modifiedCount: number;
  isSaving: boolean;
  onSave: () => void;
  onReset: () => void;
}

export default function StickySaveBar({
  isDirty,
  modifiedCount,
  isSaving,
  onSave,
  onReset,
}: StickySaveBarProps) {
  return (
    <AnimatePresence>
      {isDirty && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-[800px]"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0a0d14]/90 border border-amber-500/30 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(231,200,115,0.15)]">
            {/* Status indicator */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <AlertCircle className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  Unsaved Changes Detected
                </p>
                <p className="text-[11px] text-zinc-400">
                  {modifiedCount} field{modifiedCount === 1 ? "" : "s"} modified. Save to apply changes to the live platform.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onReset}
                disabled={isSaving}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 border border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
