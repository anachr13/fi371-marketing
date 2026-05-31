"use client";
// Blog index UI: shared header/footer + demo modal, a page title, and a list of
// article cards linking to each post. Styling mirrors the editorial design
// system (DESIGN.md). Created 2026-05-23.

import Link from "next/link";
import SiteHeader from "@/components/site/SiteHeader";
import { useDemoModal } from "@/components/site/DemoModalProvider";
import type { BlogPost } from "@/lib/blog";

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

export default function BlogIndex({ posts }: { posts: BlogPost[] }) {
  const { open: openDemo } = useDemoModal();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader onOpenDemo={openDemo} />

      <main className="pt-40 pb-[120px]">
        <div className="max-w-[860px] mx-auto px-8">
          <div className="font-mono text-[15px] font-medium tracking-[0.08em] text-muted-foreground uppercase mb-5">
            Insights
          </div>
          <h1 className="font-display text-[clamp(40px,7vw,64px)] leading-[1.08] tracking-tight mb-6">
            The Fi371 blog
          </h1>
          <p className="text-[21px] text-muted-foreground leading-relaxed mb-16 max-w-[640px]">
            Practical thinking on modern, AI-native auditing &mdash; from
            crypto engagements to keeping the auditor in control.
          </p>

          {posts.length === 0 ? (
            <p className="text-[19px] text-muted-foreground">Articles coming soon.</p>
          ) : (
            <div className="flex flex-col">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block py-8 border-t border-border hover:border-muted-foreground transition-colors"
                >
                  <div className="font-mono text-[13px] tracking-[0.06em] uppercase text-muted-foreground mb-3 flex flex-wrap gap-3">
                    <span>{post.category}</span>
                    <span aria-hidden>&middot;</span>
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <span aria-hidden>&middot;</span>
                    <span>{post.readingMinutes} min read</span>
                  </div>
                  <h2 className="font-display text-[32px] leading-tight tracking-tight mb-3 text-foreground group-hover:underline underline-offset-[6px] decoration-2 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-[18px] text-muted-foreground leading-relaxed max-w-[680px]">
                    {post.description}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

    </div>
  );
}
