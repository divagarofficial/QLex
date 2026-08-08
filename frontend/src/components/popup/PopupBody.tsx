"use client";

import { cn } from "@/lib/utils";
import type { PopupBodyProps } from "./types";

export default function PopupBody({ children, className }: PopupBodyProps) {
  return (
    <div
      className={cn(
        "overflow-y-auto px-8 py-8 max-h-[60vh] scrollbar-thin",
        "[-webkit-overflow-scrolling:touch]",
        className
      )}
    >
      {children}
    </div>
  );
}

