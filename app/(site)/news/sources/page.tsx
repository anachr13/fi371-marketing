// Server entry for /news/sources ("Trusted Sources"). Fully public, fully static — the
// list is a checked-in constant so no DB hit and no revalidation is needed. Emits a
// CollectionPage + ItemList JSON-LD blob so search engines and AI assistants can read
// "these are the publishers Fi371 monitors."

import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import SourcesPage from "@/components/news/SourcesPage";
import { SOURCE_GROUPS, TOTAL_SOURCE_COUNT } from "@/lib/news-sources";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";

const DESCRIPTION =
  "The publishers, regulators, and standards bodies behind Audit Pulse — the trusted sources Fi371 monitors every day for audit, accounting, AI, and assurance news.";

export const metadata: Metadata = {
  title: `Trusted sources — Audit Pulse | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: "/news/sources" },
  openGraph: {
    type: "website",
    title: "Trusted sources — Audit Pulse",
    description: DESCRIPTION,
    url: "/news/sources",
  },
};

export default function Page() {
  // Flatten for ItemList — order across groups is preserved so the structured data
  // mirrors the visual order on the page.
  const flat = SOURCE_GROUPS.flatMap((g) => g.sources);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Trusted sources — Audit Pulse",
    url: `${SITE_URL}/news/sources`,
    description: DESCRIPTION,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: TOTAL_SOURCE_COUNT,
      itemListElement: flat.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: { "@type": "WebSite", name: s.name, url: s.homepage },
      })),
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <SourcesPage groups={SOURCE_GROUPS} totalCount={TOTAL_SOURCE_COUNT} />
    </>
  );
}
