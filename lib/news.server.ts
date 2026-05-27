// SERVER-ONLY. Supabase reads + keyset cursor for Audit Pulse. Do NOT import from client
// components (it pulls in the service-role Supabase client + Node Buffer).

import { createServerSupabaseClient } from "@/lib/supabase";
import {
  PAGE_SIZE,
  type NewsItem,
  type NewsCategorySlug,
  type NewsPageResult,
} from "@/lib/news";

const SELECT_COLUMNS =
  "id, published_at, title, summary, url, source_name, media_type, category, image_url, is_ai_related, importance";

type NewsRow = {
  id: string;
  published_at: string;
  title: string;
  summary: string;
  url: string;
  source_name: string;
  media_type: NewsItem["mediaType"];
  category: NewsCategorySlug;
  image_url: string | null;
  is_ai_related: boolean;
  importance: number | null;
};

function rowToItem(row: NewsRow): NewsItem {
  return {
    id: row.id,
    publishedAt: new Date(row.published_at).toISOString(), // normalise to ...Z (URL-safe cursor)
    title: row.title,
    summary: row.summary,
    url: row.url,
    sourceName: row.source_name,
    mediaType: row.media_type,
    category: row.category,
    imageUrl: row.image_url,
    isAiRelated: row.is_ai_related,
    importance: row.importance,
  };
}

// --- Keyset cursor (published_at + id) for stable infinite scroll ---
export type Cursor = { publishedAt: string; id: string };

export function encodeCursor(item: NewsItem): string {
  return Buffer.from(`${item.publishedAt}|${item.id}`, "utf8").toString("base64url");
}

export function decodeCursor(raw: string): Cursor | null {
  try {
    const decoded = Buffer.from(raw, "base64url").toString("utf8");
    const sep = decoded.indexOf("|");
    if (sep < 0) return null;
    const publishedAt = decoded.slice(0, sep);
    const id = decoded.slice(sep + 1);
    if (!publishedAt || !id) return null;
    return { publishedAt, id };
  } catch {
    return null;
  }
}

// One page of visible items, newest first, optional category filter, continuing after a
// keyset cursor. Used by the server page (first batch) and the list API (subsequent batches).
export async function getNewsPage(opts: {
  category?: NewsCategorySlug | null;
  cursor?: Cursor | null;
  limit?: number;
}): Promise<NewsPageResult> {
  const limit = Math.min(opts.limit ?? PAGE_SIZE, 50);
  const supabase = createServerSupabaseClient();

  let query = supabase
    .from("news_items")
    .select(SELECT_COLUMNS)
    .eq("hidden", false)
    .order("published_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);

  if (opts.category) query = query.eq("category", opts.category);

  if (opts.cursor) {
    // Tuple compare: published_at < X OR (published_at = X AND id < Y).
    const { publishedAt, id } = opts.cursor;
    query = query.or(
      `published_at.lt.${publishedAt},and(published_at.eq.${publishedAt},id.lt.${id})`
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("getNewsPage error:", JSON.stringify(error, null, 2));
    throw new Error("Failed to load news");
  }

  const items = (data as NewsRow[]).map(rowToItem);
  const nextCursor =
    items.length === limit ? encodeCursor(items[items.length - 1]) : null;
  return { items, nextCursor };
}

// --- Admin reads/writes (include hidden items) ---
export type AdminNewsItem = NewsItem & { hidden: boolean };

export async function getAdminRecentItems(limit = 100): Promise<AdminNewsItem[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("news_items")
    .select(SELECT_COLUMNS + ", hidden")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("getAdminRecentItems error:", JSON.stringify(error, null, 2));
    throw new Error("Failed to load admin news");
  }
  // Cast via unknown: a concatenated (non-literal) select string makes supabase-js infer
  // GenericStringError[], so we assert the real shape explicitly.
  return (data as unknown as (NewsRow & { hidden: boolean })[]).map((r) => ({
    ...rowToItem(r),
    hidden: r.hidden,
  }));
}

export async function setHidden(id: string, hidden: boolean): Promise<void> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from("news_items").update({ hidden }).eq("id", id);
  if (error) {
    console.error("setHidden error:", JSON.stringify(error, null, 2));
    throw new Error("Failed to update item");
  }
}
