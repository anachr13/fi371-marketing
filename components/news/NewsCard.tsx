"use client";
// One story card. `featured` renders a full-width horizontal layout for the daily top story.
// When an item has an image it renders via next/image; with no image (or on load error) the
// card is text-first with no media well. Chartreuse (bg-primary) badge is reserved for
// AI-related items per DESIGN.md.

import Image from "next/image";
import { useState } from "react";
import { categoryLabel, type NewsItem } from "@/lib/news";

const VERB: Record<NewsItem["mediaType"], string> = {
  article: "Read",
  report: "Read",
  video: "Watch",
  podcast: "Listen",
  other: "Open",
};

const MEDIA_LABEL: Record<NewsItem["mediaType"], string> = {
  article: "Article",
  report: "Report",
  video: "Video",
  podcast: "Podcast",
  other: "Link",
};

export default function NewsCard({
  item,
  featured = false,
}: {
  item: NewsItem;
  featured?: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(item.imageUrl) && !imgError;
  const verb = VERB[item.mediaType];

  const badges = (
    <div className="mb-2 flex flex-wrap items-center gap-1.5">
      <span
        className={`font-mono text-[11px] uppercase tracking-[0.05em] px-2 py-0.5 rounded border ${
          item.isAiRelated
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background text-muted-foreground border-border"
        }`}
      >
        {item.isAiRelated ? "AI · " : ""}{MEDIA_LABEL[item.mediaType]} · {item.sourceName}
      </span>
    </div>
  );

  const meta = (
    <div className="mt-auto flex items-center justify-between pt-3">
      <span className="font-mono text-[11px] text-muted-foreground">
        {categoryLabel(item.category)}
      </span>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center min-h-[44px] font-mono text-[11px] text-foreground underline decoration-muted-foreground underline-offset-4 hover:decoration-foreground transition-colors rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      >
        {verb} →
      </a>
    </div>
  );

  if (featured) {
    return (
      <article className="flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-border bg-card">
        {showImage && (
          <div className="relative h-44 sm:h-auto sm:w-[300px] flex-none border-b sm:border-b-0 sm:border-r border-border">
            <Image
              src={item.imageUrl as string}
              alt={item.title}
              fill
              sizes="300px"
              className="object-cover"
              onError={() => setImgError(true)}
            />
          </div>
        )}
        <div className="flex flex-col p-6">
          {badges}
          <h3 className="font-display text-[26px] leading-[1.1] mb-2">
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="rounded-sm outline-none hover:underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-card">
              {item.title}
            </a>
          </h3>
          <p className="text-[15px] leading-relaxed text-muted-foreground">{item.summary}</p>
          {meta}
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
      {showImage && (
        <div className="relative h-[104px] border-b border-border">
          <Image
            src={item.imageUrl as string}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover"
            onError={() => setImgError(true)}
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-3.5">
        {badges}
        <h3 className="text-[17px] leading-snug mb-1.5">
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="rounded-sm outline-none hover:underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-card">
            {item.title}
          </a>
        </h3>
        <p className="text-[12.5px] leading-relaxed text-muted-foreground line-clamp-3">{item.summary}</p>
        {meta}
      </div>
    </article>
  );
}
