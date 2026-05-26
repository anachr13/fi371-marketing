"use client";

// PrivacyBubble — dismissible privacy notice for the survey page.
// Author: Fi371 · 2026-05-26
// Purpose: reassure visitors that this page sets no cookies and runs no
// analytics. Dismissal is in-memory only (no cookie, no localStorage), which
// keeps the notice's own claim literally true. Neutral warm-paper tokens only —
// chartreuse is reserved for AI elements per DESIGN.md. The entrance fade-up is
// pure CSS (tailwindcss-animate), so no effect/state is needed beyond open/closed.

import { useState } from "react";

/**
 * Floating, dismissible privacy notice anchored to the bottom-right.
 * Clicking "OK" hides it for the rest of the visit (state resets on reload,
 * since nothing is stored).
 *
 * @returns The bubble while visible, or null once the user dismisses it.
 */
export default function PrivacyBubble() {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div
      role="note"
      aria-label="Privacy notice"
      className="fixed bottom-4 left-4 right-4 z-50 duration-300 ease-out animate-in fade-in slide-in-from-bottom-2 sm:left-auto sm:max-w-[320px]"
    >
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg">
        <p className="text-[14px] leading-snug text-muted-foreground">
          We&apos;re currently not using any cookies or analytics on this page.
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-muted"
        >
          OK
        </button>
      </div>
    </div>
  );
}
