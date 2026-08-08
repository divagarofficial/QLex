"use client";

import { cn } from "@/lib/utils";
import type { PopupFooterProps } from "./types";

export default function PopupFooter({ children, className }: PopupFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 px-0 pt-6 pb-0",
        className
      )}
    >
      {children}
    </div>
  );
}

