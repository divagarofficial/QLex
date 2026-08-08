"use client";

import { CheckSquare, Square, Download, Printer, CheckCircle2, Layers } from "lucide-react";

interface BulkActionsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  isAllSelected: boolean;
}

export default function BulkActions({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  isAllSelected,
}: BulkActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={isAllSelected ? onClearSelection : onSelectAll}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
        >
          {isAllSelected ? (
            <CheckSquare className="h-4 w-4 text-amber-400" />
          ) : (
            <Square className="h-4 w-4 text-zinc-400" />
          )}
          <span>{isAllSelected ? "Deselect All" : "Select All"}</span>
        </button>

        <span className="text-xs text-zinc-400 font-medium">
          {selectedCount > 0 ? (
            <span className="text-amber-300 font-bold">{selectedCount} orders selected</span>
          ) : (
            <span>Bulk Actions UI Ready ({totalCount} total)</span>
          )}
        </span>
      </div>

      <div className="flex items-center gap-2 opacity-75">
        <button
          type="button"
          disabled
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-400 cursor-not-allowed"
          title="Future Ready: Bulk Download"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Bulk Download</span>
        </button>

        <button
          type="button"
          disabled
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-400 cursor-not-allowed"
          title="Future Ready: Bulk Print"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>Bulk Print</span>
        </button>

        <button
          type="button"
          disabled
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-400 cursor-not-allowed"
          title="Future Ready: Bulk Complete"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Bulk Complete</span>
        </button>

        <span className="hidden sm:inline-block rounded-md bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
          Future Ready
        </span>
      </div>
    </div>
  );
}
