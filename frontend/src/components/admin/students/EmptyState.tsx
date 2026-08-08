"use client";

import { Users, SearchX, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  isSearch: boolean;
  onReset: () => void;
}

export default function EmptyState({ isSearch, onReset }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl text-center my-8 shadow-2xl"
    >
      <div className="p-4 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-4">
        {isSearch ? <SearchX className="w-10 h-10" /> : <Users className="w-10 h-10" />}
      </div>

      <h3 className="text-xl font-bold text-white mb-2">
        {isSearch ? "No matching students found" : "No registered students"}
      </h3>

      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        {isSearch
          ? "We couldn't find any student accounts matching your current search query or filter selections. Try clearing your filters or search keywords."
          : "There are currently no student accounts registered in the QLex platform database."}
      </p>

      {isSearch && (
        <button
          onClick={onReset}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters & Search</span>
        </button>
      )}
    </motion.div>
  );
}
