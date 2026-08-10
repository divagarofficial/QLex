"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Download, Calendar, Filter, CheckCircle2 } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState("settlements");
  const [dateRange, setDateRange] = useState("7d");
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setSuccessMsg(`Generated and downloaded ${reportType.toUpperCase()} report (${dateRange}).`);
      setTimeout(() => setSuccessMsg(""), 4000);
    }, 1200);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-obsidian text-white selection:bg-amber-500/30">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 space-y-6 pb-16">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="group flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 transition-all hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white/95">
                Financial & System Reports
              </h1>
              <p className="text-xs text-white/40">
                Export shop settlements, transaction audits, and order histories.
              </p>
            </div>
          </div>

          {/* Generator Form */}
          <div className="deep-glass p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full rounded-2xl bg-white/5 border border-white/10 p-3 text-xs text-white focus:outline-none"
                >
                  <option value="settlements" className="bg-slate-900">Shop Daily Settlements Audit</option>
                  <option value="orders" className="bg-slate-900">Platform Print Order Register</option>
                  <option value="revenue" className="bg-slate-900">Platform Fee Revenue Summary</option>
                  <option value="students" className="bg-slate-900">Student Activity & Usage Report</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70">Time Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full rounded-2xl bg-white/5 border border-white/10 p-3 text-xs text-white focus:outline-none"
                >
                  <option value="today" className="bg-slate-900">Today (Last 24 Hours)</option>
                  <option value="7d" className="bg-slate-900">Last 7 Days</option>
                  <option value="30d" className="bg-slate-900">Last 30 Days</option>
                  <option value="mtd" className="bg-slate-900">Month to Date</option>
                </select>
              </div>
            </div>

            {successMsg && (
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-semibold text-emerald-400">
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-6 py-3.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              <Download size={16} />
              <span>{isGenerating ? "Generating Report..." : "Generate & Export CSV"}</span>
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
