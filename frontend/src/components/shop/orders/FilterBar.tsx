"use client";

import { SlidersHorizontal, RotateCcw } from "lucide-react";

export type StatusFilter =
  | "ALL"
  | "PENDING"
  | "ACCEPTED"
  | "PRINTING"
  | "READY"
  | "COMPLETED"
  | "REJECTED";

export type PriorityFilter = "ALL" | "PRIORITY" | "REGULAR";

export type PaymentFilter = "ALL" | "PAID" | "PENDING";

export type SortOption = "NEWEST" | "OLDEST" | "PRIORITY_FIRST" | "TOKEN_ORDER";

interface FilterBarProps {
  statusFilter: StatusFilter;
  onStatusChange: (val: StatusFilter) => void;
  priorityFilter: PriorityFilter;
  onPriorityChange: (val: PriorityFilter) => void;
  paymentFilter: PaymentFilter;
  onPaymentChange: (val: PaymentFilter) => void;
  sortOption: SortOption;
  onSortChange: (val: SortOption) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export default function FilterBar({
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  paymentFilter,
  onPaymentChange,
  sortOption,
  onSortChange,
  onResetFilters,
  hasActiveFilters,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md">
      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 pr-2 border-r border-white/10">
        <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
        <span>Filter</span>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-1">
        <span className="text-[11px] font-semibold text-zinc-400">Status:</span>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
          className="rounded-xl border border-white/10 bg-zinc-900/80 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur-md focus:border-amber-400/40 focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending / Waiting</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="PRINTING">Printing</option>
          <option value="READY">Ready for Pickup</option>
          <option value="COMPLETED">Completed</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Priority Filter */}
      <div className="flex items-center gap-1">
        <span className="text-[11px] font-semibold text-zinc-400">Priority:</span>
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value as PriorityFilter)}
          className="rounded-xl border border-white/10 bg-zinc-900/80 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur-md focus:border-amber-400/40 focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Queues</option>
          <option value="PRIORITY">Priority Only</option>
          <option value="REGULAR">Regular Only</option>
        </select>
      </div>

      {/* Payment Filter */}
      <div className="flex items-center gap-1">
        <span className="text-[11px] font-semibold text-zinc-400">Payment:</span>
        <select
          value={paymentFilter}
          onChange={(e) => onPaymentChange(e.target.value as PaymentFilter)}
          className="rounded-xl border border-white/10 bg-zinc-900/80 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur-md focus:border-amber-400/40 focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Payments</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      {/* Sort Option */}
      <div className="flex items-center gap-1 ml-auto">
        <span className="text-[11px] font-semibold text-zinc-400">Sort:</span>
        <select
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="rounded-xl border border-white/10 bg-zinc-900/80 px-2.5 py-1.5 text-xs font-medium text-amber-300 shadow-sm backdrop-blur-md focus:border-amber-400/40 focus:outline-none cursor-pointer"
        >
          <option value="PRIORITY_FIRST">Priority First</option>
          <option value="TOKEN_ORDER">Token Order (FCFS)</option>
          <option value="NEWEST">Newest First</option>
          <option value="OLDEST">Oldest First</option>
        </select>
      </div>

      {/* Reset Filters button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}
