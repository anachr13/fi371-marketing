"use client";
// Shared marketing footer. Rendered by app/(site)/layout.tsx for every page in
// the (site) route group. Contact opens the Book Demo modal via the
// DemoModalProvider context — no prop drilling. Updated 2026-05-31.

import Link from "next/link";
import { useDemoModal } from "./DemoModalProvider";

export default function SiteFooter() {
  const { open: openDemo } = useDemoModal();
  const linkClass =
    "text-base text-muted-foreground hover:text-foreground transition-colors";
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border py-10">
      <div className="max-w-[1500px] mx-auto px-8 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between sm:items-center">
        <span className="text-base text-muted-foreground">
          &copy; {year} Fi371. All rights reserved.
        </span>
        <div className="flex flex-wrap gap-6 sm:gap-8">
          <Link href="/about" className={linkClass}>
            About
          </Link>
          <Link href="/news" className={linkClass}>
            News
          </Link>
          <Link href="/blog" className={linkClass}>
            Blog
          </Link>
          <Link href="/privacy" className={linkClass}>
            Privacy
          </Link>
          <Link href="/terms" className={linkClass}>
            Terms
          </Link>
          <button onClick={openDemo} className={`${linkClass} cursor-pointer text-left`}>
            Contact
          </button>
        </div>
      </div>
    </footer>
  );
}
