"use client";

import { createContext, useContext, useCallback, useState } from "react";
import type { ReactNode } from "react";

interface PopupContextValue {
  activePopups: string[];
  registerPopup: (id: string) => void;
  unregisterPopup: (id: string) => void;
  isTopmost: (id: string) => boolean;
}

const PopupContext = createContext<PopupContextValue | null>(null);

export function PopupProvider({ children }: { children: ReactNode }) {
  const [activePopups, setActivePopups] = useState<string[]>([]);

  const registerPopup = useCallback((id: string) => {
    setActivePopups((prev) => [...prev, id]);
  }, []);

  const unregisterPopup = useCallback((id: string) => {
    setActivePopups((prev) => prev.filter((p) => p !== id));
  }, []);

  const isTopmost = useCallback(
    (id: string) => {
      return activePopups.length > 0 && activePopups[activePopups.length - 1] === id;
    },
    [activePopups]
  );

  return (
    <PopupContext.Provider value={{ activePopups, registerPopup, unregisterPopup, isTopmost }}>
      {children}
    </PopupContext.Provider>
  );
}

export function usePopupContext() {
  const ctx = useContext(PopupContext);
  if (!ctx) {
    throw new Error("usePopupContext must be used within a PopupProvider");
  }
  return ctx;
}
