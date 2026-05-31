// About page for Fi371 — narrative origin story.

import type { Metadata } from "next";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "About — Fi371",
  description:
    "The story behind Fi371. A 371-day fiscal year, the hidden mechanics of finance, and why we built a system for professionals who notice what others miss.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <AboutContent />;
}
