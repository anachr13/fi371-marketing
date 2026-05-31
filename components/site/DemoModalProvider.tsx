"use client";
// Single owner of the Fi371 demo modal. Any descendant calls useDemoModal()
// to open or close the modal; the provider mounts <DemoModal /> exactly once
// so we never get duplicate modals or stale per-page state. Created 2026-05-31.

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import DemoModal from "./DemoModal";

type DemoModalContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const DemoModalContext = createContext<DemoModalContextValue | null>(null);

export function DemoModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  return (
    <DemoModalContext.Provider value={value}>
      {children}
      <DemoModal open={isOpen} onClose={close} />
    </DemoModalContext.Provider>
  );
}

export function useDemoModal(): DemoModalContextValue {
  const ctx = useContext(DemoModalContext);
  if (!ctx) {
    throw new Error("useDemoModal must be used inside <DemoModalProvider>");
  }
  return ctx;
}
