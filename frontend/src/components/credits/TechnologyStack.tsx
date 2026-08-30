"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Code2, Layers, Server, ShieldCheck } from "lucide-react";
import { TECH_STACK_ITEMS, TechItem } from "./creditsData";

const categories = [
  { id: "all", label: "All Tech", icon: Layers },
  { id: "frontend", label: "Frontend", icon: Code2 },
  { id: "backend", label: "Backend", icon: Server },
  { id: "infra", label: "Infra & Security", icon: ShieldCheck },
];

export default function TechnologyStack() {
  const [activeGroup, setActiveGroup] = useState<string>("all");
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);

  const filteredItems = TECH_STACK_ITEMS.filter((item: TechItem) => {
    if (activeGroup === "all") return true;
    return item.group === activeGroup;
  });

  return (
    <section
      id="tech"
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
          Powered by modern, high-performance web standards & cloud architecture.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeGroup === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveGroup(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-amber-400/15 border border-amber-400/40 text-amber-300 shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Badges Grid with Animations */}
      <motion.div
        layout
        className="flex flex-wrap justify-center gap-3 max-w-2xl w-full min-h-[140px]"
      >
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item: TechItem, idx: number) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25, delay: idx * 0.03 }}
              key={item.name}
              onMouseEnter={() => setHoveredTech(item.name)}
              onMouseLeave={() => setHoveredTech(null)}
              whileHover={{ y: -5, scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`group relative flex flex-col items-start px-4 py-3 rounded-2xl ${item.colorClass} border ${item.borderColor} backdrop-blur-xl transition-all duration-300 hover:shadow-lg cursor-pointer max-w-[200px] text-left`}
              style={{
                boxShadow: `0 10px 25px -10px ${item.glowColor}`,
              }}
            >
              <div className="flex items-center gap-2.5 w-full">
                <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-white/[0.08] border border-white/[0.12] text-amber-300 group-hover:scale-110 transition-transform duration-300 shrink-0">
                  <Code2 className="w-3.5 h-3.5" />
                </div>

                <div className="flex flex-col items-start text-left overflow-hidden">
                  <span className={`text-xs sm:text-sm font-bold truncate ${item.textColor}`}>
                    {item.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium tracking-wide">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Tooltip Description on Hover */}
              {item.description && (
                <div className="mt-2 pt-2 border-t border-white/[0.08] text-[10px] text-zinc-300 leading-tight group-hover:text-white transition-colors">
                  {item.description}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

