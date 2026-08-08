"use client";

import { Filter, RotateCcw } from "lucide-react";

interface FilterBarProps {
  status: string;
  shop: string;
  cycle: string;
  dateRange: string;
  sortBy: string;
  shopsList?: Array<{ shop_id: string; name: string }>;
  onStatusChange: (val: string) => void;
  onShopChange: (val: string) => void;
  onCycleChange: (val: string) => void;
  onDateRangeChange: (val: string) => void;
  onSortByChange: (val: string) => void;
  onReset: () => void;
}

export default function FilterBar({
  status,
  shop,
  cycle,
  dateRange,
  sortBy,
  shopsList = [],
  onStatusChange,
  onShopChange,
  onCycleChange,
  onDateRangeChange,
  onSortByChange,
  onReset,
}: FilterBarProps) {
  const isFiltered = status !== "all" || shop !== "all" || cycle !== "all" || dateRange !== "all" || sortBy !== "newest";

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <div className="flex items-center gap-1.5 text-slate-400 font-semibold px-2 py-1">
        <Filter className="w-3.5 h-3.5 text-cyan-400" />
        <span>Filters:</span>
      </div>

      {/* Settlement Status */}
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500/80 cursor-pointer transition-all"
      >
        <option value="all">Status: All</option>
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="completed">Completed</option>
        <option value="failed">Failed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      {/* Shop Filter */}
      <select
        value={shop}
        onChange={(e) => onShopChange(e.target.value)}
        className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500/80 cursor-pointer transition-all"
      >
        <option value="all">Shop: All</option>
        {shopsList.map((s) => (
          <option key={s.shop_id} value={s.shop_id}>
            {s.name}
          </option>
        ))}
        {shopsList.length === 0 && <option value="RIT_PRINT_SHOP">QLex Central Print Hub</option>}
      </select>

      {/* Settlement Cycle */}
      <select
        value={cycle}
        onChange={(e) => onCycleChange(e.target.value)}
        className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500/80 cursor-pointer transition-all"
      >
        <option value="all">Cycle: All</option>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="manual">Manual</option>
      </select>

      {/* Date Range */}
      <select
        value={dateRange}
        onChange={(e) => onDateRangeChange(e.target.value)}
        className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500/80 cursor-pointer transition-all"
      >
        <option value="all">Date: All Time</option>
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="last7">Last 7 Days</option>
        <option value="last30">Last 30 Days</option>
      </select>

      {/* Sort By */}
      <select
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value)}
        className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500/80 cursor-pointer transition-all"
      >
        <option value="newest">Sort: Newest First</option>
        <option value="oldest">Sort: Oldest First</option>
        <option value="highest">Sort: Highest Amount</option>
        <option value="lowest">Sort: Lowest Amount</option>
      </select>

      {/* Reset Filters */}
      {isFiltered && (
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-medium"
          title="Reset all filters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}
