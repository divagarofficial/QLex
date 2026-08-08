"use client";

import { Search, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";

export type FilterCategory =
  | "all"
  | "pending"
  | "queued_printing"
  | "ready"
  | "completed"
  | "cancelled"
  | "payment_pending"
  | "payment_completed";

export type SortOption = "newest" | "oldest" | "amount_high" | "amount_low" | "status";

interface OrderSearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: FilterCategory;
  onFilterChange: (filter: FilterCategory) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalResults: number;
}

const FILTER_OPTIONS: { id: FilterCategory; label: string; countBadge?: string }[] = [
  { id: "all", label: "All Orders" },
  { id: "pending", label: "Pending" },
  { id: "queued_printing", label: "Printing" },
  { id: "ready", label: "Ready for Pickup" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled / Expired" },
  { id: "payment_pending", label: "Payment Pending" },
  { id: "payment_completed", label: "Payment Paid" },
];

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "newest", label: "Newest First" },
  { id: "oldest", label: "Oldest First" },
  { id: "amount_high", label: "Amount: High to Low" },
  { id: "amount_low", label: "Amount: Low to High" },
  { id: "status", label: "Status" },
];

export default function OrderSearchFilters({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  totalResults,
}: OrderSearchFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search Input & Sort Selector Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by Order ID or Token number (e.g. P-001)..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-10 text-sm text-white placeholder-white/40 backdrop-blur-md outline-none transition-all duration-200 focus:border-amber-400/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-amber-400/20"
            aria-label="Search orders"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/40 hover:text-white"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sort Selector Dropdown */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-white/50 pl-1">
            <ArrowUpDown size={14} />
            <span className="hidden sm:inline">Sort:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="rounded-xl border border-white/10 bg-[#0d1117] py-2.5 px-3.5 text-xs font-medium text-white/90 outline-none backdrop-blur-md transition hover:border-white/20 focus:border-amber-400/50 cursor-pointer"
            aria-label="Sort orders"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id} className="bg-[#0d1117] text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Chips Horizontal Scroll Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1 text-xs text-white/40 pr-1 shrink-0">
          <SlidersHorizontal size={14} />
          <span className="font-medium">Filters:</span>
        </div>

        {FILTER_OPTIONS.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-amber-400 text-slate-950 font-semibold shadow-md shadow-amber-400/20"
                  : "border border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Results Counter Subheader */}
      <div className="flex items-center justify-between text-xs text-white/40 px-1 pt-1">
        <span>Showing <strong className="text-white/80 font-semibold">{totalResults}</strong> {totalResults === 1 ? "order" : "orders"}</span>
        {(searchQuery || activeFilter !== "all") && (
          <button
            onClick={() => {
              onSearchChange("");
              onFilterChange("all");
            }}
            className="text-amber-400 hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
