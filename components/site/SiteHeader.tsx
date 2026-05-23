"use client";
// Shared fixed site header for blog pages (logo, nav, Book Demo).
// Takes an onOpenDemo callback so the parent owns the demo modal state.
// Mirrors the About page header styling (DESIGN.md). Created 2026-05-23.

import Link from "next/link";

export default function SiteHeader({ onOpenDemo }: { onOpenDemo: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-[1500px] mx-auto px-8 h-20 flex items-center justify-between">
        <Link href="/" className="font-semibold text-2xl tracking-tight">
          Fi371
        </Link>
        <nav className="hidden md:flex items-center gap-10">
          <Link
            href="/blog"
            className="text-[17px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Blog
          </Link>
          <Link
            href="/"
            className="text-[17px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <button
            onClick={onOpenDemo}
            className="px-5 py-2.5 bg-primary text-primary-foreground text-base font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Book Demo
          </button>
        </nav>
      </div>
    </header>
  );
}
