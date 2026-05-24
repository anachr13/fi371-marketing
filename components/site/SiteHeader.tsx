"use client";
// Shared fixed site header for blog pages. The logo is a two-part wordmark
// (Ahrefs-style): "Fi371" links to the main site home; "blog" links to /blog.
// Hovering "Fi371" morphs the second word to "com" — a visual cue that it goes
// to fi371.com. onOpenDemo lets the parent own the demo modal. Created 2026-05-23.

import { useState } from "react";
import Link from "next/link";

export default function SiteHeader({ onOpenDemo }: { onOpenDemo: () => void }) {
  const [homeHover, setHomeHover] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-[1500px] mx-auto px-8 h-20 flex items-center justify-between">
        {/* Two-part logo: Fi371 (→ home) + blog (→ /blog); hovering Fi371 shows "com". */}
        <div className="flex items-baseline gap-1.5 text-2xl tracking-tight select-none">
          <Link
            href="/"
            title="Go to fi371.com"
            onMouseEnter={() => setHomeHover(true)}
            onMouseLeave={() => setHomeHover(false)}
            className="font-semibold text-foreground hover:opacity-80 transition-opacity"
          >
            Fi371
          </Link>
          {homeHover ? (
            <span aria-hidden className="font-semibold text-muted-foreground">
              com
            </span>
          ) : (
            <Link
              href="/blog"
              title="The Fi371 blog"
              className="font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              blog
            </Link>
          )}
        </div>
        <nav className="flex items-center">
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
