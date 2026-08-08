"use client";

import { ArrowUpDown } from "lucide-react";

export type FilterStatus = "ALL" | "SUCCESSFUL" | "PENDING" | "FAILED" | "REFUNDED";
export type SortOption = "NEWEST" | "OLDEST" | "HIGHEST" | "LOWEST";

interface FilterBarProps {
  statusFilter: FilterStatus;
  onStatusChange: (status: FilterStatus) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export default function FilterBar({
  statusFilter,
  onStatusChange,
  sortOption,
  onSortChange,
}: FilterBarProps) {
  const statuses: { id: FilterStatus; label: string }[] = [
    { id: "ALL", label: "All" },
    { id: "SUCCESSFUL", label: "Successful" },
    { id: "PENDING", label: "Pending" },
    { id: "FAILED", label: "Failed" },
    { id: "REFUNDED", label: "Refunded" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Status Filter Chips */}
      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
        {statuses.map((s) => {
          const isActive = statusFilter === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onStatusChange(s.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Sort Select */}
      <div className="flex items-center gap-2">
        <ArrowUpDown size={14} className="text-white/40" />
        <select
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="rounded-xl bg-white/[0.03] border border-white/10 px-3 py-1.5 text-xs text-white/80 outline-none backdrop-blur-md cursor-pointer hover:border-amber-400/30"
        >
          <option value="NEWEST" className="bg-slate-900 text-white">Newest First</option>
          <option value="OLDEST" className="bg-slate-900 text-white">Oldest First</option>
          <option value="HIGHEST" className="bg-slate-900 text-white">Highest Amount</option>
          <option value="LOWEST" className="bg-slate-900 text-white">Lowest Amount</option>
        </select>
      </div>
    </div>
  );
}
