"use client";
// Client shell for /news/sources. Structural mirror of NewsPage: shared SiteHeader (which
// already auto-detects /news* paths and shows "News" in the wordmark), the same kicker /
// h1 / intro rhythm, then a grouped list of trusted sources with auto-fetched favicons.

import Image from "next/image";
import SiteHeader from "@/components/site/SiteHeader";
import { useDemoModal } from "@/components/site/DemoModalProvider";
import { faviconUrl, type SourceGroup } from "@/lib/news-sources";

export default function SourcesPage({
  groups,
  totalCount,
}: {
  groups: SourceGroup[];
  totalCount: number;
}) {
  const { open: openDemo } = useDemoModal();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader onOpenDemo={openDemo} />

      <main className="pt-32 pb-[120px]">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="font-mono text-[13px] tracking-[0.1em] uppercase text-muted-foreground mb-4">
            Fi371 · Audit Pulse · {totalCount} trusted sources
          </div>
          <h1 className="font-display text-[clamp(44px,7vw,72px)] leading-[1.0] tracking-tight mb-4">
            Trusted sources
          </h1>
          <p className="text-[19px] text-muted-foreground leading-relaxed mb-16 max-w-[620px]">
            Audit Pulse pulls every morning from the publishers, regulators, and standards
            bodies that shape the audit and accounting profession. No press-release wires,
            no SEO blogs — only sources we trust to be accurate, timely, and consequential.
          </p>

          <div className="flex flex-col gap-16">
            {groups.map((group) => (
              <section key={group.slug} aria-labelledby={`group-${group.slug}`}>
                <h2
                  id={`group-${group.slug}`}
                  className="font-mono text-[13px] tracking-[0.1em] uppercase text-muted-foreground mb-5 pb-3 border-b border-border"
                >
                  {group.label}
                </h2>

                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {group.sources.map((source) => (
                    <li key={source.homepage}>
                      <a
                        href={source.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Visit ${source.name}`}
                        className="group flex items-center gap-3 min-h-[44px] px-3 py-2.5 rounded-lg hover:bg-card transition-colors outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        <span className="relative h-6 w-6 flex-none rounded-sm overflow-hidden border border-border bg-card">
                          <Image
                            src={faviconUrl(source.domain)}
                            alt=""
                            width={24}
                            height={24}
                            unoptimized
                            className="object-contain"
                          />
                        </span>
                        <span className="text-[15px] text-foreground group-hover:underline underline-offset-4 decoration-muted-foreground">
                          {source.name}
                        </span>
                        <span
                          aria-hidden
                          className="ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity text-[13px]"
                        >
                          ↗
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
