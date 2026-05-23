// Server entry for the homepage. Owns the canonical URL and server-rendered
// FAQPage structured data; the interactive UI lives in HomeContent. Title and
// Open Graph are inherited from the root layout. Created 2026-05-23.

import type { Metadata } from "next";
import HomeContent from "./HomeContent";
import JsonLd from "@/components/seo/JsonLd";
import { homeFaqs } from "./home-faqs";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// FAQPage built from the same data the page renders (see ./home-faqs).
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homeFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <HomeContent />
    </>
  );
}
