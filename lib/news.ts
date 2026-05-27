// Shared, client-safe vocabulary + view helpers for Audit Pulse. Single source of truth for
// the category/media-type sets, the NewsItem shape, and day-grouping. NO server/Supabase
// imports here — this file is bundled into client components. DB reads live in lib/news.server.ts.

export const MEDIA_TYPES = ["article", "video", "report", "podcast", "other"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

// Order here is the order the filter chips render in.
export const NEWS_CATEGORY_SLUGS = [
  "ai-in-audit",
  "regulation-standards",
  "sustainability",
  "markets-big4",
  "audit-tech",
  "security-governance",
] as const;
export type NewsCategorySlug = (typeof NEWS_CATEGORY_SLUGS)[number];

export const NEWS_CATEGORIES: { slug: NewsCategorySlug; label: string }[] = [
  { slug: "ai-in-audit", label: "AI in Audit" },
  { slug: "regulation-standards", label: "Regulation & Standards" },
  { slug: "sustainability", label: "Sustainability" },
  { slug: "markets-big4", label: "Markets & Big 4" },
  { slug: "audit-tech", label: "Audit Tech" },
  { slug: "security-governance", label: "Security & Governance" },
];

export function categoryLabel(slug: string): string {
  return NEWS_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export function isNewsCategorySlug(value: string): value is NewsCategorySlug {
  return (NEWS_CATEGORY_SLUGS as readonly string[]).includes(value);
}

// Client-facing item (camelCase). Mirrors a public news_items row (without `hidden`).
export type NewsItem = {
  id: string;
  publishedAt: string; // ISO 8601 (UTC)
  title: string;
  summary: string;
  url: string;
  sourceName: string;
  mediaType: MediaType;
  category: NewsCategorySlug;
  imageUrl: string | null;
  isAiRelated: boolean;
  importance: number | null;
};

export type NewsPageResult = { items: NewsItem[]; nextCursor: string | null };

export const PAGE_SIZE = 24;

// --- Day grouping for the feed ---
export type NewsDayGroup = { key: string; label: string; items: NewsItem[] };

// "today"/"yesterday" reference keys are passed in (computed once on the server) so server
// render and client hydration agree even across a midnight boundary.
export function todayUtcKey(): string {
  return new Date().toISOString().slice(0, 10);
}
export function yesterdayUtcKey(): string {
  return new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
}

export function dayLabel(yyyyMmDd: string, todayKey: string, yesterdayKey: string): string {
  if (yyyyMmDd === todayKey) return "Today";
  if (yyyyMmDd === yesterdayKey) return "Yesterday";
  return new Date(`${yyyyMmDd}T00:00:00Z`).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

// Group items by UTC calendar day, newest day first, preserving order within a day.
export function groupByDay(
  items: NewsItem[],
  todayKey: string,
  yesterdayKey: string
): NewsDayGroup[] {
  const groups: NewsDayGroup[] = [];
  const byKey = new Map<string, NewsDayGroup>();
  for (const item of items) {
    const key = item.publishedAt.slice(0, 10); // YYYY-MM-DD (ISO is UTC)
    let group = byKey.get(key);
    if (!group) {
      group = { key, label: dayLabel(key, todayKey, yesterdayKey), items: [] };
      byKey.set(key, group);
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}
