"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, Building2, AlertCircle, MapPin } from "lucide-react";
import Link from "next/link";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { submitStaffOrder } from "@/services/student";
import Popup from "@/components/popup/Popup";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function StaffNewOrderPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const [files, setFiles] = useState<File[]>([]);
  const [copies, setCopies] = useState<number>(1);
  const [printType, setPrintType] = useState<"bw" | "color">("bw");
  const [printSide, setPrintSide] = useState<"single" | "double">("double");
  const [paperSize, setPaperSize] = useState<"a4" | "a3">("a4");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (files.length === 0) {
      setError("Please upload at least one document PDF file.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create draft order
      const draftRes = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_priority: false }),
      });

      if (!draftRes.ok) {
        const errJson = await draftRes.json().catch(() => ({}));
        throw new Error(errJson.detail || "Failed to create draft order.");
      }

      const draftOrder = await draftRes.json();
      const orderId = draftOrder.id;

      // Step 2: Upload documents
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));

      const uploadRes = await fetch(`${API_BASE}/orders/${orderId}/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadRes.ok) {
        const errJson = await uploadRes.json().catch(() => ({}));
        throw new Error(errJson.detail || "Failed to upload document files.");
      }

      const uploadData = await uploadRes.json();
      const uploadedDocs = uploadData.documents || [];

      // Step 3: Update document print configuration
      for (const doc of uploadedDocs) {
        await fetch(`${API_BASE}/orders/${orderId}/documents/${doc.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            copies,
            print_type: printType,
            print_side: printSide,
            paper_size: paperSize,
          }),
        });
      }

      // Step 4: Submit Staff Order directly (zero-cost bypass to Satellite Print Hub)
      const finalResult = await submitStaffOrder(token, orderId);
      setSuccessResult(finalResult);
    } catch (err: any) {
      setError(err.message || "Failed to submit staff order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute redirectPath="/staff/login">
      <div className="min-h-screen relative overflow-hidden bg-[#030406] text-white">
        {/* Environment Lights */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-radial from-emerald-500/12 via-emerald-300/5 to-transparent blur-3xl opacity-60" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6">
          {/* Back button */}
          <Link
            href="/staff/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Staff Dashboard</span>
          </Link>

          <div className="deep-glass p-6 sm:p-8 rounded-3xl border border-emerald-500/20">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-6 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>QLex Satellite Print Hub (Room A103)</span>
                </div>
                <h1 className="text-2xl font-bold text-white">New Staff Print Order</h1>
                <p className="text-xs text-white/70 mt-1 flex items-center gap-1.5 flex-wrap">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Target Terminal: <strong className="text-emerald-300 font-semibold">A103, Department of Artificial Intelligence and Data Science, First Floor, A Block</strong></span>
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-right">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Total Charges</span>
                <p className="text-xl font-extrabold text-emerald-300">₹0.00 (Free)</p>
                <span className="text-[10px] text-white/50">Covered by Institutional Allowance</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {/* File Upload Zone */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                  1. Upload Document Files (PDF / Office Docs)
                </label>
                <div className="relative border-2 border-dashed border-emerald-500/30 rounded-2xl p-8 text-center bg-white/[0.02] hover:bg-white/[0.04] hover:border-emerald-400/50 transition">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="h-10 w-10 mx-auto text-emerald-400 mb-3" />
                  <p className="text-sm font-semibold text-white">Click or drag files here to upload</p>
                  <p className="text-xs text-white/40 mt-1">Supports PDF, DOCX, PPTX files up to 50MB</p>
                </div>

                {/* Uploaded File list */}
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 text-xs"
                      >
                        <span className="font-medium text-white truncate max-w-md">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-rose-400 hover:text-rose-300 font-semibold text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Print Configuration Grid */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/70">
                  2. Select Print Options
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Copies */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/60">Number of Copies</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={copies}
                      onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-white outline-none focus:border-emerald-400"
                    />
                  </div>

                  {/* Print Color */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/60">Print Type</label>
                    <select
                      value={printType}
                      onChange={(e) => setPrintType(e.target.value as any)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-white outline-none focus:border-emerald-400"
                    >
                      <option value="bw" className="bg-slate-900 text-white">Black & White</option>
                      <option value="color" className="bg-slate-900 text-white">Color</option>
                    </select>
                  </div>

                  {/* Print Side */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/60">Print Sides</label>
                    <select
                      value={printSide}
                      onChange={(e) => setPrintSide(e.target.value as any)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-white outline-none focus:border-emerald-400"
                    >
                      <option value="double" className="bg-slate-900 text-white">Double-Sided (Back to Back)</option>
                      <option value="single" className="bg-slate-900 text-white">Single-Sided</option>
                    </select>
                  </div>

                  {/* Paper Size */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/60">Paper Size</label>
                    <select
                      value={paperSize}
                      onChange={(e) => setPaperSize(e.target.value as any)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-white outline-none focus:border-emerald-400"
                    >
                      <option value="a4" className="bg-slate-900 text-white">A4 Standard</option>
                      <option value="a3" className="bg-slate-900 text-white">A3 Large</option>
                    </select>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Staff Order Button */}
              <div className="pt-4 border-t border-white/10">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl border border-emerald-400/40 bg-emerald-500/20 py-4 text-base font-bold text-emerald-300 transition hover:bg-emerald-500/30 hover:border-emerald-400 cursor-pointer shadow-[0_0_30px_rgba(16,185,129,0.15)] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-emerald-400" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Submitting Staff Print Order...
                    </span>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 text-emerald-400" />
                      <span>Submit Staff Order (Zero Cost)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {successResult && (
        <Popup
          open={true}
          onClose={() => router.push("/staff/token")}
          title="Staff Order Submitted Successfully!"
          description={`Your print order token is ${successResult.token || "P-1"}. It has been added directly to the QLex Satellite Print Hub queue.`}
          variant="success"
          size="sm"
          showCloseButton={false}
          dismissOnBackdrop={false}
          dismissOnEsc={false}
        >
          <div className="px-8 pb-8 pt-2 space-y-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center space-y-1">
              <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">Queue Token</span>
              <p className="text-3xl font-black text-white">{successResult.token || "P-1"}</p>
              <p className="text-xs text-emerald-300 font-semibold pt-1">
                📍 Location: QLex Satellite Print Hub (A103)
              </p>
              <p className="text-[11px] text-white/70">
                A103, Department of Artificial Intelligence and Data Science, First Floor, A Block
              </p>
            </div>

            <button
              onClick={() => router.push("/staff/token")}
              className="w-full rounded-2xl border border-emerald-400/40 bg-emerald-500/20 py-3.5 text-sm font-bold text-emerald-300 hover:bg-emerald-500/30"
            >
              View Active Staff Token
            </button>
          </div>
        </Popup>
      )}
    </ProtectedRoute>
  );
}
