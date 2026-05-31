"use client";
// One Medium-style story card. Top to bottom: publisher row (logo + name + optional
// author) → label chips (media type + AI flag, category) → 26px Instrument Serif title
// → summary. Optional article image sits to the right on ≥640px, stacks below on mobile.
// Whole card is the link target. Missing publisher logo falls back to a first-letter
// circle so the alignment stays consistent. Chartreuse (bg-primary) on the media chip is
// reserved for AI items per DESIGN.md.

import Image from "next/image";
import { useState } from "react";
import { categoryLabel, type NewsItem } from "@/lib/news";

const MEDIA_LABEL: Record<NewsItem["mediaType"], string> = {
  article: "Article",
  report: "Report",
  video: "Video",
  podcast: "Podcast",
  other: "Link",
};

function PublisherLogo({ src, name }: { src: string | null; name: string }) {
  const [errored, setErrored] = useState(false);
  if (src && !errored) {
    return (
      // Plain <img>: publisher logos come from many domains; keeping them out of next/image
      // avoids a remotePatterns allowlist explosion. They render at 22px, so optimization
      // doesn't meaningfully matter.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        aria-hidden="true"
        width={22}
        height={22}
        onError={() => setErrored(true)}
        className="h-[22px] w-[22px] flex-none rounded-full border border-border object-cover bg-card"
      />
    );
  }
  const letter = (name.trim().charAt(0) || "·").toUpperCase();
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full border border-border bg-card text-[11px] font-bold text-foreground"
    >
      {letter}
    </span>
  );
}

export default function NewsCard({ item }: { item: NewsItem }) {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(item.imageUrl) && !imgError;

  return (
    <article className="border-b border-border last:border-b-0">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={item.title}
        className="group flex flex-col gap-4 py-6 sm:flex-row sm:gap-8 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="min-w-0 flex-1 sm:max-w-[640px]">
          {/* Publisher row */}
          <div className="mb-2.5 flex items-center gap-2 text-[14px]">
            <PublisherLogo src={item.sourceLogoUrl} name={item.sourceName} />
            <span className="text-muted-foreground">
              In <span className="font-medium text-foreground">{item.sourceName}</span>
              {item.authorName ? (
                <>
                  {" "}by <span className="text-foreground">{item.authorName}</span>
                </>
              ) : null}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display text-[26px] leading-[1.15] tracking-[-0.005em] mb-2 text-foreground group-hover:underline underline-offset-4">
            {item.title}
          </h3>

          {/* Summary */}
          <p className="text-[16px] leading-relaxed text-muted-foreground mb-3">
            {item.summary}
          </p>

          {/* Label row */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`font-mono text-[11px] uppercase tracking-[0.05em] px-2 py-0.5 rounded border ${
                item.isAiRelated
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border"
              }`}
            >
              {item.isAiRelated ? "AI · " : ""}{MEDIA_LABEL[item.mediaType]}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.05em] px-2 py-0.5 rounded border bg-background text-muted-foreground border-border">
              {categoryLabel(item.category)}
            </span>
          </div>
        </div>

        {showImage && (
          <div className="relative h-[180px] w-full flex-none overflow-hidden rounded border border-border sm:h-[134px] sm:w-[200px]">
            <Image
              src={item.imageUrl as string}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, 200px"
              className="object-cover saturate-[0.8] brightness-[0.96] transition-[filter] duration-200 group-hover:saturate-100 group-hover:brightness-100"
              onError={() => setImgError(true)}
            />
          </div>
        )}
      </a>
    </article>
  );
}
