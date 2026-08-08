"use client";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  resultCount?: number;
  totalCount?: number;
}

export default function SearchBar({
  value,
  onChange,
  resultCount,
  totalCount,
}: SearchBarProps) {
  return (
    <div className="relative flex-1">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by Order #, Register #, Token (P-1/R-1), or Document Name..."
          className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 left-10 pl-10 pr-10 text-xs text-white placeholder-zinc-500 backdrop-blur-md transition-all focus:border-amber-400/40 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-3 rounded-full p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition-all"
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {value && resultCount !== undefined && totalCount !== undefined && (
        <div className="mt-1.5 text-[11px] text-zinc-400 font-medium px-1">
          Showing <span className="text-amber-300 font-bold">{resultCount}</span> of {totalCount} orders
        </div>
      )}
    </div>
  );
}
