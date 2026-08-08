"use client";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search by Order #, Token, Transaction ID...",
}: SearchBarProps) {
  return (
    <div className="relative flex-1">
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-white/[0.03] border border-white/10 pl-10 pr-9 py-2.5 text-xs text-white placeholder-white/40 backdrop-blur-md outline-none transition-all focus:border-amber-400/50 focus:bg-white/[0.05]"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
