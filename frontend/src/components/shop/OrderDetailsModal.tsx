"use client";

import { useEffect, useState } from "react";
import Popup from "@/components/popup/Popup";
import { fetchOrderDetails } from "@/services/shop";
import type { ShopOrderDetails, ShopDocumentItem } from "@/types/shop";
import { FileText, Printer, CheckCircle, Zap, Loader2, ExternalLink, Download, AlertCircle } from "lucide-react";
import { getDocumentDisplayPrice } from "@/utils/pricing";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getDocumentUrl(doc: ShopDocumentItem, orderId: string): string {
  if (doc.url) {
    if (doc.url.startsWith("http")) return doc.url;
    return `${API_BASE}${doc.url.startsWith("/") ? "" : "/"}${doc.url}`;
  }
  if (doc.stored_filename) {
    return `${API_BASE}/uploads/${doc.stored_filename}`;
  }
  return `${API_BASE}/uploads/${doc.original_filename}`;
}

interface OrderDetailsModalProps {
  orderId: string | null;
  onClose: () => void;
}

export default function OrderDetailsModal({
  orderId,
  onClose,
}: OrderDetailsModalProps) {
  const [details, setDetails] = useState<ShopOrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeDocIndex, setActiveDocIndex] = useState(0);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    setActiveDocIndex(0);
    fetchOrderDetails(orderId)
      .then((res) => setDetails(res))
      .catch((err) => console.error("Error fetching order details modal:", err))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (!orderId) return null;

  const activeDoc: ShopDocumentItem | undefined = details?.documents?.[activeDocIndex] || details?.documents?.[0];
  const activeDocUrl = activeDoc && details ? getDocumentUrl(activeDoc, details.order_id) : "";

  return (
    <Popup
      open={!!orderId}
      onClose={onClose}
      title={details ? `Live Document Preview — Token ${details.token}` : "Loading Document Viewer..."}
      description={
        details
          ? details.student_id
            ? `Student ID: REG-${details.student_id.slice(0, 8).toUpperCase()}`
            : `Customer: ${details.student_name || "Express Guest"} (${details.register_number || "Guest"})`
          : "Fetching document stream from server..."
      }
      size="xl"
      variant="default"
      showCloseButton={true}
    >
      {loading || !details ? (
        <div className="flex h-64 items-center justify-center gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          <span className="text-sm font-semibold">Loading document preview stream...</span>
        </div>
      ) : (
        <div className="space-y-4 text-left">
          {/* Header Summary & Order Specs Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-950/30 p-3 px-4 backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-2">
              {details.is_priority && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-extrabold text-black">
                  <Zap className="h-3 w-3 fill-black" /> PRIORITY
                </span>
              )}
              <span className="text-xs font-bold text-white">
                {details.documents.length} {details.documents.length === 1 ? "Document Attached" : "Documents Attached"}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs font-mono text-cyan-300">
                Printer: {details.assigned_printer ? <strong className="text-cyan-400">{details.assigned_printer}</strong> : <span className="text-amber-400 font-semibold">Unassigned</span>}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-base font-black text-emerald-400">
                Order Total: ₹{Number((details as any).subtotal || details.grand_total || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Document Navigation Tabs */}
          {details.documents.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/10">
              {details.documents.map((doc, idx) => (
                <button
                  key={doc.id || idx}
                  onClick={() => setActiveDocIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap border ${
                    activeDocIndex === idx
                      ? "bg-cyan-500 text-black border-cyan-400 shadow-lg shadow-cyan-500/20"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="max-w-[180px] truncate">{doc.original_filename}</span>
                  <span className="text-[10px] opacity-80">({doc.page_count}p)</span>
                </button>
              ))}
            </div>
          )}

          {/* Active Document Live PDF Viewer Frame */}
          {activeDoc && activeDocUrl ? (
            <div className="space-y-3">
              <div className="relative rounded-2xl border border-white/15 bg-slate-950 overflow-hidden shadow-2xl">
                <iframe
                  src={`${activeDocUrl}#toolbar=1`}
                  className="w-full h-[480px] sm:h-[540px] bg-slate-900"
                  title={activeDoc.original_filename}
                />
              </div>

              {/* Active Document Specs Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-900/80 border border-white/10 rounded-2xl">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    {activeDoc.original_filename}
                  </span>
                  <span className="bg-white/10 px-2 py-0.5 rounded-md font-mono text-[11px]">
                    {activeDoc.page_count} Pages • {activeDoc.copies} Copies
                  </span>
                  <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                    {activeDoc.print_type === "COLOR" ? "Color" : "B&W"}
                  </span>
                  <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                    {activeDoc.paper_size || "A4"}
                  </span>
                  <span className="bg-slate-800 text-slate-300 border border-white/10 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                    {activeDoc.print_side === "DOUBLE" ? "Double-Sided" : "Single-Sided"}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={activeDocUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-black font-extrabold text-xs hover:bg-cyan-400 transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Full PDF</span>
                  </a>
                  <a
                    href={activeDocUrl}
                    download={activeDoc.original_filename}
                    className="p-1.5 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 text-white transition-all"
                    title="Download Original File"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 border border-dashed border-white/10 rounded-2xl bg-black/40 flex flex-col items-center gap-2">
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <p className="text-sm font-bold text-white">No Document File Available</p>
              <p className="text-xs text-slate-500">Document URL is not attached to this order record.</p>
            </div>
          )}
        </div>
      )}
    </Popup>
  );
}
