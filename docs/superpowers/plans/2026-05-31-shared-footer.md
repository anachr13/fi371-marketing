# Shared Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One footer component (`SiteFooter`) rendered automatically for every Fi371 marketing page via a Next.js route group + sub-layout, with `DemoModal` centralised behind a React context so the footer's Contact button (and every Book-Demo button on every page) opens the same modal instance.

**Architecture:** New `app/(site)/` route group holds all marketing pages. `app/(site)/layout.tsx` renders `<SiteFooter />` after children. New `DemoModalProvider` lives in `app/providers.tsx`, mounts one `<DemoModal />`, exposes `useDemoModal()`. `SiteFooter` reads from the context. Inline `<footer>` markup on `/`, `/about`, `/privacy`, `/terms` is deleted; `/blog`, `/news`, blog articles stop rendering `<SiteFooter />` themselves.

**Tech Stack:** Next.js 16.2.4 (App Router, route groups, server components), React 19, TypeScript, Tailwind CSS, existing shadcn UI primitives. No new dependencies.

**Source spec:** [docs/superpowers/specs/2026-05-31-shared-footer-design.md](../specs/2026-05-31-shared-footer-design.md).

**Sequencing constraint:** Every commit must leave each in-scope page rendering exactly one footer with working modal. The "cutover" (Task 12) is the only commit where layout-rendered footer and per-page footer rendering coexist in the diff — they swap atomically.

---

## File Map

**New files (3):**
- `app/(site)/layout.tsx` — sub-layout that renders `<SiteFooter />`.
- `components/site/DemoModalProvider.tsx` — client component, mounts `<DemoModal />` once, exposes `useDemoModal()`.

**Modified files (8):**
- `app/providers.tsx` — wrap children in `<DemoModalProvider>`.
- `components/site/SiteFooter.tsx` — reorder links, dynamic year, drop `onOpenDemo` prop, read context.
- `components/blog/ArticleShell.tsx` — drop `useState` for modal, drop `<DemoModal>` mount, drop `<SiteFooter>` render, use context.
- `components/blog/BlogIndex.tsx` — same pattern.
- `components/news/NewsPage.tsx` — same pattern.
- `app/(site)/HomeContent.tsx` (was `app/HomeContent.tsx`) — delete inline `<footer>`, drop local modal state, use context.
- `app/(site)/about/AboutContent.tsx` (was `app/about/AboutContent.tsx`) — same pattern.
- `components/site/LegalPage.tsx` — delete inline `<footer>`, drop local modal state, use context.

**Files relocated by route-group move (no content edits beyond what's listed above):**
- `app/page.tsx` → `app/(site)/page.tsx`
- `app/HomeContent.tsx` → `app/(site)/HomeContent.tsx`
- `app/home-faqs.ts` → `app/(site)/home-faqs.ts`
- `app/about/` (entire folder) → `app/(site)/about/`
- `app/blog/` (entire folder, including `/shadow-ai-audit-workflows/`) → `app/(site)/blog/`
- `app/news/` (entire folder) → `app/(site)/news/`
- `app/privacy/` → `app/(site)/privacy/`
- `app/terms/` → `app/(site)/terms/`

**Untouched:** `app/legacy/`, `app/compare/caseware/`, `app/admin/news/`, `app/survey/240526/`, `components/landing/Footer.tsx`, `components/landing/DemoModal.tsx`, `components/compare/CompareDemoModal.tsx`.

---

## Verification gates (used after every task)

Per project memory (no unit tests in this repo):

- **Lint:** `npm run lint` — must not introduce NEW errors beyond the ~13 baseline shadcn-boilerplate errors that already exist on `main`.
- **Build:** `npm run build` — must succeed (TypeScript gate).
- **Local visual check (after Task 12 and Task 13):** `npm run dev`, then open `/`, `/about`, `/blog`, `/blog/shadow-ai-audit-workflows`, `/news`, `/privacy`, `/terms` and confirm one footer per page with order **About · News · Blog · Privacy · Terms · Contact**. Confirm `/legacy` and `/compare/caseware` are unchanged.

If a task says "verify build passes" and it doesn't, STOP. Diagnose and fix before committing.

---

## Task 1: Branch + baseline check

**Files:** none modified.

- [ ] **Step 1: Confirm clean tree on the worktree branch**

Run:
```bash
git status
git log -1 --oneline
```
Expected: clean tree, last commit is `e7370a4 docs(footer): spec for shared SiteFooter across marketing pages`.

- [ ] **Step 2: Confirm you are on a feature branch (not `main`)**

Run:
```bash
git branch --show-current
```
Expected: any branch name that is NOT `main`. In a Conductor worktree the current branch (e.g. `claude/kind-joliot-bdb559`) already IS the feature branch — no new branch needed. If somehow you are on `main`, STOP and create a feature branch first: `git checkout -b feature/shared-footer`.

- [ ] **Step 3: Capture baseline lint output**

Run:
```bash
npm run lint 2>&1 | tail -20 > /tmp/lint-baseline.txt
cat /tmp/lint-baseline.txt
```
Note the error count — every later "lint" gate must not exceed it.

- [ ] **Step 4: Capture baseline build status**

Run:
```bash
npm run build 2>&1 | tail -30
```
Expected: build succeeds. If it fails on `main`, STOP and surface to the user — this plan assumes a green baseline.

---

## Task 2: Move pages into the `app/(site)/` route group

This task only moves files. No content edits. URLs do not change.

**Files:** all listed moves above.

- [ ] **Step 1: Create the route group folder**

Run:
```bash
mkdir -p "app/(site)"
```
Expected: folder created. The parens in `(site)` are part of the literal folder name — Next.js treats this as a route group and excludes it from URLs.

- [ ] **Step 2: Move home page files**

Run:
```bash
git mv app/page.tsx "app/(site)/page.tsx"
git mv app/HomeContent.tsx "app/(site)/HomeContent.tsx"
git mv app/home-faqs.ts "app/(site)/home-faqs.ts"
```
Expected: `git status` shows three renames (R), no modifications.

- [ ] **Step 3: Move about, blog, news, privacy, terms folders**

Run:
```bash
git mv app/about "app/(site)/about"
git mv app/blog "app/(site)/blog"
git mv app/news "app/(site)/news"
git mv app/privacy "app/(site)/privacy"
git mv app/terms "app/(site)/terms"
```
Expected: `git status` shows folder-wide renames. No file content modifications.

- [ ] **Step 4: Confirm what's left at the app root**

Run:
```bash
ls app/
```
Expected output (in some order): `(site)/  admin/  compare/  layout.tsx  legacy/  providers.tsx  survey/  globals.css` (and any other pre-existing top-level files). Confirm no marketing pages remain at the root.

- [ ] **Step 5: Build to confirm route group works and URLs resolve**

Run:
```bash
npm run build 2>&1 | tail -40
```
Expected: build succeeds. The output should list the same routes as before (`/`, `/about`, `/blog`, `/blog/shadow-ai-audit-workflows`, `/news`, `/privacy`, `/terms`).

- [ ] **Step 6: Lint**

Run:
```bash
npm run lint 2>&1 | tail -20
```
Expected: same baseline error count, no NEW errors.

- [ ] **Step 7: Commit**

Run:
```bash
git commit -m "$(cat <<'EOF'
refactor(site): move marketing pages into (site) route group

Folder-only move. URLs unchanged. Sets up the (site) group so a
shared sub-layout can render the footer for every marketing page
in one place. /legacy, /compare, /admin, /survey stay at the root.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```
Expected: commit created with renames only.

---

## Task 3: Reorder `SiteFooter` links and use dynamic year

**Files:**
- Modify: `components/site/SiteFooter.tsx`

After this task, `/blog`, `/news`, and blog articles immediately show the new link order (they already render `SiteFooter`). Inline-footer pages are unaffected — they don't use `SiteFooter` yet.

- [ ] **Step 1: Replace the link list and year**

Edit `components/site/SiteFooter.tsx`. Replace the entire file with:

```tsx
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
```

- [ ] **Step 2: Build + lint**

Run:
```bash
npm run build 2>&1 | tail -10
npm run lint 2>&1 | tail -10
```
Expected: both pass; no new errors.

- [ ] **Step 3: Commit**

Run:
```bash
git add components/site/SiteFooter.tsx
git commit -m "$(cat <<'EOF'
refactor(footer): reorder links and use dynamic year in SiteFooter

Order is now About · News · Blog · Privacy · Terms · Contact.
Year derives from new Date().getFullYear() instead of being
hardcoded. /blog, /news, and blog articles pick this up
immediately; inline-footer pages get it in Task 4.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Replace inline `<footer>` with `<SiteFooter>` on the three legacy-inline pages

**Goal of this task:** every in-scope page now renders `<SiteFooter />` (still with `onOpenDemo` prop, still with its own `DemoModal` mount). After this task, link order is consistent everywhere; pages still own their modal state — that gets cleaned up in Tasks 6–11.

### Task 4a: `app/(site)/HomeContent.tsx`

**Files:** Modify `app/(site)/HomeContent.tsx`.

- [ ] **Step 1: Add import**

In `app/(site)/HomeContent.tsx`, add this import alongside the existing imports near the top of the file:

```tsx
import SiteFooter from "@/components/site/SiteFooter";
```

- [ ] **Step 2: Replace the inline footer block**

Locate the existing inline footer (currently lines 279–290), which looks like:

```tsx
      {/* Footer */}
      <footer className="border-t border-border py-8 md:py-10">
        <div className="max-w-[1500px] mx-auto px-8 flex flex-col md:flex-row md:justify-between md:items-center gap-6 md:gap-0">
          <span className="text-sm md:text-base text-muted-foreground">&copy; 2026 Fi371. All rights reserved.</span>
          <div className="flex flex-wrap gap-4 md:gap-8">
            <Link href="/about" className="text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link href="/privacy" className="text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            <button onClick={() => setDemoOpen(true)} className="text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Contact</button>
          </div>
        </div>
      </footer>
```

Replace with:

```tsx
      <SiteFooter onOpenDemo={() => setDemoOpen(true)} />
```

- [ ] **Step 3: Build + lint**

Run:
```bash
npm run build 2>&1 | tail -10
npm run lint 2>&1 | tail -10
```
Expected: both pass.

- [ ] **Step 4: Commit**

Run:
```bash
git add "app/(site)/HomeContent.tsx"
git commit -m "$(cat <<'EOF'
refactor(home): use SiteFooter instead of inline footer markup

HomeContent renders <SiteFooter onOpenDemo={...} /> in place of the
inline <footer>. Modal state stays on the page for now; that moves
to context in Task 8.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Task 4b: `app/(site)/about/AboutContent.tsx`

**Files:** Modify `app/(site)/about/AboutContent.tsx`.

- [ ] **Step 1: Add import**

Add to the imports at the top:

```tsx
import SiteFooter from "@/components/site/SiteFooter";
```

- [ ] **Step 2: Replace the inline footer block**

Locate the inline footer (currently lines 124–134):

```tsx
      <footer className="border-t border-border py-10">
        <div className="max-w-[1500px] mx-auto px-8 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between sm:items-center">
          <span className="text-base text-muted-foreground">&copy; 2026 Fi371. All rights reserved.</span>
          <div className="flex gap-8">
            <Link href="/about" className="text-base text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link href="/privacy" className="text-base text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="text-base text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            <button onClick={() => setDemoOpen(true)} className="text-base text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-left">Contact</button>
          </div>
        </div>
      </footer>
```

Replace with:

```tsx
      <SiteFooter onOpenDemo={() => setDemoOpen(true)} />
```

- [ ] **Step 3: Build + lint**

Run:
```bash
npm run build 2>&1 | tail -10
npm run lint 2>&1 | tail -10
```
Expected: both pass.

- [ ] **Step 4: Commit**

Run:
```bash
git add "app/(site)/about/AboutContent.tsx"
git commit -m "$(cat <<'EOF'
refactor(about): use SiteFooter instead of inline footer markup

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

### Task 4c: `components/site/LegalPage.tsx`

This affects both `/privacy` and `/terms` (both render via `LegalPage`).

**Files:** Modify `components/site/LegalPage.tsx`.

- [ ] **Step 1: Add import**

Add to the imports at the top:

```tsx
import SiteFooter from "./SiteFooter";
```

- [ ] **Step 2: Replace the inline footer block**

Locate the inline footer (currently lines 47–57):

```tsx
      <footer className="border-t border-border py-10">
        <div className="max-w-[1500px] mx-auto px-8 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between sm:items-center">
          <span className="text-base text-muted-foreground">&copy; 2026 Fi371. All rights reserved.</span>
          <div className="flex gap-8">
            <Link href="/about" className="text-base text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link href="/privacy" className="text-base text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="text-base text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            <button onClick={() => setDemoOpen(true)} className="text-base text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-left">Contact</button>
          </div>
        </div>
      </footer>
```

Replace with:

```tsx
      <SiteFooter onOpenDemo={() => setDemoOpen(true)} />
```

- [ ] **Step 3: Build + lint**

Run:
```bash
npm run build 2>&1 | tail -10
npm run lint 2>&1 | tail -10
```
Expected: both pass.

- [ ] **Step 4: Manually open `/privacy` and `/terms` in dev to confirm new order renders**

Run:
```bash
npm run dev
```
Open in browser:
- http://localhost:3000/privacy
- http://localhost:3000/terms

Expected: each shows footer with order **About · News · Blog · Privacy · Terms · Contact**. Contact button opens demo modal. Stop dev server (Ctrl+C).

- [ ] **Step 5: Commit**

Run:
```bash
git add components/site/LegalPage.tsx
git commit -m "$(cat <<'EOF'
refactor(legal): use SiteFooter on /privacy and /terms

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Create `DemoModalProvider` and wire it into `Providers`

After this task, the context exists and mounts one `<DemoModal />`, but nothing consumes it yet. Page-level modals continue to work in parallel.

**Files:**
- Create: `components/site/DemoModalProvider.tsx`
- Modify: `app/providers.tsx`

- [ ] **Step 1: Create `DemoModalProvider.tsx`**

Write the new file `components/site/DemoModalProvider.tsx`:

```tsx
"use client";
// Single owner of the Fi371 demo modal. Any descendant calls useDemoModal()
// to open or close the modal; the provider mounts <DemoModal /> exactly once
// so we never get duplicate modals or stale per-page state. Created 2026-05-31.

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import DemoModal from "./DemoModal";

type DemoModalContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const DemoModalContext = createContext<DemoModalContextValue | null>(null);

export function DemoModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  return (
    <DemoModalContext.Provider value={value}>
      {children}
      <DemoModal open={isOpen} onClose={close} />
    </DemoModalContext.Provider>
  );
}

export function useDemoModal(): DemoModalContextValue {
  const ctx = useContext(DemoModalContext);
  if (!ctx) {
    throw new Error("useDemoModal must be used inside <DemoModalProvider>");
  }
  return ctx;
}
```

- [ ] **Step 2: Wrap children in `app/providers.tsx`**

Replace the entire contents of `app/providers.tsx` with:

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { DemoModalProvider } from "@/components/site/DemoModalProvider";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DemoModalProvider>
          <Toaster />
          <Sonner />
          {children}
        </DemoModalProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 3: Build + lint**

Run:
```bash
npm run build 2>&1 | tail -10
npm run lint 2>&1 | tail -10
```
Expected: both pass.

- [ ] **Step 4: Commit**

Run:
```bash
git add components/site/DemoModalProvider.tsx app/providers.tsx
git commit -m "$(cat <<'EOF'
feat(site): add DemoModalProvider context

Provider mounts a single <DemoModal />. useDemoModal() exposes
open/close/isOpen to descendants. Nothing consumes it yet; page
modals keep working in parallel and migrate in Tasks 6–11.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Migrate `LegalPage` to `useDemoModal`

Smallest surface, do first so any issue surfaces cheaply.

**Files:** Modify `components/site/LegalPage.tsx`.

- [ ] **Step 1: Read current `LegalPage.tsx` once to confirm what's there**

Run:
```bash
sed -n '1,70p' components/site/LegalPage.tsx
```
Confirm: `useState(demoOpen)`, `<DemoModal />`, the Book-Demo button at line 27, the `<SiteFooter onOpenDemo={() => setDemoOpen(true)} />` callsite.

- [ ] **Step 2: Replace state + modal mount with context**

Make these edits in `components/site/LegalPage.tsx`:

a) Remove the `DemoModal` import (`import DemoModal from "./DemoModal";`).

b) Add this import:
```tsx
import { useDemoModal } from "./DemoModalProvider";
```

c) Remove `import { useState } from "react";` if it's only used for `demoOpen`. If `useState` is used elsewhere in the file, leave the import.

d) Inside the component, replace:
```tsx
  const [demoOpen, setDemoOpen] = useState(false);
```
with:
```tsx
  const { open: openDemo } = useDemoModal();
```

e) Replace every `() => setDemoOpen(true)` with `openDemo` (no arrow wrapper needed since `openDemo` is already a function). The header Book-Demo button currently at line 27 should now read:
```tsx
            <button onClick={openDemo} className="px-5 py-2.5 bg-primary text-primary-foreground text-base font-semibold rounded-lg hover:opacity-90 transition-opacity">Book Demo</button>
```

f) Update the `<SiteFooter>` callsite to:
```tsx
      <SiteFooter onOpenDemo={openDemo} />
```

g) Delete the line `<DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />`.

- [ ] **Step 3: Build + lint**

Run:
```bash
npm run build 2>&1 | tail -10
npm run lint 2>&1 | tail -10
```
Expected: both pass.

- [ ] **Step 4: Manual smoke**

Run `npm run dev`, open `/privacy`, click Book Demo in header, click Contact in footer — confirm both open the modal, closing once dismisses it (not two stacked modals). Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add components/site/LegalPage.tsx
git commit -m "$(cat <<'EOF'
refactor(legal): use DemoModal context instead of local state

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Migrate `AboutContent` to `useDemoModal`

**Files:** Modify `app/(site)/about/AboutContent.tsx`.

- [ ] **Step 1: Swap local modal state for context (edits a–g below)**

In `app/(site)/about/AboutContent.tsx`:

a) Remove `import DemoModal from "@/components/site/DemoModal";`.

b) Add `import { useDemoModal } from "@/components/site/DemoModalProvider";`.

c) Remove `useState` import IF only used for `demoOpen`.

d) Replace `const [demoOpen, setDemoOpen] = useState(false);` with `const { open: openDemo } = useDemoModal();`.

e) Replace every `() => setDemoOpen(true)` with `openDemo`. The Book-Demo buttons at lines 20 and 114 should now use `onClick={openDemo}`.

f) Update the `<SiteFooter>` callsite to `<SiteFooter onOpenDemo={openDemo} />`.

g) Delete `<DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />`.

- [ ] **Step 2: Build + lint**

```bash
npm run build 2>&1 | tail -10
npm run lint 2>&1 | tail -10
```
Expected: both pass.

- [ ] **Step 3: Manual smoke**

Run `npm run dev`, open `/about`, click every Book Demo button + the footer Contact button. Expected: same modal opens, closes cleanly. Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add "app/(site)/about/AboutContent.tsx"
git commit -m "$(cat <<'EOF'
refactor(about): use DemoModal context instead of local state

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Migrate `HomeContent` to `useDemoModal`

**Files:** Modify `app/(site)/HomeContent.tsx`.

- [ ] **Step 1: Swap local modal state for context (edits a–g below)**

In `app/(site)/HomeContent.tsx`:

a) Remove `import DemoModal from "@/components/site/DemoModal";`.

b) Add `import { useDemoModal } from "@/components/site/DemoModalProvider";`.

c) Remove `useState` import IF only used for `demoOpen`. (HomeContent has lots of state — likely keep the import.)

d) Replace `const [demoOpen, setDemoOpen] = useState(false);` (currently line 68) with `const { open: openDemo } = useDemoModal();`.

e) Replace every `() => setDemoOpen(true)` (currently lines 80, 95, 272) with `openDemo` — i.e. `onClick={openDemo}`.

f) Update the `<SiteFooter>` callsite (was added in Task 4a) to `<SiteFooter onOpenDemo={openDemo} />`.

g) Delete `<DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />` (was at line 292).

- [ ] **Step 2: Build + lint**

```bash
npm run build 2>&1 | tail -10
npm run lint 2>&1 | tail -10
```
Expected: both pass.

- [ ] **Step 3: Manual smoke**

Run `npm run dev`, open `/`, exercise every Book Demo button (hero, mid-page, final CTA) + footer Contact. Expected: modal opens reliably, dismisses cleanly. Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add "app/(site)/HomeContent.tsx"
git commit -m "$(cat <<'EOF'
refactor(home): use DemoModal context instead of local state

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Migrate `BlogIndex` to `useDemoModal`

**Files:** Modify `components/blog/BlogIndex.tsx`.

- [ ] **Step 1: Swap local modal state for context (edits a–g below)**

In `components/blog/BlogIndex.tsx`:

a) Remove the `DemoModal` import.

b) Add `import { useDemoModal } from "@/components/site/DemoModalProvider";`.

c) Remove `useState` import IF only used for `demoOpen`.

d) Replace local modal state with `const { open: openDemo } = useDemoModal();`.

e) Replace every Book Demo `onClick={() => setDemoOpen(true)}` with `onClick={openDemo}`.

f) Update the existing `<SiteFooter onOpenDemo={() => setDemoOpen(true)} />` callsite at line 74 to `<SiteFooter onOpenDemo={openDemo} />`.

g) Delete the page-level `<DemoModal />` mount.

- [ ] **Step 2: Build + lint**

```bash
npm run build 2>&1 | tail -10
npm run lint 2>&1 | tail -10
```
Expected: both pass.

- [ ] **Step 3: Manual smoke**

Run `npm run dev`, open `/blog`, click any Book Demo button + footer Contact. Expected: modal opens once, closes cleanly. Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add components/blog/BlogIndex.tsx
git commit -m "$(cat <<'EOF'
refactor(blog): use DemoModal context in BlogIndex

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Migrate `ArticleShell` to `useDemoModal`

**Files:** Modify `components/blog/ArticleShell.tsx`.

- [ ] **Step 1: Swap local modal state for context (edits a–f below)**

In `components/blog/ArticleShell.tsx`:

a) Remove the `DemoModal` import.

b) Add `import { useDemoModal } from "@/components/site/DemoModalProvider";`.

c) Remove `useState` import IF only used for `demoOpen`.

d) Replace `const [demoOpen, setDemoOpen] = useState(false);` and the `const openDemo = () => setDemoOpen(true);` helper (currently around lines 42–43) with:
```tsx
  const { open: openDemo } = useDemoModal();
```

e) Update the `<SiteFooter onOpenDemo={openDemo} />` callsite at line 89 — no change needed if `openDemo` is now the context function with the same shape.

f) Delete `<DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />` (was at line 90).

- [ ] **Step 2: Build + lint**

```bash
npm run build 2>&1 | tail -10
npm run lint 2>&1 | tail -10
```
Expected: both pass.

- [ ] **Step 3: Manual smoke**

Run `npm run dev`, open `/blog/shadow-ai-audit-workflows`, click in-article Book Demo CTAs + footer Contact. Expected: modal opens reliably. Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add components/blog/ArticleShell.tsx
git commit -m "$(cat <<'EOF'
refactor(blog): use DemoModal context in ArticleShell

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Migrate `NewsPage` to `useDemoModal`

**Files:** Modify `components/news/NewsPage.tsx`.

- [ ] **Step 1: Swap local modal state for context (edits a–g below)**

In `components/news/NewsPage.tsx`:

a) Remove `import DemoModal from "@/components/site/DemoModal";` (currently line 8).

b) Add `import { useDemoModal } from "@/components/site/DemoModalProvider";`.

c) Remove `useState` import IF only used for `demoOpen`. NewsPage uses other state — likely keep the import.

d) Replace local modal state with `const { open: openDemo } = useDemoModal();`.

e) Replace every Book Demo `onClick={() => setDemoOpen(true)}` with `onClick={openDemo}`.

f) Update the existing `<SiteFooter onOpenDemo={() => setDemoOpen(true)} />` at line 61 to `<SiteFooter onOpenDemo={openDemo} />`.

g) Delete the page-level `<DemoModal />` mount.

- [ ] **Step 2: Build + lint**

```bash
npm run build 2>&1 | tail -10
npm run lint 2>&1 | tail -10
```
Expected: both pass.

- [ ] **Step 3: Manual smoke**

Run `npm run dev`, open `/news`, exercise any Book Demo + footer Contact. Expected: modal opens reliably. Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add components/news/NewsPage.tsx
git commit -m "$(cat <<'EOF'
refactor(news): use DemoModal context in NewsPage

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Cutover — layout renders the footer, drop the prop, remove page-level `<SiteFooter>` renders

This is the only atomic moment where layout + page renders could overlap. Every change in this task ships in ONE commit. Build catches drift via TypeScript (SiteFooter's prop becomes invalid, forcing all callsites to be updated together).

**Files:**
- Create: `app/(site)/layout.tsx`
- Modify: `components/site/SiteFooter.tsx`
- Modify: `app/(site)/HomeContent.tsx`
- Modify: `app/(site)/about/AboutContent.tsx`
- Modify: `components/site/LegalPage.tsx`
- Modify: `components/blog/BlogIndex.tsx`
- Modify: `components/blog/ArticleShell.tsx`
- Modify: `components/news/NewsPage.tsx`

- [ ] **Step 1: Modify `SiteFooter.tsx` to drop the prop and use context**

Replace the entire file `components/site/SiteFooter.tsx` with:

```tsx
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
```

- [ ] **Step 2: Create the `(site)` sub-layout**

Write the new file `app/(site)/layout.tsx`:

```tsx
// Sub-layout for the (site) route group. Renders the shared SiteFooter after
// every marketing page's children so /, /about, /blog, /news, /privacy, /terms,
// and any future page added under (site) get the footer with zero per-page
// wiring. Created 2026-05-31.

import SiteFooter from "@/components/site/SiteFooter";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SiteFooter />
    </>
  );
}
```

- [ ] **Step 3: Remove `<SiteFooter onOpenDemo={openDemo} />` from `app/(site)/HomeContent.tsx`**

Delete the line that reads `<SiteFooter onOpenDemo={openDemo} />`. Do not delete anything else.

- [ ] **Step 4: Remove `<SiteFooter onOpenDemo={openDemo} />` from `app/(site)/about/AboutContent.tsx`**

Delete the same line in this file.

- [ ] **Step 5: Remove `<SiteFooter onOpenDemo={openDemo} />` from `components/site/LegalPage.tsx`**

Delete the same line in this file.

- [ ] **Step 6: Remove `<SiteFooter onOpenDemo={openDemo} />` from `components/blog/BlogIndex.tsx`**

Delete the same line in this file.

- [ ] **Step 7: Remove `<SiteFooter onOpenDemo={openDemo} />` from `components/blog/ArticleShell.tsx`**

Delete the same line in this file.

- [ ] **Step 8: Remove `<SiteFooter onOpenDemo={openDemo} />` from `components/news/NewsPage.tsx`**

Delete the same line in this file.

- [ ] **Step 9: Search for stragglers**

Run:
```bash
grep -rn "<SiteFooter" app components 2>/dev/null
grep -rn "from \"@/components/site/SiteFooter\"" app components 2>/dev/null
```
Expected for the first command: ONLY `app/(site)/layout.tsx`.
Expected for the second command: ONLY `app/(site)/layout.tsx`.

If anything else appears, remove the stale `<SiteFooter>` render and the now-unused import from that file before continuing.

- [ ] **Step 10: Remove unused `SiteFooter` imports from the 6 pages**

In each of the 6 page files modified above (HomeContent, AboutContent, LegalPage, BlogIndex, ArticleShell, NewsPage), confirm that `SiteFooter` is no longer referenced and remove its `import` line. Also verify the `grep` in Step 9 returns nothing besides the layout.

- [ ] **Step 11: Build + lint**

```bash
npm run build 2>&1 | tail -20
npm run lint 2>&1 | tail -20
```
Expected: build succeeds, lint baseline unchanged. If the build fails on a `<SiteFooter onOpenDemo=...>` callsite, fix the file the error points to (you missed one) and re-run.

- [ ] **Step 12: Manual full sweep**

Run `npm run dev`. Open each URL in turn and confirm: exactly ONE footer, link order **About · News · Blog · Privacy · Terms · Contact**, Contact opens demo modal, every Book Demo button still opens the same modal.

- http://localhost:3000/
- http://localhost:3000/about
- http://localhost:3000/blog
- http://localhost:3000/blog/shadow-ai-audit-workflows
- http://localhost:3000/news
- http://localhost:3000/privacy
- http://localhost:3000/terms

Also confirm these are UNCHANGED (still showing their old footers, not the new one):

- http://localhost:3000/legacy
- http://localhost:3000/compare/caseware

Stop dev server.

- [ ] **Step 13: Commit**

```bash
git add "app/(site)/layout.tsx" \
        components/site/SiteFooter.tsx \
        "app/(site)/HomeContent.tsx" \
        "app/(site)/about/AboutContent.tsx" \
        components/site/LegalPage.tsx \
        components/blog/BlogIndex.tsx \
        components/blog/ArticleShell.tsx \
        components/news/NewsPage.tsx
git commit -m "$(cat <<'EOF'
refactor(site): render SiteFooter from (site) layout, drop per-page renders

SiteFooter now consumes DemoModal context directly and takes no
props. app/(site)/layout.tsx renders it after every marketing
page's children, so /, /about, /blog, /news, /privacy, /terms,
and blog articles all get the same footer in one place. Future
pages added under (site)/ get the footer with zero extra wiring.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: Final verification + open PR

**Files:** none modified — verification only.

- [ ] **Step 1: Final lint + build**

```bash
npm run lint 2>&1 | tail -20
npm run build 2>&1 | tail -30
```
Expected: both clean against baseline.

- [ ] **Step 2: Confirm no orphan `useState(demoOpen)` or `<DemoModal>` references remain in migrated files**

```bash
grep -rn "demoOpen\|setDemoOpen" "app/(site)" components/site components/blog components/news 2>/dev/null
grep -rn "<DemoModal " "app/(site)" components/site components/blog components/news 2>/dev/null
```
Expected for the first command: no matches.
Expected for the second command: ONLY `components/site/DemoModalProvider.tsx` (the single sanctioned mount).

If anything else appears, audit it and remove. Re-run build + lint before committing the cleanup.

- [ ] **Step 3: Confirm `/legacy` and `/compare/caseware` are untouched**

```bash
git diff main -- app/legacy app/compare components/landing/Footer.tsx components/landing/DemoModal.tsx components/compare/CompareDemoModal.tsx
```
Expected: no diff (these were explicitly out of scope).

- [ ] **Step 4: Confirm final commit history is clean**

```bash
git log main..HEAD --oneline
```
Expected: 14 commits ahead of `main`. That's 1 spec commit (already on the branch) + 13 implementation commits: Task 2 (move), Task 3 (reorder), Tasks 4a/4b/4c (3 commits), Tasks 5–11 (7 commits), Task 12 (cutover) = 13. If a task collapsed accidentally or a commit is missing, surface to the user before opening the PR.

- [ ] **Step 5: Push the branch and open a PR**

```bash
git push -u origin feature/shared-footer
gh pr create --title "feat(site): shared footer across all marketing pages" --body "$(cat <<'EOF'
## Summary
- Adds `app/(site)/` route group + `(site)/layout.tsx` so every Fi371 marketing page renders the same footer in one place
- New `DemoModalProvider` centralises the Book Demo modal — one mount for the whole app, opened via `useDemoModal()`
- Footer link order is now **About · News · Blog · Privacy · Terms · Contact** and the copyright year is dynamic
- Inline `<footer>` markup removed from `/`, `/about`, `/privacy`, `/terms`; `/blog`, `/news`, blog articles stop rendering `<SiteFooter />` themselves

`/legacy` and `/compare/caseware` are intentionally untouched — they keep the old AuditAI footer and a separate modal variant. Recommend a follow-up PR to retire or rebrand those surfaces.

## Test plan
- [x] `npm run lint` against project baseline (no new errors)
- [x] `npm run build` succeeds
- [x] Local visual sweep: `/`, `/about`, `/blog`, `/blog/shadow-ai-audit-workflows`, `/news`, `/privacy`, `/terms` — one footer each, new order, Contact opens modal, all Book Demo buttons open the same modal instance
- [x] `/legacy` and `/compare/caseware` unchanged

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: branch pushes, PR opens. Print PR URL to user.

- [ ] **Step 6: Self-review the PR**

Per global `CLAUDE.md`: open the PR, review your own diff, post the review as a PR comment. Flag anything uncertain (e.g. blog articles inheriting through ArticleShell — confirm one of them visually). Note tradeoffs (file moves look big in diff but URLs unchanged; `/legacy` + `/compare/caseware` left for follow-up).

---

## Post-implementation follow-ups (NOT in this plan)

- Replace or retire `components/landing/Footer.tsx`, `components/landing/DemoModal.tsx`, and the `/legacy` + `/compare/caseware` page surfaces (stale AuditAI brand, dead anchors).
- Consider extracting a `<BookDemoButton>` component now that the modal is global — would eliminate repeated `<button onClick={openDemo}>Book Demo</button>` markup across header and CTA sections.
