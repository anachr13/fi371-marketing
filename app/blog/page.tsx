// Server entry for /blog — the article index. Owns metadata + canonical; the
// interactive listing UI lives in BlogIndex. Created 2026-05-23.

import type { Metadata } from "next";
import BlogIndex from "@/components/blog/BlogIndex";
import { blogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Fi371",
  description:
    "Practical thinking on modern, AI-native auditing — crypto and digital-asset engagements, audit automation, and keeping the auditor in control.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return <BlogIndex posts={blogPosts} />;
}
