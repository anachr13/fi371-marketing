"use client";
// Shared site footer for marketing pages. Takes an onOpenDemo callback so the
// parent owns the demo modal state (Contact = Book Demo modal, per project
// convention). In Task 12 this prop is dropped in favour of useDemoModal().
// Created 2026-05-23. Reordered 2026-05-31.

import Link from "next/link";

export default function SiteFooter({ onOpenDemo }: { onOpenDemo: () => void }) {
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
          <button onClick={onOpenDemo} className={`${linkClass} cursor-pointer text-left`}>
            Contact
          </button>
        </div>
      </div>
    </footer>
  );
}
