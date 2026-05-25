// Survey page for /survey/240526 — AI-in-audit market research.

import type { Metadata } from "next";
import { headers } from "next/headers";
import SurveyContent from "./SurveyContent";
import { CODE_TO_COUNTRY } from "@/lib/countries";

export const metadata: Metadata = {
  title: "AI in Audit — 2026 Research Survey | Fi371",
  description:
    "A 3-minute research survey for audit and accounting professionals: how firms use AI today, where time is lost in the audit, and what they want automated. Shape what Fi371 builds.",
  alternates: { canonical: "/survey/240526" },
  robots: { index: true, follow: true },
};

export default async function SurveyPage() {
  // Pre-fill the country from the visitor's location. Vercel sets this header
  // at the edge (uppercase ISO code) — we only read the country, never the IP,
  // so no personal data is stored. Absent locally / off-Vercel, so it safely
  // falls back to an empty (unselected) field.
  const countryCode = (await headers()).get("x-vercel-ip-country");
  const initialCountry = (countryCode && CODE_TO_COUNTRY[countryCode]) || "";

  return <SurveyContent initialCountry={initialCountry} />;
}
