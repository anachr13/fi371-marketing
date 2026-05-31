# Shared Footer Across Marketing Pages — Design Spec

**Date:** 2026-05-31
**Author:** Claude (with anachr13)
**Status:** Approved — ready for implementation plan
**Branch:** `claude/kind-joliot-bdb559`

## Goal

One footer component, used everywhere on Fi371's public marketing pages. Single link order, single source of truth, future pages get it free.

Link order: **About · News · Blog · Privacy · Terms · Contact**

## Why

Today the same footer markup exists in four places with two different link orderings. Touching one means remembering to touch the others. Adding a new marketing page means copy-pasting footer markup again. Both invite drift.

## Scope

### In scope
- `/` (home)
- `/about`
- `/blog` and blog article pages (e.g. `/blog/shadow-ai-audit-workflows`)
- `/news`
- `/privacy`
- `/terms`
- Any future marketing page added under the same route group

### Out of scope
- `/legacy` — keeps its existing `components/landing/Footer.tsx` (stale "AuditAI" brand, dead anchors). Separate followup.
- `/compare/caseware` — same. Uses `CompareDemoModal` and a different brand surface. Separate followup.
- `/admin/news/` — admin tool, no marketing chrome.
- `/survey/240526/` — token-gated survey, intentionally minimal chrome.

## Architecture

Three structural changes:

### 1. Route group `app/(site)/`

Next.js App Router convention: a folder wrapped in parens is a logical grouping that does **not** appear in URLs. Pages move into the group but their URLs stay identical.

```
app/page.tsx              → app/(site)/page.tsx
app/HomeContent.tsx       → app/(site)/HomeContent.tsx
app/home-faqs.ts          → app/(site)/home-faqs.ts
app/about/                → app/(site)/about/
app/blog/                 → app/(site)/blog/        (whole subtree)
app/news/                 → app/(site)/news/        (whole subtree)
app/privacy/              → app/(site)/privacy/
app/terms/                → app/(site)/terms/
```

URLs unchanged. Metadata exports unaffected. Server components unaffected.

`/legacy`, `/compare`, `/admin`, `/survey` stay at the app root, outside the group, and so do not inherit the new layout.

### 2. `app/(site)/layout.tsx`

A new sub-layout. Renders `{children}` followed by `<SiteFooter />`. That single line wires the footer into every marketing page at once.

```tsx
// app/(site)/layout.tsx
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

Server component (no client directive needed — it has no state).

### 3. `DemoModalProvider` context

New client component: `components/site/DemoModalProvider.tsx`.

Mounts ONE `<DemoModal>` for the whole app. Exposes `useDemoModal()`:

```ts
const { open, close, isOpen } = useDemoModal();
```

Wrapped inside `app/providers.tsx` so it sits under React Query and Tooltip providers but above all page content:

```tsx
// app/providers.tsx (updated)
<QueryClientProvider client={queryClient}>
  <TooltipProvider>
    <DemoModalProvider>
      <Toaster />
      <Sonner />
      {children}
    </DemoModalProvider>
  </TooltipProvider>
</QueryClientProvider>
```

Calling `useDemoModal()` outside the provider throws a clear error (typed, dev-friendly).

## Component changes

### `components/site/SiteFooter.tsx`

| Change | Before | After |
|---|---|---|
| Link order | News · Blog · About · Privacy · Terms · Contact | **About · News · Blog · Privacy · Terms · Contact** |
| Year | Hardcoded `2026` | `new Date().getFullYear()` |
| `onOpenDemo` prop | Required prop | Removed — uses `useDemoModal().open` internally |
| Client/server | `"use client"` | `"use client"` (still needed for the button + hook) |

Styles (`max-w-[1500px]`, `text-base`, `border-t border-border py-10`, layout) are unchanged.

### `app/(site)/HomeContent.tsx`

- Delete inline `<footer>` block (currently lines 279–290).
- Delete `useState(demoOpen)` and `<DemoModal />` mount (lines 68, 292).
- Replace `() => setDemoOpen(true)` with `() => openDemo()` from `useDemoModal()` in all Book-Demo buttons (lines 80, 95, 272) and the now-removed Contact button.

### `app/(site)/about/AboutContent.tsx`

- Delete inline `<footer>` block (currently lines 124–134).
- Delete own `useState`/`<DemoModal />` (lines 11, 136).
- Switch Book-Demo callsites to `useDemoModal().open`.

### `components/site/LegalPage.tsx`

- Delete inline `<footer>` block (currently lines 47–57).
- Delete own `useState`/`<DemoModal />` (lines 18, 59).
- Switch the header Book-Demo button (line 27) to `useDemoModal().open`.

### `components/blog/BlogIndex.tsx`

- Drop `useState(demoOpen)` and `<DemoModal />` mount.
- Remove `<SiteFooter onOpenDemo={...} />` — the layout renders the footer now, so callsite is gone.
- Switch Book-Demo callsites to `useDemoModal().open`.

### `components/blog/ArticleShell.tsx`

- Same pattern: drop modal state, drop footer render, route demo opens through context.

### `components/news/NewsPage.tsx`

- Same pattern.

### `app/providers.tsx`

- Wrap children in `<DemoModalProvider>`.

## File summary

**New (3):**
- `app/(site)/layout.tsx`
- `components/site/DemoModalProvider.tsx`
- Route group folder `app/(site)/`

**Modified (8):**
1. `app/providers.tsx`
2. `components/site/SiteFooter.tsx`
3. `components/blog/ArticleShell.tsx`
4. `components/blog/BlogIndex.tsx`
5. `components/news/NewsPage.tsx`
6. `app/(site)/HomeContent.tsx` (was `app/HomeContent.tsx`)
7. `app/(site)/about/AboutContent.tsx`
8. `components/site/LegalPage.tsx`

**Moved (route group, no content edit beyond removing inline footers):**
- `app/page.tsx`, `app/HomeContent.tsx`, `app/home-faqs.ts`
- `app/about/` (all files)
- `app/blog/` (whole subtree)
- `app/news/` (whole subtree)
- `app/privacy/`
- `app/terms/`

**Explicitly untouched:**
- `app/legacy/` and `components/landing/Footer.tsx`
- `app/compare/caseware/` and `components/compare/CompareDemoModal.tsx`
- `app/admin/news/`
- `app/survey/240526/`
- `components/landing/DemoModal.tsx`

## Design decisions and tradeoffs

### Why a route group, not a global root-layout footer?
A footer in `app/layout.tsx` would appear on `/legacy`, `/compare/caseware`, `/admin/news/`, and `/survey/240526/` too. Those pages either have a different (stale) footer or no chrome by design. Route groups let us scope the new layout to just the marketing tree without runtime pathname checks.

### Why centralise `DemoModal` now?
The modal is mounted independently on 7 pages today (HomeContent, AboutContent, LegalPage, ArticleShell, BlogIndex, NewsPage, plus header CTAs). The shared footer needs to open it from a place that doesn't own the modal state, which forces the question. Centralising once is cleaner than threading `onOpenDemo` props through a layout.

### Why not also clean up `components/landing/Footer.tsx`?
Out of scope. `/legacy` and `/compare/caseware` use the old AuditAI brand and a different modal variant. Treating them is a separate decision: do we rebrand, retire, or hide them? Not for this change.

### Year handling
Dynamic `new Date().getFullYear()`. Hardcoded "2026" already drifts — fix it once while we're in the file.

## Risks and verification

| Risk | Mitigation |
|---|---|
| File moves break relative imports (`./home-faqs`, `./HomeContent`, `./AboutContent`) | All affected imports are sibling-relative and move together as a folder. Verified during build. |
| Static `generateMetadata` or JSON-LD breaks | Server functions don't depend on folder structure. `alternates.canonical: "/"` and friends are absolute paths and stay correct. |
| A Book-Demo button stops opening the modal | Walk all 7 call-sites during implementation and confirm each calls `useDemoModal().open()`. |
| Double footer renders briefly in PR (layout + inline) | Strip inline footers in the same commit that moves files into `(site)/` and adds the layout. Don't split. |
| `useDemoModal()` called outside provider in some path | Provider throws a typed error with a clear message; surfaces at first hit. |
| Hydration mismatch on `new Date().getFullYear()` | Year is stable within a request; harmless. |

### Verification gates

Per the project `CLAUDE.md`:

1. **Lint** — `npm run lint` (baseline ~13 errors in shadcn boilerplate; no NEW errors introduced).
2. **Build** — `npm run build` must succeed (tsc gate).
3. **Local visual sweep** — `npm run dev`, then open and confirm:
   - `/` → footer order is About · News · Blog · Privacy · Terms · Contact; Contact opens demo modal; header Book-Demo button still opens the same modal.
   - `/about`, `/blog`, `/blog/shadow-ai-audit-workflows`, `/news`, `/privacy`, `/terms` → same footer order, same Contact behaviour.
   - `/legacy` and `/compare/caseware` → unchanged (still show their existing footers).
   - `/admin/news/` and `/survey/240526/` → unchanged (no new footer).
4. **No regression of existing routes** — every URL listed in §Scope still returns 200 with the same metadata.

## Open follow-ups (out of this change)

- Replace or retire `/legacy` and `/compare/caseware` AuditAI-era footers and modals.
- Consider extracting a shared `<BookDemoButton>` component now that the modal is global — would eliminate the repeated `<button onClick={openDemo}>Book Demo</button>` markup across pages.

## Next step

Hand to `superpowers:writing-plans` to break this into ordered, verifiable implementation steps.
