// Server entry for /news ("Audit Pulse"). Fully public. Owns SEO metadata + the CollectionPage
// / ItemList JSON-LD, fetches the first batch (server-rendered for SEO), and hands off to the
// client shell. force-dynamic so the page always reflects the latest DB (ingest needs no
// revalidate hook). Empty -> noindex, mirroring the blog index.

import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import NewsPage from "@/components/news/NewsPage";
import { getNewsPage } from "@/lib/news.server";
import {
  isNewsCategorySlug,
  categoryLabel,
  todayUtcKey,
  yesterdayUtcKey,
  type NewsCategorySlug,
} from "@/lib/news";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

type SearchParams = { category?: string };

function resolveCategory(sp: SearchParams): NewsCategorySlug | null {
  return sp.category && isNewsCategorySlug(sp.category) ? sp.category : null;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const category = resolveCategory(sp);
  const description =
    "The biggest daily stories in financial audit, accounting, AI in audit, regulation, sustainability assurance, audit technology, and governance — curated from trusted sources.";
  const title = category
    ? `${categoryLabel(category)} — Audit Pulse | ${SITE_NAME}`
    : `Audit Pulse — audit & accounting news, daily | ${SITE_NAME}`;
  const canonical = category ? `/news?category=${category}` : "/news";

  // Keep an empty page out of search until it has content (mirrors the blog index).
  const { items } = await getNewsPage({ category, limit: 1 });
  const robots = items.length === 0 ? { index: false, follow: true } : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: "website", title, description, url: canonical },
    ...(robots ? { robots } : {}),
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const category = resolveCategory(sp);
  const { items, nextCursor } = await getNewsPage({ category });
  const todayKey = todayUtcKey();
  const yesterdayKey = yesterdayUtcKey();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Audit Pulse",
    url: `${SITE_URL}/news`,
    description: "Daily curated audit & accounting news.",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.slice(0, 20).map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "NewsArticle",
          headline: it.title,
          url: it.url,
          datePublished: it.publishedAt,
          ...(it.imageUrl ? { image: it.imageUrl } : {}),
        },
      })),
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <NewsPage
        initialItems={items}
        initialCursor={nextCursor}
        category={category}
        todayKey={todayKey}
        yesterdayKey={yesterdayKey}
      />
    </>
  );
}
