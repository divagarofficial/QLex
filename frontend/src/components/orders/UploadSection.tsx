"use client";

import { useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, Loader2, Eye, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Popup from "@/components/popup/Popup";
import type { UploadedDocumentResponse } from "@/types/orders";

interface UploadSectionProps {
  files: UploadedDocumentResponse[];
  uploading: boolean;
  uploadProgress: number;
  onUpload: (files: File[]) => void;
  onRemove: (documentId: string) => void;
  onPreview?: (file: UploadedDocumentResponse) => void;
}

// Accepted file types
const ACCEPTED_TYPES = ".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.zip";
const MAX_SIZE_MB = 50;

function formatFileSize(bytes?: number): string {
  if (!bytes) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const iconMap: Record<string, string> = {
    pdf: "📄",
    doc: "📝",
    docx: "📝",
    ppt: "📊",
    pptx: "📊",
    png: "🖼️",
    jpg: "🖼️",
    jpeg: "🖼️",
    zip: "📦",
  };
  return iconMap[ext] || "📄";
}

export default function UploadSection({
  files,
  uploading,
  uploadProgress,
  onUpload,
  onRemove,
  onPreview,
}: UploadSectionProps) {
  const [dragOver, setDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedDocumentResponse | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        onUpload(droppedFiles);
      }
    },
    [onUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (selectedFiles.length > 0) {
        onUpload(selectedFiles);
      }
      if (inputRef.current) inputRef.current.value = "";
    },
    [onUpload]
  );

  const handlePreviewClick = (file: UploadedDocumentResponse) => {
    if (onPreview) {
      onPreview(file);
    } else {
      setPreviewFile(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          borderColor: dragOver
            ? "rgba(231, 200, 115, 0.5)"
            : "rgba(255,255,255,0.08)",
          backgroundColor: dragOver
            ? "rgba(231, 200, 115, 0.03)"
            : "rgba(255,255,255,0.02)",
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all",
          "cursor-pointer group hover:border-champagne-500/30"
        )}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        aria-label="Upload documents area. Drag and drop or click to browse."
      >
        {/* Subtle pulse animation on drag over */}
        {dragOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 rounded-2xl bg-champagne-500/5"
          />
        )}

        <div className="relative z-10 flex flex-col items-center gap-4">
          <div
            className={cn(
              "crystal-badge w-16 h-16",
              dragOver && "border-champagne-500/30"
            )}
          >
            <Upload
              size={28}
              className={cn(
                "transition-colors duration-300",
                dragOver ? "text-champagne-400" : "text-white/40"
              )}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white/60">
              {dragOver ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="mt-1 text-xs text-white/30">
              or <span className="text-champagne-400 underline underline-offset-2">browse</span> to upload
            </p>
          </div>
          <p className="text-[10px] text-white/20">
            PDF, DOC, DOCX, PPT, PPTX, Images, ZIP • Max {MAX_SIZE_MB}MB each
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={handleFileSelect}
          aria-hidden="true"
        />
      </motion.div>

      {/* Upload Progress */}
      {uploading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="deep-glass p-4"
        >
          <div className="flex items-center gap-3">
            <Loader2 size={18} className="animate-spin text-champagne-400" />
            <span className="text-sm text-white/60">Uploading and analyzing document...</span>
            <span className="ml-auto text-sm font-medium text-champagne-400">
              {uploadProgress}%
            </span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-champagne-400 to-champagne-600"
            />
          </div>
        </motion.div>
      )}

      {/* Uploaded Files List */}
      <AnimatePresence mode="popLayout">
        {files.map((file) => (
          <motion.div
            key={file.id}
            layout
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: "auto" }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="deep-glass group relative overflow-hidden p-4"
          >
            <div className="deep-glass-reflection" />
            <div className="relative z-10 flex items-center gap-4">
              {/* File Icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center text-xl border border-white/[0.06]">
                {getFileIcon(file.original_filename)}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white/80 truncate">
                    {file.original_filename}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 size={10} /> Ready
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-white/30">
                  <span>{file.page_count} {file.page_count === 1 ? "page" : "pages"}</span>
                  <span>•</span>
                  <span>{formatFileSize(file.file_size)}</span>
                  <span>•</span>
                  <span>₹{Number(file.document_total || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreviewClick(file);
                  }}
                  className="crystal-btn !p-2 !rounded-xl"
                  aria-label={`Preview ${file.original_filename}`}
                >
                  <Eye size={16} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(file.id);
                  }}
                  className="crystal-btn !p-2 !rounded-xl hover:!border-red-500/30 hover:!text-red-400"
                  aria-label={`Remove ${file.original_filename}`}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Empty State */}
      {files.length === 0 && !uploading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center deep-glass p-8 rounded-2xl border border-white/[0.04]"
        >
          <div className="crystal-badge opacity-40 mb-4 w-14 h-14">
            <FileText size={28} className="text-champagne-400" />
          </div>
          <p className="text-base font-semibold text-white/80">No files uploaded yet</p>
          <p className="mt-1 text-xs text-white/30 max-w-xs">
            Drag & drop your study materials, lecture notes, or project reports to begin.
          </p>
        </motion.div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <Popup
          open={!!previewFile}
          onClose={() => setPreviewFile(null)}
          title={previewFile.original_filename}
          description={`${previewFile.page_count} pages • ${formatFileSize(previewFile.file_size)}`}
          size="lg"
        >
          <div className="mt-4 space-y-4">
            {previewFile.url ? (
              <div className="w-full h-[450px] rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
                <iframe
                  src={previewFile.url}
                  className="w-full h-full"
                  title={previewFile.original_filename}
                />
              </div>
            ) : (
              <div className="p-8 text-center bg-white/[0.02] rounded-xl border border-white/[0.06]">
                <FileText size={36} className="mx-auto text-champagne-400 mb-2 opacity-60" />
                <p className="text-sm text-white/70">Document Ready for Processing</p>
                <p className="text-xs text-white/30 mt-1">
                  Filename: {previewFile.original_filename}
                </p>
              </div>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="crystal-btn"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Popup>
      )}
    </div>
  );
}

