"use client";

import React from "react";
import { FileText, Zap, DollarSign, Upload, Layers, Clock, Shield, Trash2, Calendar } from "lucide-react";
import { OrderSettingsState } from "./types";
import { cn } from "@/lib/utils";

interface OrderSettingsTabProps {
  data: OrderSettingsState;
  onChange: (updated: Partial<OrderSettingsState>) => void;
}

export default function OrderSettingsTab({ data, onChange }: OrderSettingsTabProps) {
  return (
    <div className="space-y-6">
      {/* Fees & Priority Card */}
      <div className="p-6 rounded-2xl bg-[#070a0e]/60 border border-white/10 backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Fees & Priority Express Rules</h2>
            <p className="text-xs text-zinc-400">Configure platform service surcharges and priority queue handling</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Allow Priority Orders Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 md:col-span-3">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <span>Allow Priority Express Orders</span>
              </div>
              <p className="text-[11px] text-zinc-400">Enables students to skip queue by paying priority fee</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={data.allowPriorityOrders}
              onClick={() => onChange({ allowPriorityOrders: !data.allowPriorityOrders })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                data.allowPriorityOrders ? "bg-amber-500" : "bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  data.allowPriorityOrders ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Platform Fee */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
              <span>Platform Service Fee (₹)</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={data.platformFee}
              onChange={(e) => onChange({ platformFee: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
            />
            <p className="text-[10px] text-zinc-500">Backend setting: platform_fee</p>
          </div>

          {/* Priority Fee */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Priority Express Surcharge (₹)</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={data.priorityFee}
              onChange={(e) => onChange({ priorityFee: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
            />
            <p className="text-[10px] text-zinc-500">Backend setting: priority_fee</p>
          </div>

          {/* Default Token Prefix */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-cyan-400" />
              <span>Default Queue Token Prefix</span>
            </label>
            <input
              type="text"
              value={data.defaultTokenPrefix}
              onChange={(e) => onChange({ defaultTokenPrefix: e.target.value })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase tracking-wider focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
            />
            <p className="text-[10px] text-zinc-500">e.g. QX-001, PR-002</p>
          </div>
        </div>
      </div>

      {/* Upload & Document Constraints Card */}
      <div className="p-6 rounded-2xl bg-[#070a0e]/60 border border-white/10 backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Document & Upload Limits</h2>
            <p className="text-xs text-zinc-400">Enforces backend validation on upload sizes and page limits</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Max Upload Size */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
              <Upload className="h-3.5 w-3.5 text-blue-400" />
              <span>Max Upload Size (MB)</span>
            </label>
            <input
              type="number"
              min="1"
              max="500"
              value={data.maxUploadSizeMb}
              onChange={(e) => onChange({ maxUploadSizeMb: parseInt(e.target.value) || 1 })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
            <p className="text-[10px] text-zinc-500">Backend setting: max_upload_size_mb</p>
          </div>

          {/* Max Documents Per Order */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              <span>Max Documents Per Order</span>
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={data.maxDocumentsPerOrder}
              onChange={(e) => onChange({ maxDocumentsPerOrder: parseInt(e.target.value) || 1 })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
            <p className="text-[10px] text-zinc-500">Backend setting: max_documents_per_order</p>
          </div>

          {/* Max Pages Per Document */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-violet-400" />
              <span>Max Pages Per Document</span>
            </label>
            <input
              type="number"
              min="1"
              max="5000"
              value={data.maxPagesPerDocument}
              onChange={(e) => onChange({ maxPagesPerDocument: parseInt(e.target.value) || 1 })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
            <p className="text-[10px] text-zinc-500">Backend setting: max_pages_per_document</p>
          </div>

          {/* Allowed File Types */}
          <div className="space-y-2 md:col-span-3">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span>Allowed File Types (MIME / Extensions)</span>
            </label>
            <input
              type="text"
              value={data.allowedFileTypes}
              onChange={(e) => onChange({ allowedFileTypes: e.target.value })}
              placeholder=".pdf, .docx, .png, .jpg, .jpeg"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
            <p className="text-[10px] text-zinc-500">Comma-separated list of allowed document formats</p>
          </div>
        </div>
      </div>

      {/* Expiry & Lifecycle Settings Card */}
      <div className="p-6 rounded-2xl bg-[#070a0e]/60 border border-white/10 backdrop-blur-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Order Lifecycle & Retention</h2>
            <p className="text-xs text-zinc-400">Draft timeouts, auto-cancellation, and automated file cleanup</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Draft Expiry Hours */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span>Unpaid Draft Expiry (Hours)</span>
            </label>
            <input
              type="number"
              min="1"
              max="168"
              value={data.draftExpiryHours}
              onChange={(e) => onChange({ draftExpiryHours: parseInt(e.target.value) || 1 })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
            <p className="text-[10px] text-zinc-500">Backend setting: draft_expiry_hours</p>
          </div>

          {/* Queue Timeout Minutes */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span>Queue Token Timeout (Minutes)</span>
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={data.queueTimeoutMinutes}
              onChange={(e) => onChange({ queueTimeoutMinutes: parseInt(e.target.value) || 1 })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
            <p className="text-[10px] text-zinc-500">Backend setting: queue_timeout_minutes</p>
          </div>

          {/* Auto Delete Files Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/10 md:col-span-2">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-rose-400" />
                <span>Auto-Delete Uploaded Documents</span>
              </div>
              <p className="text-[11px] text-zinc-400">Automatically purges completed order PDFs after retention period</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={data.autoDeleteUploadedFiles}
              onClick={() => onChange({ autoDeleteUploadedFiles: !data.autoDeleteUploadedFiles })}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                data.autoDeleteUploadedFiles ? "bg-rose-500" : "bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                  data.autoDeleteUploadedFiles ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Retention Period Days */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-emerald-400" />
              <span>Completed Order Document Retention Period (Days)</span>
            </label>
            <input
              type="number"
              min="1"
              max="90"
              value={data.retentionPeriodDays}
              onChange={(e) => onChange({ retentionPeriodDays: parseInt(e.target.value) || 1 })}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
