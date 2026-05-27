"use client";
// The scrolling feed. Server passes the first batch + initial cursor; this component appends
// more from /api/news/list when the sentinel nears the viewport. Groups by day; on the first
// (unfiltered) day group it promotes the highest-importance item to a full-width feature.

import { useCallback, useEffect, useRef, useState } from "react";
import NewsCard from "./NewsCard";
import { groupByDay, type NewsItem, type NewsCategorySlug } from "@/lib/news";

export default function NewsFeed({
  initialItems,
  initialCursor,
  category,
  todayKey,
  yesterdayKey,
}: {
  initialItems: NewsItem[];
  initialCursor: string | null;
  category: NewsCategorySlug | null;
  todayKey: string;
  yesterdayKey: string;
}) {
  const [items, setItems] = useState<NewsItem[]>(initialItems);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !cursor) return;
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams();
      params.set("cursor", cursor);
      if (category) params.set("category", category);
      const res = await fetch(`/api/news/list?${params.toString()}`);
      if (!res.ok) throw new Error("bad status");
      const data = (await res.json()) as { items: NewsItem[]; nextCursor: string | null };
      setItems((prev) => [...prev, ...data.items]);
      setCursor(data.nextCursor);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, category]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "600px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  if (items.length === 0) {
    return (
      <p className="text-[19px] text-muted-foreground">No stories yet — check back soon.</p>
    );
  }

  const groups = groupByDay(items, todayKey, yesterdayKey);

  return (
    <div>
      {groups.map((group, gi) => {
        const firstUnfiltered = gi === 0 && !category;
        let featured: NewsItem | null = null;
        let rest = group.items;
        if (firstUnfiltered && group.items.length > 0) {
          featured = group.items.reduce((a, b) =>
            (b.importance ?? -1) > (a.importance ?? -1) ? b : a
          );
          rest = group.items.filter((it) => it.id !== featured!.id);
        }
        return (
          <section key={group.key} className="mb-12">
            <h2 className="font-mono text-[12px] tracking-[0.08em] uppercase text-muted-foreground mb-5 flex items-center gap-3 after:content-[''] after:flex-1 after:h-px after:bg-border">
              {group.label}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured && (
                <div className="sm:col-span-2 lg:col-span-3">
                  <NewsCard item={featured} featured />
                </div>
              )}
              {rest.map((it) => (
                <NewsCard key={it.id} item={it} />
              ))}
            </div>
          </section>
        );
      })}

      {cursor && <div ref={sentinelRef} aria-hidden className="h-1" />}
      {loading && (
        <p className="font-mono text-[13px] text-muted-foreground text-center py-8">Loading…</p>
      )}
      {error && (
        <button
          onClick={loadMore}
          className="block mx-auto font-mono text-[13px] px-5 py-2.5 rounded-full border border-foreground text-foreground"
        >
          Couldn’t load more — tap to retry
        </button>
      )}
      {!cursor && (
        <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground text-center py-10">
          You’re all caught up
        </p>
      )}
    </div>
  );
}
