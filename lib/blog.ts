// Blog post registry — single source of truth for the /blog index and the
// sitemap. Each article is a hand-built server page under app/blog/<slug>/;
// this list drives the index listing and sitemap URLs. Created 2026-05-23.

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string; // ISO publish date
  readingMinutes: number;
};

/** Published articles, newest first. Add an entry when a new article ships. */
export const blogPosts: BlogPost[] = [
  {
    slug: "crypto-audit-guide",
    title: "A Practical Guide to Crypto & Digital-Asset Audits",
    description:
      "How audit firms can approach crypto and digital-asset engagements: the new risks, the evidence to gather, and a repeatable workflow from onboarding to opinion.",
    category: "Crypto audit",
    date: "2026-05-23",
    readingMinutes: 9,
  },
];

/** Look up a single post by slug (used by article pages for shared metadata). */
export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
