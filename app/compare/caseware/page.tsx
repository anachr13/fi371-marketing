// Server entry for /compare/caseware. UNFINISHED page — deliberately kept out
// of search engines and AI results (noindex, nofollow) and out of the sitemap
// until it's ready. Still reachable by direct link for internal preview.
// Updated 2026-05-23.

import type { Metadata } from "next";
import CasewareContent from "./CasewareContent";

export const metadata: Metadata = {
  title: "Fi371 vs Caseware",
  description:
    "Fi371's AI-native audit platform compared to Caseware — adaptive onboarding, AI-assisted drafting, exception-based review, and crypto-ready workflows.",
  // Not ready for public discovery: keep it out of Google, Bing, and AI engines.
  robots: { index: false, follow: false },
};

export default function CompareCasewarePage() {
  return <CasewareContent />;
}
