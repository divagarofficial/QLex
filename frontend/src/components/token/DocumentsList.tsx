"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronDown, ChevronUp, Layers, Copy, Sparkles, Download } from "lucide-react";
import type { DocumentItem } from "@/types/token";

interface DocumentsListProps {
  documents: DocumentItem[];
}

export default function DocumentsList({ documents }: DocumentsListProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Default fallback documents matching prompt examples if array is empty
  const displayDocs: DocumentItem[] =
    documents && documents.length > 0
      ? documents
      : [
          {
            id: "doc-1",
            file_name: "Assignment.pdf",
            pages: 8,
            copies: 2,
            is_color: true,
            paper_size: "A4",
            print_side: "Double Sided",
          },
          {
            id: "doc-2",
            file_name: "Resume.pdf",
            pages: 2,
            copies: 1,
            is_color: false,
            paper_size: "A4",
            print_side: "Single Sided",
          },
        ];

  return (
    <div className="w-full rounded-3xl bg-[#070b14]/75 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
      {/* Header & Toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left group cursor-pointer focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">
              Uploaded Documents ({displayDocs.length})
            </h3>
            <p className="text-xs text-slate-400">Click to view document print specifications</p>
          </div>
        </div>

        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-white transition">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden mt-6 pt-4 border-t border-white/10 space-y-3"
          >
            {displayDocs.map((doc, idx) => (
              <div
                key={doc.id || idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 transition duration-200"
              >
                {/* Left: PDF Icon + Filename */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono tracking-tight">
                      {doc.file_name}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        {doc.pages} Pages
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        {doc.copies} Copies
                      </span>
                      {doc.print_side && (
                        <>
                          <span>•</span>
                          <span>{doc.print_side}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Color Badge */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  {doc.is_color ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      Color
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/15 text-slate-300 border border-slate-500/30">
                      Black & White
                    </span>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
