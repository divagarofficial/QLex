"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import SettlementsHeader from "./SettlementsHeader";
import SettlementOverview from "./SettlementOverview";
import SettlementAnalytics from "./SettlementAnalytics";
import SearchBar from "./SearchBar";
import FilterBar from "./FilterBar";
import SettlementGrid from "./SettlementGrid";
import SettlementDetailModal from "./SettlementDetailModal";
import CompleteSettlementModal from "./CompleteSettlementModal";
import Pagination from "./Pagination";
import SkeletonLoader from "./SkeletonLoader";
import EmptyState from "./EmptyState";
import Popup from "@/components/popup/Popup";
import AdminProtectedRoute from "../AdminProtectedRoute";

import {
  getAdminSettlements,
  generateTodaySettlement,
  completeSettlement,
  SettlementItem,
} from "@/services/adminSettlements";
import { getAdminShops, AdminShopItem } from "@/services/adminDashboard";

function AdminSettlementsPageContent() {
  const [settlements, setSettlements] = useState<SettlementItem[]>([]);
  const [shops, setShops] = useState<AdminShopItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Search & Filters State
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [shopFilter, setShopFilter] = useState<string>("all");
  const [cycleFilter, setCycleFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  // Modals & Popup State
  const [detailModalSettlement, setDetailModalSettlement] = useState<SettlementItem | null>(null);
  const [payoutModalSettlement, setPayoutModalSettlement] = useState<SettlementItem | null>(null);

  const [popupState, setPopupState] = useState<{
    open: boolean;
    variant: "info" | "success" | "warning" | "error" | "confirmation";
    title: string;
    description: string;
    confirmText?: string;
    onConfirm?: () => void;
  }>({
    open: false,
    variant: "info",
    title: "",
    description: "",
  });

  // Fetch Data Function
  const fetchData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      const [settlementsData, shopsData] = await Promise.all([
        getAdminSettlements(),
        getAdminShops().catch(() => []),
      ]);

      setSettlements(settlementsData);
      setShops(shopsData);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Failed to fetch settlements:", err);
      setPopupState({
        open: true,
        variant: "error",
        title: "Failed to Load Settlements",
        description: err?.message || "Could not retrieve settlement records from the QLex backend.",
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Generate Today's Settlement
  const handleGenerateToday = async () => {
    setIsGenerating(true);
    try {
      const newSettlement = await generateTodaySettlement();
      await fetchData();
      setPopupState({
        open: true,
        variant: "success",
        title: "Settlement Generated",
        description: `Successfully generated settlement SET-${newSettlement.id.slice(0, 8).toUpperCase()} for ₹${newSettlement.amount.toFixed(2)}.`,
      });
    } catch (err: any) {
      setPopupState({
        open: true,
        variant: "error",
        title: "Generation Failed",
        description: err?.message || "No paid orders available to generate today's settlement, or process failed.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Complete Settlement Action
  const handleCompletePayout = async (settlementId: string, upiReference: string, notes?: string) => {
    try {
      const updated = await completeSettlement(settlementId, { upi_reference: upiReference, notes });
      setSettlements((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
      setPopupState({
        open: true,
        variant: "success",
        title: "Payout Completed",
        description: `Settlement SET-${updated.id.slice(0, 8).toUpperCase()} payout of ₹${updated.amount.toFixed(2)} recorded with UPI reference ${upiReference}.`,
      });
      fetchData();
    } catch (err: any) {
      setPopupState({
        open: true,
        variant: "error",
        title: "Payout Completion Failed",
        description: err?.message || "Could not complete settlement payout.",
      });
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setShopFilter("all");
    setCycleFilter("all");
    setDateRangeFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  // Filter & Search & Sort Memoization
  const filteredSettlements = useMemo(() => {
    let list = [...settlements];

    // Search term
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          (s.shop_name && s.shop_name.toLowerCase().includes(q)) ||
          (s.upi_reference && s.upi_reference.toLowerCase().includes(q)) ||
          (s.bank_name && s.bank_name.toLowerCase().includes(q)) ||
          (s.account_number && s.account_number.toLowerCase().includes(q))
      );
    }

    // Status Filter
    if (statusFilter !== "all") {
      list = list.filter((s) => s.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Shop Filter
    if (shopFilter !== "all") {
      list = list.filter((s) => (s.shop_id || "RIT_PRINT_SHOP") === shopFilter);
    }

    // Cycle Filter
    if (cycleFilter !== "all") {
      list = list.filter(
        (s) => (s.settlement_cycle || "Daily").toLowerCase() === cycleFilter.toLowerCase()
      );
    }

    // Date Range Filter
    if (dateRangeFilter !== "all") {
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];

      if (dateRangeFilter === "today") {
        list = list.filter((s) => s.settlement_date === todayStr);
      } else if (dateRangeFilter === "yesterday") {
        const yest = new Date(now.setDate(now.getDate() - 1)).toISOString().split("T")[0];
        list = list.filter((s) => s.settlement_date === yest);
      } else if (dateRangeFilter === "last7") {
        const d7 = new Date();
        d7.setDate(d7.getDate() - 7);
        list = list.filter((s) => new Date(s.settlement_date) >= d7);
      } else if (dateRangeFilter === "last30") {
        const d30 = new Date();
        d30.setDate(d30.getDate() - 30);
        list = list.filter((s) => new Date(s.settlement_date) >= d30);
      }
    }

    // Sorting
    if (sortBy === "oldest") {
      list.sort((a, b) => new Date(a.generated_at).getTime() - new Date(b.generated_at).getTime());
    } else if (sortBy === "highest") {
      list.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === "lowest") {
      list.sort((a, b) => a.amount - b.amount);
    } else {
      // newest
      list.sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime());
    }

    return list;
  }, [settlements, search, statusFilter, shopFilter, cycleFilter, dateRangeFilter, sortBy]);

  // Pagination Slice
  const totalItems = filteredSettlements.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedSettlements = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSettlements.slice(start, start + pageSize);
  }, [filteredSettlements, currentPage, pageSize]);

  const isSearchOrFilterActive = Boolean(
    search ||
      statusFilter !== "all" ||
      shopFilter !== "all" ||
      cycleFilter !== "all" ||
      dateRangeFilter !== "all" ||
      sortBy !== "newest"
  );

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-[1500px] mx-auto space-y-6">
        {/* Header */}
        <SettlementsHeader
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          isGenerating={isGenerating}
          onRefresh={() => fetchData(true)}
          onGenerate={handleGenerateToday}
        />

        {loading ? (
          <SkeletonLoader />
        ) : (
          <>
            {/* Platform Overview Summary Cards */}
            <SettlementOverview settlements={settlements} loading={loading} />

            {/* Settlement Analytics Metrics Bar */}
            <SettlementAnalytics settlements={settlements} />

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-lg">
              <SearchBar
                value={search}
                onChange={(val) => {
                  setSearch(val);
                  setCurrentPage(1);
                }}
              />
              <FilterBar
                status={statusFilter}
                shop={shopFilter}
                cycle={cycleFilter}
                dateRange={dateRangeFilter}
                sortBy={sortBy}
                shopsList={shops.map((s) => ({ shop_id: s.shop_id, name: s.name }))}
                onStatusChange={(val) => {
                  setStatusFilter(val);
                  setCurrentPage(1);
                }}
                onShopChange={(val) => {
                  setShopFilter(val);
                  setCurrentPage(1);
                }}
                onCycleChange={(val) => {
                  setCycleFilter(val);
                  setCurrentPage(1);
                }}
                onDateRangeChange={(val) => {
                  setDateRangeFilter(val);
                  setCurrentPage(1);
                }}
                onSortByChange={(val) => {
                  setSortBy(val);
                  setCurrentPage(1);
                }}
                onReset={handleResetFilters}
              />
            </div>

            {/* Settlement Grid or Empty State */}
            {paginatedSettlements.length > 0 ? (
              <>
                <SettlementGrid
                  settlements={paginatedSettlements}
                  onViewDetails={setDetailModalSettlement}
                  onProcessPayout={setPayoutModalSettlement}
                />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                />
              </>
            ) : (
              <EmptyState
                isSearchOrFilter={isSearchOrFilterActive}
                onReset={handleResetFilters}
              />
            )}
          </>
        )}
      </div>

      {/* Settlement Detail Modal */}
      <SettlementDetailModal
        settlement={detailModalSettlement}
        onClose={() => setDetailModalSettlement(null)}
        onProcessPayout={setPayoutModalSettlement}
      />

      {/* Complete Settlement Payout Modal */}
      <CompleteSettlementModal
        settlement={payoutModalSettlement}
        onClose={() => setPayoutModalSettlement(null)}
        onConfirm={handleCompletePayout}
      />

      {/* Reusable Popup Modal for Notifications & Errors */}
      <Popup
        open={popupState.open}
        variant={popupState.variant}
        title={popupState.title}
        description={popupState.description}
        onClose={() => setPopupState((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}

export default function AdminSettlementsPage() {
  return (
    <AdminProtectedRoute>
      <AdminSettlementsPageContent />
    </AdminProtectedRoute>
  );
}


