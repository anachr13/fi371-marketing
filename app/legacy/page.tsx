// Server entry for /legacy — the previous ("legacy") landing-page design, kept
// for reference but orphaned (nothing links to it). Marked noindex so it can't
// compete with or duplicate the current homepage in search. Created 2026-05-23.

import type { Metadata } from "next";
import LegacyContent from "./LegacyContent";

export const metadata: Metadata = {
  title: "Fi371 — Audit Automation (legacy layout)",
  // Excluded from search: this is a retired design, not a distinct destination.
  robots: { index: false, follow: true },
};

export default function LegacyPage() {
  return <LegacyContent />;
}
