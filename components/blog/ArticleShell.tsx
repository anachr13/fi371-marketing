"use client";
// Editorial layout for a single blog article: shared header/footer + demo modal,
// a centered reading column with kicker / title / byline, the article body
// (children), and a closing demo CTA. Styling mirrors the About page (DESIGN.md).
// Created 2026-05-23.

import SiteHeader from "@/components/site/SiteHeader";
import { useDemoModal } from "@/components/site/DemoModalProvider";

type Props = {
  category: string;
  title: string;
  date: string; // ISO
  readingMinutes: number;
  children: React.ReactNode;
  /** Optional content rendered after the demo CTA and before the footer
   *  (e.g. a FAQ accordion). Kept in the reading column. */
  belowCta?: React.ReactNode;
};

function formatDate(iso: string) {
  // Format in UTC so date-only ISO strings (parsed as UTC midnight) render the
  // same day for every viewer and don't cause server/client hydration drift.
  return new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function ArticleShell({
  category,
  title,
  date,
  readingMinutes,
  children,
  belowCta,
}: Props) {
  const { open: openDemo } = useDemoModal();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader onOpenDemo={openDemo} />

      <main className="pt-40 pb-[120px]">
        <article className="max-w-[760px] mx-auto px-8">
          <div className="font-mono text-[15px] font-medium tracking-[0.08em] text-muted-foreground uppercase mb-5">
            {category}
          </div>
          <h1 className="font-display text-[clamp(38px,6vw,60px)] leading-[1.1] tracking-tight mb-6">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-[15px] text-muted-foreground mb-12 pb-8 border-b border-border">
            <span>Fi371</span>
            <span aria-hidden>&middot;</span>
            <time dateTime={date}>{formatDate(date)}</time>
            <span aria-hidden>&middot;</span>
            <span>{readingMinutes} min read</span>
          </div>

          {children}

          <div className="mt-16 pt-10 border-t border-border">
            <div className="rounded-2xl border border-primary/20 bg-card p-8">
              <h2 className="font-display text-[30px] leading-tight mb-3">
                See Fi371 on your own engagements
              </h2>
              <p className="text-[17px] text-muted-foreground mb-6">
                An AI-native audit platform for solo, small, and mid-sized firms
                &mdash; from client onboarding to final opinion, faster.
              </p>
              <button
                onClick={openDemo}
                className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Book a demo
              </button>
            </div>
          </div>

          {belowCta}
        </article>
      </main>

    </div>
  );
}
