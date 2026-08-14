"use client";

import {
  Hash,
  Store,
  FileText,
  Layers,
  Copy,
  Palette,
  FileCode,
  Combine,
  Zap,
  CreditCard,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { getDocumentDisplayPrice } from "@/utils/pricing";

interface DocumentDetail {
  id?: string;
  file_name: string;
  copies: number;
  page_count: number;
  paper_size?: string;
  print_type?: string;
  print_side?: string;
  document_total?: number;
}

interface OrderInformationProps {
  orderId: string;
  shopName: string;
  documentCount: number;
  totalPages: number;
  totalCopies: number;
  printingType: string;
  paperSize: string;
  printSides: string;
  isPriority: boolean;
  totalAmount: number;
  paymentStatus: string;
  documents?: DocumentDetail[];
}

export default function OrderInformation({
  orderId,
  shopName,
  documentCount,
  totalPages,
  totalCopies,
  printingType,
  paperSize,
  printSides,
  isPriority,
  totalAmount,
  paymentStatus,
  documents = [],
}: OrderInformationProps) {
  const fields = [
    { label: "Order Number", value: `#${orderId.substring(0, 14)}`, icon: Hash, mono: true },
    { label: "Print Shop", value: shopName, icon: Store },
    { label: "Document Count", value: `${documentCount} file(s)`, icon: FileText },
    { label: "Total Pages", value: `${totalPages} page(s)`, icon: Layers },
    { label: "Copies", value: `${totalCopies} copy(ies)`, icon: Copy },
    { label: "Printing Type", value: printingType, icon: Palette },
    { label: "Paper Size", value: paperSize, icon: FileCode },
    { label: "Sides", value: printSides, icon: Combine },
    {
      label: "Priority",
      value: isPriority ? "High Priority ⚡" : "Standard Queue",
      icon: Zap,
      badge: isPriority,
    },
    {
      label: "Total Amount",
      value: `₹${totalAmount}`,
      icon: CreditCard,
      highlight: true,
    },
    {
      label: "Payment Status",
      value: paymentStatus,
      icon: paymentStatus === "PAID" ? CheckCircle2 : Clock,
      statusBadge: true,
    },
  ];

  return (
    <div className="w-full rounded-3xl bg-[#070b14]/80 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white">Order Information</h3>
          <p className="text-xs text-slate-400 mt-0.5">Specifications fetched from backend</p>
        </div>
      </div>

      {/* Grid of Key-Value Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {fields.map((field, idx) => {
          const IconComp = field.icon;
          return (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 shrink-0">
                  <IconComp className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm text-slate-400 font-medium">{field.label}</span>
              </div>

              {field.badge ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Priority ⚡
                </span>
              ) : field.statusBadge ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {field.value}
                </span>
              ) : (
                <span
                  className={`text-xs sm:text-sm font-semibold text-right ${
                    field.mono ? "font-mono" : ""
                  } ${field.highlight ? "text-emerald-400 font-bold" : "text-white"}`}
                >
                  {field.value}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Uploaded Documents List */}
      {documents.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Uploaded Files ({documents.length})
          </p>
          <div className="space-y-2">
            {documents.map((doc, idx) => {
              const displayPrice = getDocumentDisplayPrice(
                doc,
                documents,
                0,
                0,
                0,
                totalAmount,
                isPriority ? 10 : 0
              );

              return (
                <div
                  key={doc.id || idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="font-mono text-slate-200 truncate">{doc.file_name}</span>
                  </div>
                  <span className="text-slate-400 shrink-0 flex items-center gap-2">
                    <span>{doc.page_count} pages • {doc.copies} copy(ies)</span>
                    <span className="font-mono font-bold text-emerald-400">₹{displayPrice.toFixed(2)}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
