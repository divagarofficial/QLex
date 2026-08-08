"use client";

import { useEffect, useState } from "react";
import Popup from "@/components/popup/Popup";
import { fetchOrderDetails } from "@/services/shop";
import type { ShopOrderDetails } from "@/types/shop";
import { FileText, Printer, CheckCircle, Zap, Loader2 } from "lucide-react";

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

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    fetchOrderDetails(orderId)
      .then((res) => setDetails(res))
      .catch((err) => console.error("Error fetching order details modal:", err))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (!orderId) return null;

  return (
    <Popup
      open={!!orderId}
      onClose={onClose}
      title={details ? `Order Specifications — ${details.token}` : "Loading Order..."}
      description={
        details
          ? `Student ID: REG-${details.student_id.slice(0, 8).toUpperCase()}`
          : "Fetching full order requirements from backend..."
      }
      size="lg"
      variant="default"
      showCloseButton={true}
    >
      {loading || !details ? (
        <div className="flex h-40 items-center justify-center gap-2 text-zinc-400">
          <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
          <span className="text-sm font-medium">Fetching details...</span>
        </div>
      ) : (
        <div className="space-y-4 text-left">
          {/* Header Summary Pill */}
          <div className="flex items-center justify-between rounded-2xl border border-amber-400/20 bg-amber-500/10 p-3 px-4">
            <div className="flex items-center gap-2">
              {details.is_priority && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold text-black">
                  <Zap className="h-3 w-3 fill-black" /> PRIORITY
                </span>
              )}
              <span className="text-xs font-bold text-white">
                {details.documents.length} {details.documents.length === 1 ? "Document" : "Documents"}
              </span>
            </div>

            <span className="text-base font-black text-amber-300">
              Total: ₹{Number(details.grand_total || 0).toFixed(2)}
            </span>
          </div>

          {/* Document list */}
          <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
            {details.documents.map((doc, idx) => (
              <div
                key={doc.id || idx}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 backdrop-blur-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <FileText className="h-4 w-4 text-amber-400" />
                    {doc.original_filename}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    ₹{Number(doc.document_total || 0).toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] text-zinc-300 font-medium">
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase">Pages</span>
                    <span>{doc.page_count} pages</span>
                  </div>

                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase">Copies</span>
                    <span>{doc.copies} copy</span>
                  </div>

                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase">Options</span>
                    <span>
                      {doc.print_type === "COLOR" ? "Color" : "B&W"} • {doc.paper_size} • {doc.print_side}
                    </span>
                  </div>
                </div>

                {/* Additional services */}
                {doc.services && doc.services.length > 0 && (
                  <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2">
                    {doc.services.map((svc) => (
                      <span
                        key={svc.id}
                        className="rounded-lg bg-purple-500/20 border border-purple-400/30 px-2 py-0.5 text-[10px] font-semibold text-purple-300"
                      >
                        + {svc.name} (₹{Number(svc.price).toFixed(2)})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Popup>
  );
}
