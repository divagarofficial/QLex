"use client";

import { Save, RotateCcw, X, AlertCircle } from "lucide-react";

interface StickySaveBarProps {
  hasChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onReset: () => void;
}

export default function StickySaveBar({
  hasChanges,
  isSaving,
  onSave,
  onReset,
}: StickySaveBarProps) {
  if (!hasChanges) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-slide-up">
      <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-900/95 border border-cyan-500/40 shadow-2xl backdrop-blur-xl shadow-cyan-950/30">
        <div className="flex items-center gap-2.5 pl-1">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Unsaved Pricing Changes</span>
            <span className="text-[11px] text-slate-400">Review your edits before saving to platform</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/40 transition-all border border-cyan-400/30 disabled:opacity-50"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? "animate-spin" : ""}`} />
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
