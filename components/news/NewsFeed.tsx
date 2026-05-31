"use client";
// The infinite-scrolling feed. Single column of identical cards, grouped by day. The
// server passes the first batch + initial cursor; we append from /api/news/list as the
// sentinel nears the viewport. No more featured-promotion — every card is equal.

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
      {groups.map((group) => (
        <section key={group.key} className="mb-12">
          <h2 className="font-display text-[26px] leading-[1.15] tracking-[-0.005em] text-foreground mb-4 flex items-center gap-3 after:content-[''] after:flex-1 after:h-px after:bg-border">
            {group.label}
          </h2>
          <div>
            {group.items.map((it) => (
              <NewsCard key={it.id} item={it} />
            ))}
          </div>
        </section>
      ))}

      {cursor && <div ref={sentinelRef} aria-hidden className="h-1" />}
      <div role="status" aria-live="polite">
        {loading && (
          <p className="font-mono text-[13px] text-muted-foreground text-center py-8">Loading…</p>
        )}
        {error && (
          <button
            onClick={loadMore}
            className="mx-auto flex w-fit items-center justify-center min-h-[44px] font-mono text-[13px] px-6 rounded-full border border-foreground text-foreground outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Couldn’t load more — tap to retry
          </button>
        )}
        {!cursor && (
          <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground text-center py-10">
            You’re all caught up 🎉
          </p>
        )}
      </div>
    </div>
  );
}
