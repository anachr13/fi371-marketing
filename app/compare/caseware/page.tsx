// Server entry for /compare/caseware — Fi371's highest-intent SEO/GEO page
// ("Caseware alternative" / "Fi371 vs Caseware"). Owns metadata + structured
// data (the interactive UI lives in CasewareContent). Created 2026-05-23.

import type { Metadata } from "next";
import CasewareContent from "./CasewareContent";
import JsonLd from "@/components/seo/JsonLd";
import { casewareFaqs } from "./faqs";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const TITLE = "Fi371 vs Caseware: AI-Native Audit Automation Alternative";
const DESCRIPTION =
  "How Fi371's AI-native audit platform compares to Caseware: adaptive onboarding, AI-assisted drafting, exception-based review, traceable AI, and crypto-ready workflows.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/compare/caseware" },
  openGraph: {
    type: "website",
    url: "/compare/caseware",
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
};

// FAQPage (built from the same data the page renders) + BreadcrumbList.
// FAQ rich results need schema text to match visible text — guaranteed here
// because both read from ./faqs.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      mainEntity: casewareFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        {
          "@type": "ListItem",
          position: 2,
          name: "Fi371 vs Caseware",
          item: `${SITE_URL}/compare/caseware`,
        },
      ],
    },
  ],
};

export default function CompareCasewarePage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <CasewareContent />
    </>
  );
}
