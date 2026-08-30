"use client";

import { motion } from "framer-motion";
import { Cpu, Code2 } from "lucide-react";
import { TECH_STACK_ITEMS } from "./creditsData";

export default function TechnologyStack() {
  return (
    <section
      aria-label="Technology Stack"
      className="w-full flex flex-col items-center text-center space-y-6"
    >
      {/* Title */}
      <div className="flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-semibold tracking-wider uppercase mb-2 shadow-lg shadow-blue-500/5">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span>Built With Precision</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Technology Stack
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mt-1">
          Powered by modern, high-performance web standards.
        </p>
      </div>

      {/* Badges Grid */}
      <div className="flex flex-wrap justify-center gap-3 max-w-2xl w-full">
        {TECH_STACK_ITEMS.map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5, scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`group relative flex items-center gap-3 px-4 py-3 rounded-2xl ${item.colorClass} border ${item.borderColor} backdrop-blur-xl transition-all duration-300 hover:shadow-lg`}
            style={{
              boxShadow: `0 10px 25px -10px ${item.glowColor}`,
            }}
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-white/[0.08] border border-white/[0.12] text-amber-300 group-hover:scale-110 transition-transform duration-300">
              <Code2 className="w-3.5 h-3.5" />
            </div>

            <div className="flex flex-col items-start text-left">
              <span className={`text-xs sm:text-sm font-bold ${item.textColor}`}>
                {item.name}
              </span>
              <span className="text-[10px] text-zinc-400 font-medium tracking-wide">
                {item.category}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
