// Survey page for /survey/240526 — AI-in-audit market research.

import type { Metadata } from "next";
import SurveyContent from "./SurveyContent";

export const metadata: Metadata = {
  title: "AI in Audit — 2026 Research Survey | Fi371",
  description:
    "A 3-minute research survey for audit and accounting professionals: how firms use AI today, where time is lost in the audit, and what they want automated. Shape what Fi371 builds.",
  alternates: { canonical: "/survey/240526" },
  robots: { index: true, follow: true },
};

export default function SurveyPage() {
  return <SurveyContent />;
}
