"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, FileText, ExternalLink, ChevronLeft, ChevronRight, Store, Calendar } from "lucide-react";
import SearchBar from "./SearchBar";
import FilterBar, { FilterStatus, SortOption } from "./FilterBar";
import PaymentStatusChip from "./PaymentStatusChip";
import type { PaymentItem } from "@/types/student";

interface TransactionHistoryProps {
  transactions: PaymentItem[];
  onOpenReceipt: (item: PaymentItem) => void;
}

const ITEMS_PER_PAGE = 6;

export default function TransactionHistory({
  transactions,
  onOpenReceipt,
}: TransactionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [sortOption, setSortOption] = useState<SortOption>("NEWEST");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & Search & Sort memoized
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Status filter
        if (statusFilter !== "ALL") {
          const s = tx.status.toLowerCase();
          if (statusFilter === "SUCCESSFUL" && s !== "paid" && s !== "successful") return false;
          if (statusFilter === "PENDING" && s !== "pending") return false;
          if (statusFilter === "FAILED" && s !== "failed") return false;
          if (statusFilter === "REFUNDED" && s !== "refunded") return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchToken = tx.token?.toLowerCase().includes(q);
          const matchId = tx.payment_id.toLowerCase().includes(q);
          const matchOrder = tx.order_id.toLowerCase().includes(q);
          const matchShop = "qlex central print hub".includes(q);
          if (!matchToken && !matchId && !matchOrder && !matchShop) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === "NEWEST") {
          const dateA = a.paid_at || (a as any).created_at;
          const dateB = b.paid_at || (b as any).created_at;
          const timeA = dateA ? new Date(dateA).getTime() : 0;
          const timeB = dateB ? new Date(dateB).getTime() : 0;
          return timeB - timeA;
        }
        if (sortOption === "OLDEST") {
          const dateA = a.paid_at || (a as any).created_at;
          const dateB = b.paid_at || (b as any).created_at;
          const timeA = dateA ? new Date(dateA).getTime() : 0;
          const timeB = dateB ? new Date(dateB).getTime() : 0;
          return timeA - timeB;
        }
        if (sortOption === "HIGHEST") {
          return Number(b.amount) - Number(a.amount);
        }
        if (sortOption === "LOWEST") {
          return Number(a.amount) - Number(b.amount);
        }
        return 0;
      });
  }, [transactions, statusFilter, searchQuery, sortOption]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="deep-glass relative overflow-hidden p-6 rounded-3xl border border-white/10 space-y-6">
      <div className="deep-glass-reflection" />
      <div className="relative z-10 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white/90">Payment History</h2>
            <p className="text-xs text-white/40">
              Complete archive of print transactions & receipts
            </p>
          </div>
          <span className="text-xs text-white/50 bg-white/5 border border-white/10 px-3 py-1 rounded-full self-start sm:self-auto">
            {filteredTransactions.length} {filteredTransactions.length === 1 ? "Record" : "Records"}
          </span>
        </div>

        {/* Search & Filter Controls */}
        <div className="space-y-3">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <FilterBar
            statusFilter={statusFilter}
            onStatusChange={(st) => {
              setStatusFilter(st);
              setCurrentPage(1);
            }}
            sortOption={sortOption}
            onSortChange={(so) => {
              setSortOption(so);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="text-sm font-medium text-white/60">No payment records found</div>
            <p className="text-xs text-white/40 max-w-xs mx-auto">
              Try adjusting your search criteria or status filters.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {paginatedItems.map((tx) => {
                const formattedDate = tx.paid_at
                  ? new Date(tx.paid_at).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A";

                return (
                  <motion.div
                    key={tx.payment_id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white/[0.02] border border-white/10 p-4 transition-all hover:bg-white/[0.04] hover:border-white/20"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-amber-400">
                        <CreditCard size={18} />
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-white/90">
                            {tx.token ? `Token #${tx.token}` : `Order #${tx.order_id.slice(0, 8)}`}
                          </span>
                          <PaymentStatusChip status={tx.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-white/40">
                          <span className="font-mono text-[11px]">ID: {tx.payment_id.slice(0, 8)}...</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar size={11} /> {formattedDate}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Store size={11} /> QLex Central
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-white/5 sm:border-t-0 pt-2 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <div className="font-mono text-base font-bold text-white/90">
                          ₹{Number(tx.amount).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-white/40">Razorpay / UPI</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {tx.status.toLowerCase() === "paid" && (
                          <button
                            onClick={() => onOpenReceipt(tx)}
                            className="flex h-8 items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-2.5 text-xs font-medium text-amber-300 transition-all hover:bg-white/10 hover:border-amber-400/30"
                            title="View Receipt"
                          >
                            <FileText size={13} />
                            <span className="hidden sm:inline">Receipt</span>
                          </button>
                        )}

                        <Link
                          href={`/student/payments/${tx.payment_id}`}
                          className="flex h-8 items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-2.5 text-xs font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
                          title="View Details"
                        >
                          <span className="hidden sm:inline">Details</span>
                          <ExternalLink size={13} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-xs text-white/40">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/70 transition-all hover:bg-white/10 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/70 transition-all hover:bg-white/10 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
