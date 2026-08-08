"use client";

import { Filter, ArrowUpDown } from "lucide-react";

interface FilterBarProps {
  status: string;
  orderStatus: string;
  sortBy: string;
  onStatusChange: (val: string) => void;
  onOrderStatusChange: (val: string) => void;
  onSortByChange: (val: string) => void;
}

export default function FilterBar({
  status,
  orderStatus,
  sortBy,
  onStatusChange,
  onOrderStatusChange,
  onSortByChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Account Status Filter */}
      <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-400 font-medium">Status:</span>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-transparent text-white font-semibold outline-none cursor-pointer border-none focus:ring-0 text-xs"
        >
          <option value="all" className="bg-slate-900 text-white">All Statuses</option>
          <option value="active" className="bg-slate-900 text-emerald-400">Active Only</option>
          <option value="blocked" className="bg-slate-900 text-red-400">Blocked Only</option>
        </select>
      </div>

      {/* Order Status Filter */}
      <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
        <span className="text-slate-400 font-medium">Orders:</span>
        <select
          value={orderStatus}
          onChange={(e) => onOrderStatusChange(e.target.value)}
          className="bg-transparent text-white font-semibold outline-none cursor-pointer border-none focus:ring-0 text-xs"
        >
          <option value="all" className="bg-slate-900 text-white">All Students</option>
          <option value="active" className="bg-slate-900 text-amber-400">Has Active Order</option>
          <option value="none" className="bg-slate-900 text-slate-400">No Active Order</option>
        </select>
      </div>

      {/* Sort By Filter */}
      <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-400 font-medium">Sort:</span>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="bg-transparent text-white font-semibold outline-none cursor-pointer border-none focus:ring-0 text-xs"
        >
          <option value="newest" className="bg-slate-900 text-white">Newest First</option>
          <option value="oldest" className="bg-slate-900 text-white">Oldest First</option>
          <option value="most_orders" className="bg-slate-900 text-cyan-400">Most Orders</option>
          <option value="alphabetical" className="bg-slate-900 text-white">Alphabetical (A-Z)</option>
        </select>
      </div>
    </div>
  );
}
