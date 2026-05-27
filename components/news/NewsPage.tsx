"use client";
// Client shell for /news: shared header/footer + demo modal (Contact = Book Demo, per
// project convention), the page heading, the category filter, and the infinite-scroll feed.

import { useState } from "react";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import DemoModal from "@/components/site/DemoModal";
import CategoryFilter from "./CategoryFilter";
import NewsFeed from "./NewsFeed";
import { categoryLabel, type NewsItem, type NewsCategorySlug } from "@/lib/news";

export default function NewsPage({
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
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader onOpenDemo={() => setDemoOpen(true)} />

      <main className="pt-32 pb-[120px]">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="font-mono text-[13px] tracking-[0.1em] uppercase text-muted-foreground mb-4">
            Fi371 · Updated daily · curated from trusted sources
          </div>
          <h1 className="font-display text-[clamp(44px,7vw,72px)] leading-[1.0] tracking-tight mb-4">
            Audit Pulse
          </h1>
          <p className="text-[19px] text-muted-foreground leading-relaxed mb-8 max-w-[620px]">
            The biggest stories in audit, accounting, AI, and assurance — gathered every
            morning, so you don’t have to check dozens of sites.
            {category ? ` Showing: ${categoryLabel(category)}.` : ""}
          </p>

          <CategoryFilter active={category} />

          <div className="mt-8">
            <NewsFeed
              initialItems={initialItems}
              initialCursor={initialCursor}
              category={category}
              todayKey={todayKey}
              yesterdayKey={yesterdayKey}
            />
          </div>
        </div>
      </main>

      <SiteFooter onOpenDemo={() => setDemoOpen(true)} />
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
