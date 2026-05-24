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

/** Published articles, newest first. Populated as articles ship from the
 *  content calendar / n8n pipeline. Empty for now (the hand-written crypto
 *  draft was removed — content should not default to a crypto angle). */
export const blogPosts: BlogPost[] = [];

/** Look up a single post by slug (used by article pages for shared metadata). */
export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
