"use client";

import { useState, useEffect, useCallback } from "react";
import StudentsHeader from "./StudentsHeader";
import StudentOverview from "./StudentOverview";
import SearchBar from "./SearchBar";
import FilterBar from "./FilterBar";
import StudentGrid from "./StudentGrid";
import Pagination from "./Pagination";
import SkeletonLoader from "./SkeletonLoader";
import EmptyState from "./EmptyState";
import Popup from "@/components/popup/Popup";
import AdminProtectedRoute from "../AdminProtectedRoute";

import {
  getStudentsOverview,
  getStudentsList,
  toggleStudentStatus,
  StudentOverview as OverviewType,
  StudentItem,
} from "@/services/adminStudents";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

function StudentsPageContent() {
  const [overview, setOverview] = useState<OverviewType | null>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const pageSize = 12;

  // Search & Filter State
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Loading & Sync State
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Popup Modal State
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

  // Target student for status toggle confirmation
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);

  const fetchData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      const [overviewData, listData] = await Promise.all([
        getStudentsOverview(),
        getStudentsList({
          search,
          status: statusFilter,
          order_status: orderStatusFilter,
          sort_by: sortBy,
          page: currentPage,
          page_size: pageSize,
        }),
      ]);

      setOverview(overviewData);
      setStudents(listData.students);
      setTotalStudents(listData.total);
      setTotalPages(listData.total_pages);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Failed to load students data:", err);
      setPopupState({
        open: true,
        variant: "error",
        title: "Connection Error",
        description: err?.message || "Failed to retrieve student records from QLex backend API.",
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [search, statusFilter, orderStatusFilter, sortBy, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Search Input Change
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  // Reset all search and filters
  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setOrderStatusFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  // Status Toggle Confirmation
  const handleToggleClick = (student: StudentItem) => {
    setSelectedStudent(student);
    const action = student.is_active ? "disable" : "enable";
    setPopupState({
      open: true,
      variant: student.is_active ? "warning" : "info",
      title: `${student.is_active ? "Disable" : "Enable"} Student Account`,
      description: `Are you sure you want to ${action} the account for ${student.full_name} (${student.register_number})?`,
      confirmText: `Yes, ${action.toUpperCase()}`,
      onConfirm: () => confirmToggleStatus(student),
    });
  };

  const confirmToggleStatus = async (student: StudentItem) => {
    try {
      const updated = await toggleStudentStatus(student.id, !student.is_active);
      setStudents((prev) =>
        prev.map((s) => (s.id === updated.id ? { ...s, is_active: updated.is_active } : s))
      );
      // Refresh overview counts
      getStudentsOverview().then(setOverview).catch(console.error);

      setPopupState({
        open: true,
        variant: "success",
        title: "Account Updated",
        description: `Student ${updated.full_name} (${updated.register_number}) is now ${
          updated.is_active ? "ACTIVE" : "BLOCKED"
        }.`,
      });
    } catch (err: any) {
      setPopupState({
        open: true,
        variant: "error",
        title: "Update Failed",
        description: err?.message || "Could not update student account status.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Header */}
        <StudentsHeader
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          onRefresh={() => fetchData(true)}
        />

        {/* Loading State */}
        {loading ? (
          <SkeletonLoader />
        ) : (
          <>
            {/* Overview Stats */}
            <StudentOverview overview={overview} loading={loading} />

            {/* Search & Filter Controls */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-lg">
              <SearchBar value={search} onChange={handleSearchChange} />
              <FilterBar
                status={statusFilter}
                orderStatus={orderStatusFilter}
                sortBy={sortBy}
                onStatusChange={(val) => {
                  setStatusFilter(val);
                  setCurrentPage(1);
                }}
                onOrderStatusChange={(val) => {
                  setOrderStatusFilter(val);
                  setCurrentPage(1);
                }}
                onSortByChange={(val) => {
                  setSortBy(val);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Students Grid or Empty State */}
            {students.length > 0 ? (
              <>
                <StudentGrid
                  students={students}
                  onToggleStatusClick={handleToggleClick}
                />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalStudents}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                />
              </>
            ) : (
              <EmptyState
                isSearch={Boolean(search || statusFilter !== "all" || orderStatusFilter !== "all")}
                onReset={handleResetFilters}
              />
            )}
          </>
        )}
      </div>

      {/* Reusable Popup Modal for Actions and Errors */}
      <Popup
        open={popupState.open}
        variant={popupState.variant}
        title={popupState.title}
        description={popupState.description}
        onClose={() => setPopupState((prev) => ({ ...prev, open: false }))}
      >
        {popupState.confirmText && (
          <div className="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              onClick={() => setPopupState((prev) => ({ ...prev, open: false }))}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const fn = popupState.onConfirm;
                setPopupState((prev) => ({ ...prev, open: false }));
                if (fn) fn();
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-lg transition-all"
            >
              {popupState.confirmText}
            </button>
          </div>
        )}
      </Popup>
    </div>
  );
}

export default function StudentsPage() {
  return (
    <AdminProtectedRoute>
      <StudentsPageContent />
    </AdminProtectedRoute>
  );
}



