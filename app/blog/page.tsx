// Server entry for /blog — the article index. Owns metadata + canonical; the
// interactive listing UI lives in BlogIndex. While the blog has no articles
// yet, it's marked noindex so search engines don't surface an empty page — this
// lifts automatically once the first article ships. Created 2026-05-23.

import type { Metadata } from "next";
import BlogIndex from "@/components/blog/BlogIndex";
import { blogPosts } from "@/lib/blog";

export function generateMetadata(): Metadata {
  return {
    title: "Blog — Fi371",
    description:
      "Practical thinking on modern, AI-native auditing — audit automation, efficiency, and keeping the auditor in control.",
    alternates: { canonical: "/blog" },
    // Keep the empty index out of search until there's content; auto-indexes
    // once blogPosts has entries.
    ...(blogPosts.length === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default function BlogPage() {
  return <BlogIndex posts={blogPosts} />;
}
