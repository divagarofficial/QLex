"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Printer,
  Eye,
  CheckCircle,
} from "lucide-react";
import type { DetailedOrderDocument } from "@/types/shop";
import { printShopOrder } from "@/services/shop";
import { cn } from "@/lib/utils";

interface FilePreviewerProps {
  documents: DetailedOrderDocument[];
  selectedDocIndex: number;
  onSelectDoc: (index: number) => void;
  orderId: string;
  /** Called after print is sent so the parent can refresh & remove the order */
  onPrintComplete?: () => void;
}

export default function FilePreviewer({
  documents,
  selectedDocIndex,
  onSelectDoc,
  orderId,
  onPrintComplete,
}: FilePreviewerProps) {
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [printedDocs, setPrintedDocs] = useState<number[]>([]);
  const [allFinished, setAllFinished] = useState(false);

  if (!documents || documents.length === 0) {
    return (
      <div className="deep-glass flex h-[420px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
        <FileText className="h-12 w-12 text-zinc-500 mb-3" />
        <h3 className="text-base font-bold text-white">No Documents Uploaded</h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-xs">
          This order does not currently have any attached PDF or document files.
        </p>
      </div>
    );
  }

  const activeDoc = documents[selectedDocIndex] || documents[0];
  const pdfUrl =
    activeDoc.url ||
    (activeDoc.stored_filename
      ? `http://localhost:8000/uploads/drafts/${orderId}/${activeDoc.stored_filename}`
      : `http://localhost:8000/uploads/drafts/${orderId}/${activeDoc.original_filename}`);

  const isCurrentDocPrinted = printedDocs.includes(selectedDocIndex);
  const totalDocs = documents.length;
  const printedCount = printedDocs.length;

  // Download Handler
  const handleDownload = () => {
    setDownloading(true);
    try {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = activeDoc.original_filename || `document_${activeDoc.id}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setTimeout(() => setDownloading(false), 500);
    }
  };

  // Multi-document Print Handler
  const handleSystemPrint = async () => {
    if (printing || allFinished) return;
    setPrinting(true);

    try {
      // 1. Send native OS print dialog for the current document
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.src = pdfUrl;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          const printWin = window.open(pdfUrl, "_blank");
          if (printWin) {
            printWin.focus();
            printWin.print();
          }
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 1500);
        }
      };

      // 2. Register document as printed
      const updatedPrinted = Array.from(new Set([...printedDocs, selectedDocIndex]));
      setPrintedDocs(updatedPrinted);

      // 3. Mark backend order state as PRINTING on first print action
      if (printedDocs.length === 0) {
        try {
          await printShopOrder(orderId);
        } catch (backendErr) {
          console.error("Backend status update error:", backendErr);
        }
      }

      // 4. Check if all documents in this order are printed
      if (updatedPrinted.length >= totalDocs) {
        setAllFinished(true);
        setTimeout(() => {
          onPrintComplete?.();
        }, 1200);
      } else {
        // If unprinted documents remain, automatically switch to the next unprinted document tab
        const nextUnprintedIndex = documents.findIndex((_, idx) => !updatedPrinted.includes(idx));
        if (nextUnprintedIndex !== -1) {
          setTimeout(() => {
            onSelectDoc(nextUnprintedIndex);
          }, 600);
        }
      }
    } catch (err) {
      console.error("Print trigger failed:", err);
      window.open(pdfUrl, "_blank");
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="deep-glass flex flex-col rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-xl space-y-4">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300">
            <Eye className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Document Preview &amp; Direct Actions
            </h3>
            {totalDocs > 1 && (
              <p className="text-[11px] text-zinc-400">
                Printing Progress: <span className="text-amber-300 font-bold">{printedCount}/{totalDocs} Documents Printed</span>
              </p>
            )}
          </div>
        </div>

        {/* Primary Action Buttons: Download & Print */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:border-amber-400/40 hover:bg-amber-500/15 hover:text-amber-300 transition-all cursor-pointer shadow-md"
            title="Download Document File"
          >
            <Download className={`h-4 w-4 ${downloading ? "animate-bounce text-amber-400" : ""}`} />
            <span>{downloading ? "Downloading..." : "Download File"}</span>
          </button>

          <button
            type="button"
            onClick={handleSystemPrint}
            disabled={printing || allFinished}
            className={cn(
              "flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-black transition-all cursor-pointer shadow-lg",
              allFinished
                ? "border-emerald-400/50 bg-emerald-400/20 text-emerald-300 shadow-emerald-400/10 cursor-default"
                : isCurrentDocPrinted
                ? "border-blue-400/50 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                : "border-amber-400/50 bg-amber-400/20 text-amber-200 hover:bg-amber-400/30 shadow-amber-400/10"
            )}
            title={
              allFinished
                ? "All documents printed"
                : `Print document (${selectedDocIndex + 1}/${totalDocs})`
            }
          >
            {allFinished ? (
              <>
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <span>All {totalDocs} Documents Printed</span>
              </>
            ) : printing ? (
              <>
                <Printer className="h-4 w-4 animate-spin text-amber-300" />
                <span>Sending to Printer...</span>
              </>
            ) : isCurrentDocPrinted ? (
              <>
                <CheckCircle className="h-4 w-4 text-blue-400" />
                <span>Print Again ({selectedDocIndex + 1}/{totalDocs})</span>
              </>
            ) : (
              <>
                <Printer className="h-4 w-4 text-amber-300" />
                <span>Print Document ({selectedDocIndex + 1}/{totalDocs})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notice when all finished */}
      {allFinished && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-300 font-semibold">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>
            All {totalDocs} documents in this order have been sent to printer. Order status updated to <strong>PRINTING</strong>.
          </span>
        </div>
      )}

      {/* Tabs if multiple files */}
      {documents.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {documents.map((doc, idx) => {
            const isPrinted = printedDocs.includes(idx);
            return (
              <button
                key={doc.id || idx}
                type="button"
                onClick={() => onSelectDoc(idx)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold backdrop-blur-md transition-all shrink-0 cursor-pointer",
                  selectedDocIndex === idx
                    ? "border-amber-400/50 bg-amber-400/20 text-amber-300 shadow-md shadow-amber-400/10"
                    : isPrinted
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-white"
                )}
              >
                {isPrinted ? (
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <FileText className="h-3.5 w-3.5" />
                )}
                <span className="max-w-[160px] truncate">{doc.original_filename}</span>
                <span className="text-[10px] opacity-70">({doc.page_count}p)</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Active Document Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-md">
        <div className="flex items-center gap-2 font-mono text-xs text-white">
          <FileText className="h-4 w-4 text-amber-400" />
          <span className="font-bold">{activeDoc.original_filename}</span>
          {isCurrentDocPrinted && (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              PRINTED
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-300 font-medium">
          <span>{activeDoc.page_count} pages</span>
          <span>•</span>
          <span>{activeDoc.copies} {activeDoc.copies === 1 ? "copy" : "copies"}</span>
          <span>•</span>
          <span className="text-amber-300 font-bold uppercase">{activeDoc.paper_size} ({activeDoc.print_type})</span>
        </div>
      </div>

      {/* Embedded PDF View */}
      <div className="relative flex min-h-[460px] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 p-2 shadow-inner">
        <iframe
          src={pdfUrl}
          className="w-full h-[460px] rounded-xl border border-white/10 bg-white shadow-2xl"
          title={activeDoc.original_filename}
        />
      </div>
    </div>
  );
}

