// XML sitemap (Next 16 MetadataRoute convention) served at /sitemap.xml.
// Lists every indexable marketing page so crawlers and AI bots can discover them.
// Resolves the 404 that public/robots.txt previously pointed to. Created 2026-05-23.

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { blogPosts } from "@/lib/blog";
import { NEWS_CATEGORY_SLUGS } from "@/lib/news";

/**
 * Builds the site's URL list for /sitemap.xml.
 * Priority/changeFrequency reflect business value: home ranks highest; legal
 * pages lowest. Blog URLs appear only once an article is published. The Audit
 * Pulse news index + its category filters update daily.
 * @returns Array of sitemap entries consumed by Next's metadata route.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    // Audit Pulse news index + per-category filter URLs (fresh daily).
    { url: `${SITE_URL}/news`, lastModified, changeFrequency: "daily", priority: 0.8 },
    ...NEWS_CATEGORY_SLUGS.map((slug) => ({
      url: `${SITE_URL}/news?category=${slug}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
    // Blog index + articles — listed only once at least one article exists, so
    // we don't advertise an empty, noindexed blog.
    ...(blogPosts.length > 0
      ? [
          { url: `${SITE_URL}/blog`, lastModified, changeFrequency: "weekly" as const, priority: 0.7 },
          ...blogPosts.map((post) => ({
            url: `${SITE_URL}/blog/${post.slug}`,
            lastModified: new Date(post.date),
            changeFrequency: "monthly" as const,
            priority: 0.7,
          })),
        ]
      : []),
    { url: `${SITE_URL}/about`, lastModified, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE_URL}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
