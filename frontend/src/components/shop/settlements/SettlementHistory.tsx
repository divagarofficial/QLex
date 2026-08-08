"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ArrowUpDown, History, Layers } from "lucide-react";
import SettlementCard from "./SettlementCard";
import EmptyState from "./EmptyState";
import type { SettlementItem } from "@/types/shop";

interface SettlementHistoryProps {
  settlements: SettlementItem[];
  onDownloadStatement?: (settlement: SettlementItem) => void;
}

type FilterStatus = "ALL" | "COMPLETED" | "PENDING" | "PROCESSING" | "FAILED";
type SortOption = "NEWEST" | "OLDEST" | "HIGHEST" | "LOWEST";

export default function SettlementHistory({
  settlements,
  onDownloadStatement,
}: SettlementHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [sortOption, setSortOption] = useState<SortOption>("NEWEST");

  // Filtering & Sorting memoization
  const filteredSettlements = useMemo(() => {
    return settlements
      .filter((item) => {
        // Status filter
        const itemStatus = (item.status || "").toUpperCase();
        if (statusFilter === "COMPLETED" && !(itemStatus === "COMPLETED" || itemStatus === "PAID")) {
          return false;
        }
        if (statusFilter === "PENDING" && itemStatus !== "PENDING") {
          return false;
        }
        if (statusFilter === "PROCESSING" && itemStatus !== "PROCESSING") {
          return false;
        }
        if (statusFilter === "FAILED" && itemStatus !== "FAILED") {
          return false;
        }

        // Search query filter (Settlement ID or Reference Number)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchId = (item.id || "").toLowerCase().includes(q);
          const matchRef = (item.upi_reference || "").toLowerCase().includes(q);
          const matchDate = (item.settlement_date || "").toLowerCase().includes(q);
          return matchId || matchRef || matchDate;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === "NEWEST") {
          return (
            new Date(b.settlement_date || b.generated_at).getTime() -
            new Date(a.settlement_date || a.generated_at).getTime()
          );
        }
        if (sortOption === "OLDEST") {
          return (
            new Date(a.settlement_date || a.generated_at).getTime() -
            new Date(b.settlement_date || b.generated_at).getTime()
          );
        }
        if (sortOption === "HIGHEST") {
          return (b.amount || 0) - (a.amount || 0);
        }
        if (sortOption === "LOWEST") {
          return (a.amount || 0) - (b.amount || 0);
        }
        return 0;
      });
  }, [settlements, searchQuery, statusFilter, sortOption]);

  const filterTabs: { label: string; value: FilterStatus }[] = [
    { label: "All Settlements", value: "ALL" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Pending", value: "PENDING" },
    { label: "Processing", value: "PROCESSING" },
    { label: "Failed", value: "FAILED" },
  ];

  return (
    <div className="space-y-6">
      {/* Search & Sticky Filter Bar */}
      <div className="sticky top-4 z-30 p-4 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Settlement ID or Reference Number..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-amber-500/50 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Selection */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-transparent text-white focus:outline-none cursor-pointer pr-1"
              >
                <option value="NEWEST" className="bg-slate-900 text-white">Newest First</option>
                <option value="OLDEST" className="bg-slate-900 text-white">Oldest First</option>
                <option value="HIGHEST" className="bg-slate-900 text-white">Highest Amount</option>
                <option value="LOWEST" className="bg-slate-900 text-white">Lowest Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filterTabs.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                  isActive
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Settlement Cards List */}
      <div className="space-y-4">
        {filteredSettlements.length === 0 ? (
          <EmptyState
            title="No settlements found"
            message={
              searchQuery || statusFilter !== "ALL"
                ? "No settlement records match your current search or filter criteria."
                : "Completed print orders will appear here after settlement."
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredSettlements.map((settlement) => (
                <SettlementCard
                  key={settlement.id}
                  settlement={settlement}
                  onDownloadStatement={onDownloadStatement}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
