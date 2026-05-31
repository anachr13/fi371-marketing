"use client";

// Shared layout for static legal pages (Privacy, Terms). Owns the demo modal
// state so the Contact link in the footer can open it from any legal page.

import { ReactNode } from "react";
import Link from "next/link";
import { useDemoModal } from "./DemoModalProvider";

interface LegalPageProps {
  title: string;
  effectiveDate: string;
  intro?: ReactNode;
  children: ReactNode;
}

export default function LegalPage({ title, effectiveDate, intro, children }: LegalPageProps) {
  const { open: openDemo } = useDemoModal();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="max-w-[1500px] mx-auto px-8 h-20 flex items-center justify-between">
          <Link href="/" className="font-semibold text-2xl tracking-tight">Fi371</Link>
          <nav className="hidden md:flex items-center gap-10">
            <button onClick={openDemo} className="px-5 py-2.5 bg-primary text-primary-foreground text-base font-semibold rounded-lg hover:opacity-90 transition-opacity">Book Demo</button>
          </nav>
        </div>
      </header>

      <main className="pt-40 pb-[120px]">
        <article className="max-w-[760px] mx-auto px-8">
          <div className="font-mono text-[15px] font-medium tracking-[0.08em] text-muted-foreground uppercase mb-5">
            Effective {effectiveDate}
          </div>
          <h1 className="font-display text-[60px] leading-[1.1] tracking-tight mb-10">{title}</h1>
          {intro && (
            <div className="text-[19px] text-muted-foreground leading-relaxed mb-12">{intro}</div>
          )}
          <div className="flex flex-col gap-12 text-[17px] leading-relaxed">
            {children}
          </div>
        </article>
      </main>

    </div>
  );
}
