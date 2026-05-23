// XML sitemap (Next 16 MetadataRoute convention) served at /sitemap.xml.
// Lists every indexable marketing page so crawlers and AI bots can discover them.
// Resolves the 404 that public/robots.txt previously pointed to. Created 2026-05-23.

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Builds the site's URL list for /sitemap.xml.
 * Priority/changeFrequency reflect business value: home and the Caseware
 * comparison rank highest (top search/conversion intent); legal pages lowest.
 * @returns Array of sitemap entries consumed by Next's metadata route.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/compare/caseware`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE_URL}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
