"use client";

// Client-rendered About page body — owns the demo modal state so the Contact
// link in the footer (and Book Demo button in the header) can open it.

import { useState } from "react";
import Link from "next/link";
import DemoModal from "@/components/site/DemoModal";
import SiteFooter from "@/components/site/SiteFooter";

export default function AboutContent() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="max-w-[1500px] mx-auto px-8 h-20 flex items-center justify-between">
          <Link href="/" className="font-semibold text-2xl tracking-tight">Fi371</Link>
          <nav className="hidden md:flex items-center gap-10">
            <Link href="/" className="text-[17px] font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <button onClick={() => setDemoOpen(true)} className="px-5 py-2.5 bg-primary text-primary-foreground text-base font-semibold rounded-lg hover:opacity-90 transition-opacity">Book Demo</button>
          </nav>
        </div>
      </header>

      <main className="pt-40 pb-[120px]">
        <article className="max-w-[760px] mx-auto px-8">
          <div className="font-mono text-[15px] font-medium tracking-[0.08em] text-muted-foreground uppercase mb-5">
            About
          </div>
          <h1 className="font-display text-[60px] leading-[1.1] tracking-tight mb-12">
            The story behind Fi371
          </h1>

          <div className="text-[19px] leading-relaxed flex flex-col gap-10 text-muted-foreground">
            <p className="text-foreground">
              Most people think a financial year is simple:
              <br />
              <span className="text-muted-foreground">365 days.</span>
              <br />
              <span className="text-muted-foreground">Start. End. Repeat.</span>
            </p>

            <p>
              But professionals inside finance and audit know that reality is different.
            </p>

            <p>
              Many organizations operate on structured fiscal calendars built around operational weeks. Over time, the calendar drifts. To realign reporting periods, an additional week is occasionally added &mdash; creating a{" "}
              <strong className="text-foreground font-semibold">371-day fiscal year</strong>.
            </p>

            <p>
              It&apos;s a small detail.
              <br />
              Almost invisible to outsiders.
            </p>

            <p>
              But to the people who truly understand financial systems, it represents something important:
            </p>

            <ul className="list-none flex flex-col gap-3 border-l border-border pl-8 text-foreground">
              <li>precision over assumptions</li>
              <li>structure behind complexity</li>
              <li>the hidden mechanics that keep organizations aligned</li>
            </ul>

            <p className="font-display text-[40px] leading-tight text-foreground tracking-tight mt-4">
              Fi371 was built from that idea.
            </p>

            <p>
              The name reflects a mindset:
              <br />
              <span className="text-foreground">seeing what others overlook.</span>
            </p>

            <p>
              Not surface-level automation.
              <br />
              Not generic software.
            </p>

            <p>
              But a deeper system designed for professionals who care about accuracy, traceability, and intelligent workflows.
            </p>

            <div>
              <p className="mb-4">The &ldquo;Fi&rdquo; can stand for:</p>
              <ul className="list-none flex flex-col gap-2 border-l border-border pl-8 text-foreground">
                <li>Financial Intelligence</li>
                <li>Fiscal Integrity</li>
                <li>Financial Infrastructure</li>
                <li className="text-muted-foreground italic">or simply: Finance, evolved</li>
              </ul>
            </div>

            <p>
              And <strong className="text-foreground font-semibold">371</strong> becomes a quiet signal to those who understand the industry.
            </p>

            <div className="border-t border-border pt-10 text-foreground">
              <p>
                A hidden detail.
                <br />
                An insider code.
                <br />
                A reminder that the best systems are built by people who notice what others miss.
              </p>
            </div>
          </div>

          <div className="mt-20 flex flex-wrap gap-5">
            <button onClick={() => setDemoOpen(true)} className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity">
              Book Demo
            </button>
            <Link href="/" className="px-6 py-3 border-2 border-foreground font-semibold rounded-lg hover:bg-foreground hover:text-background transition-colors">
              Back to home
            </Link>
          </div>
        </article>
      </main>

      <SiteFooter onOpenDemo={() => setDemoOpen(true)} />

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
