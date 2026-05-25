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
 *  content calendar / n8n pipeline. Each entry must have a matching hand-built
 *  page at app/blog/<slug>/page.tsx. */
export const blogPosts: BlogPost[] = [
  {
    slug: "shadow-ai-audit-workflows",
    title:
      "AI Is Already Entering Audit Workflows — But Mostly in Unofficial Ways",
    description:
      "Explore how auditors are already experimenting with AI, what Shadow AI means for audit firms, and how teams can move toward safer, more controlled AI workflows.",
    category: "AI in Audit",
    date: "2026-05-25",
    readingMinutes: 6,
  },
];

/** Look up a single post by slug (used by article pages for shared metadata). */
export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
