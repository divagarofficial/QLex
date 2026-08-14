"use client";

import { FileText, Receipt, CheckCircle2, ShieldCheck } from "lucide-react";
import type { DetailedOrderDocument } from "@/types/shop";
import { getDocumentDisplayPrice } from "@/utils/pricing";

interface FinancialBreakdownProps {
  documents: DetailedOrderDocument[];
  subtotal: number;
  convenienceFee: number;
  platformFee: number;
  priorityFee: number;
  grandTotal: number;
  paymentStatus: string;
}

export default function FinancialBreakdown({
  documents,
  subtotal,
  convenienceFee,
  platformFee,
  priorityFee,
  grandTotal,
  paymentStatus,
}: FinancialBreakdownProps) {
  return (
    <div className="deep-glass flex flex-col rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
            <Receipt className="h-4 w-4" />
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Order Audit & Financial Breakdown
          </h3>
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase">
          <ShieldCheck className="h-3.5 w-3.5" /> Payment {paymentStatus || "Paid"}
        </span>
      </div>

      {/* Documents Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-zinc-400 font-semibold uppercase text-[10px] tracking-wider">
              <th className="pb-2 pl-1">Document Item</th>
              <th className="pb-2">Pages</th>
              <th className="pb-2">Copies</th>
              <th className="pb-2">Print Spec</th>
              <th className="pb-2 text-right pr-1">Total Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-zinc-200">
            {documents.map((doc, idx) => {
              const specLabel = `${doc.print_type === "colour" || doc.print_type === "COLOR" ? "Colour" : "B&W"} • ${doc.paper_size} • ${doc.print_side}`;
              const displayPrice = getDocumentDisplayPrice(
                doc,
                documents,
                subtotal,
                convenienceFee,
                platformFee,
                grandTotal,
                priorityFee
              );

              return (
                <tr key={doc.id || idx} className="hover:bg-white/[0.02]">
                  <td className="py-2.5 pl-1 font-medium flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span className="max-w-[180px] truncate">{doc.original_filename}</span>
                  </td>
                  <td className="py-2.5 font-mono">{doc.page_count}p</td>
                  <td className="py-2.5 font-mono">{doc.copies}x</td>
                  <td className="py-2.5 text-zinc-400">{specLabel}</td>
                  <td className="py-2.5 text-right pr-1 font-bold font-mono text-amber-300">
                    ₹{displayPrice.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="pt-3 border-t border-white/10 space-y-2 max-w-sm ml-auto text-xs">
        <div className="flex justify-between text-zinc-400">
          <span>Print Total:</span>
          <span className="font-mono text-zinc-200">
            ₹{Number((subtotal || 0) + (convenienceFee || 0) + (platformFee || 0)).toFixed(2)}
          </span>
        </div>

        {priorityFee > 0 && (
          <div className="flex justify-between text-amber-400">
            <span>Priority Queue Processing Fee:</span>
            <span className="font-mono font-bold">₹{Number(priorityFee).toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-white/10 text-sm font-black text-white">
          <span>Grand Total Paid:</span>
          <span className="text-base font-black text-amber-300 font-mono">
            ₹{Number(grandTotal || 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
